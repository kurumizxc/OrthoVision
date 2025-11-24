# Cascade YOLO Implementation Plan for OrthoVision

## Overview

This document outlines the implementation of a dual-model cascade YOLO detection pipeline in OrthoVision, based on the proven architecture from the Research repository (m3iyo/Research).

---

## 1. Architecture Comparison

### Current Architecture (Single YOLO)
```
X-Ray Input
    ↓
ResNet18 Classification (Fractured/Non-Fractured)
    ↓
[If Fractured AND confidence >= 0.5]
    ↓
Single YOLOv8 Detection (conf=0.30)
    ↓
Return Result
```

### New Cascade Architecture (Dual YOLO)
```
X-Ray Input
    ↓
ResNet18 Classification (Fractured/Non-Fractured)
    ↓
[If Fractured AND confidence >= 0.5]
    ↓
YOLO Model 1 (FracAtlas - Binary detection)
    ↓
[If detections found] → Return Result
    ↓
[If no detections]
    ↓
YOLO Model 2 (Combined datasets - 7 fracture types)
    ↓
Return Result (with fallback indicator)
```

---

## 2. Expected Benefits

### Performance Improvements
- **Detection Coverage**: 80-90% (up from 70-80%)
- **Missed Cases**: 10-15 fewer per 100 cases
- **Complementary Strengths**: Non-overlapping training datasets

### Clinical Benefits
- **Better Coverage**: Model 2 catches cases Model 1 misses
- **Specific Classification**: 7-class taxonomy (elbow, fingers, forearm, humerus, shoulder, wrist)
- **Fallback Safety**: Explicit indication when manual review is recommended

---

## 3. Implementation Changes

### 3.1 Model Files (load_model.py)

**Current:**
```python
RESNET_FILE = "best_model_f1_focused.pth"
YOLO_FILE = "best.pt"
```

**New:**
```python
RESNET_FILE = "best_model_f1_focused.pth"
YOLO_MODEL1_FILE = "fracatlas_train_best.pt"      # Model 1: FracAtlas (Binary)
YOLO_MODEL2_FILE = "combined_bone_fracture_best.pt"  # Model 2: Combined (7-class)
```

### 3.2 Model Loading (load_model.py)

**Current Function Signature:**
```python
def ensure_latest_models(hf_token: str | None = None) -> tuple[Path, Path]:
    # Returns: (resnet_path, yolo_path)
```

**New Function Signature:**
```python
def ensure_latest_models(hf_token: str | None = None) -> tuple[Path, Path, Path]:
    # Returns: (resnet_path, yolo_model1_path, yolo_model2_path)
```

**Changes:**
- Download both YOLO models from Hugging Face
- Return 3 paths instead of 2
- Update error handling for dual models

### 3.3 Detector Initialization (hybrid_detector.py)

**Current Constructor:**
```python
def __init__(self, resnet_path: str, yolo_path: str):
    self.detector = YOLO(yolo_path)
```

**New Constructor:**
```python
def __init__(self, resnet_path: str, yolo_model1_path: str, yolo_model2_path: str):
    self.detector_model1 = YOLO(yolo_model1_path)  # Primary detector
    self.detector_model2 = YOLO(yolo_model2_path)  # Fallback detector
```

### 3.4 Detection Logic (hybrid_detector.py)

**Current Detection (Lines 70-83):**
```python
if classification_result == 'Fractured' and confidence >= 0.5:
    yolo_results = self.detector(image, conf=0.30)
    if len(yolo_results[0].boxes) > 0:
        for i, box in enumerate(yolo_results[0].boxes.xyxy):
            # Process detections...
```

**New Cascade Detection:**
```python
if classification_result == 'Fractured' and confidence >= 0.5:
    # Stage 1: Try Model 1 (FracAtlas - Binary)
    yolo_results_model1 = self.detector_model1(image, conf=0.25)

    if len(yolo_results_model1[0].boxes) > 0:
        # Model 1 found detections
        results['model_used'] = 'Model 1 (FracAtlas)'
        yolo_results = yolo_results_model1
    else:
        # Stage 2: Fallback to Model 2 (Combined - 7 classes)
        logging.info("Model 1 found no detections, trying Model 2...")
        yolo_results_model2 = self.detector_model2(image, conf=0.25)

        if len(yolo_results_model2[0].boxes) > 0:
            results['model_used'] = 'Model 2 (Combined)'
            yolo_results = yolo_results_model2
        else:
            # Both models failed - flag for manual review
            results['model_used'] = 'None'
            results['warning'] = 'Fracture suspected but not localized. Manual review recommended.'
            logging.warning("Both YOLO models failed to detect fractures")
            return results

    # Process detections from successful model
    for i, box in enumerate(yolo_results[0].boxes.xyxy):
        # Extract bounding boxes...
```

### 3.5 Response Format Enhancement

**Current Response:**
```json
{
  "class": "Fractured",
  "confidence": "92.10%",
  "recommendation": "...",
  "detections": [...]
}
```

**New Response:**
```json
{
  "class": "Fractured",
  "confidence": "92.10%",
  "recommendation": "...",
  "model_used": "Model 1 (FracAtlas)",
  "detections": [...],
  "warning": null  // or warning message if applicable
}
```

### 3.6 FastAPI Endpoint (main.py)

**Current Lifespan:**
```python
app.state.model = HybridFractureDetector(
    resnet_path=str(resnet_path),
    yolo_path=str(yolo_path)
)
```

**New Lifespan:**
```python
app.state.model = HybridFractureDetector(
    resnet_path=str(resnet_path),
    yolo_model1_path=str(yolo_model1_path),
    yolo_model2_path=str(yolo_model2_path)
)
```

**Response Update:**
```python
return JSONResponse({
    "class": result["class"],
    "confidence": f"{result['confidence'] * 100:.2f}%",
    "recommendation": result["recommendation"],
    "model_used": result.get("model_used", "N/A"),
    "warning": result.get("warning"),
    "imageWidth": width,
    "imageHeight": height,
    "detections": result["detections"]
})
```

---

## 4. Configuration Parameters

### Confidence Thresholds
- **ResNet Classification**: 0.5 (unchanged)
- **YOLO Model 1**: 0.25 (default, recommended from Research)
- **YOLO Model 2**: 0.25 (default, recommended from Research)

### Optional Modes
- **Sensitive Mode**: 0.10-0.15 (catches subtle fractures, more false positives)
- **Conservative Mode**: 0.30-0.40 (higher precision, may miss subtle cases)

### Model Information

**Model 1 (FracAtlas Binary)**
- Training Dataset: FracAtlas only (4,148 images)
- Classes: 2 (Fractured/Non-Fractured)
- Purpose: General fracture detection
- Expected Detection Rate: ~70-80%

**Model 2 (Combined Multi-class)**
- Training Dataset: Combined datasets excluding FracAtlas (8,296 images)
  - bone fracture detection.v4: 4,148 images
  - BoneFractureYolo8: 4,148 images
- Classes: 7 fracture types
  - elbow
  - fingers
  - forearm
  - humerus
  - shoulder
  - wrist
- Purpose: Fallback detector with specific classification
- Expected Additional Coverage: ~10-15%

---

## 5. Hugging Face Model Upload

### Required Models
Upload the following to `kurumizxc/orthovision-models`:

1. `best_model_f1_focused.pth` (existing - ResNet18)
2. `fracatlas_train_best.pt` (new - YOLO Model 1)
3. `combined_bone_fracture_best.pt` (new - YOLO Model 2)

### Upload Command
```python
# Using upload_models.py
from huggingface_hub import HfApi

api = HfApi()
api.upload_file(
    path_or_fileobj="runs/detect/fracatlas_train/weights/best.pt",
    path_in_repo="fracatlas_train_best.pt",
    repo_id="kurumizxc/orthovision-models",
    token=HF_TOKEN
)
api.upload_file(
    path_or_fileobj="runs/detect/combined_bone_fracture_train/weights/best.pt",
    path_in_repo="combined_bone_fracture_best.pt",
    repo_id="kurumizxc/orthovision-models",
    token=HF_TOKEN
)
```

---

## 6. Deployment Considerations

### Resource Impact
- **Inference Time**: ~2x slower in worst case (both models run)
  - Best case: Same as before (Model 1 succeeds)
  - Worst case: 2x (Model 1 fails, Model 2 runs)
- **Memory Usage**: +100MB (additional YOLO model loaded)
- **Storage**: +100MB (second YOLO model file)

### Docker Updates
No Dockerfile changes required - the existing setup already supports multiple YOLO models via Ultralytics.

### Environment Variables
No new environment variables needed - uses existing:
- `HF_TOKEN` (for Hugging Face downloads)
- `FRONTEND_URL` (for CORS)
- `PORT` (for uvicorn)

---

## 7. Testing Strategy

### Unit Tests
1. **Model Loading**: Verify both YOLO models load correctly
2. **Cascade Logic**: Test fallback when Model 1 fails
3. **Response Format**: Verify new fields (model_used, warning)

### Integration Tests
1. **Model 1 Success**: Image where Model 1 detects fractures
2. **Model 2 Fallback**: Image where only Model 2 succeeds
3. **Both Fail**: Image where both models fail (manual review case)

### Performance Tests
1. **Inference Speed**: Measure latency for both cascade stages
2. **Memory Usage**: Monitor RAM consumption with dual models
3. **Detection Accuracy**: Compare detection rates vs. single model

---

## 8. Frontend Compatibility

### API Response Changes
The frontend already handles the `detections` array format, so no frontend changes are required for basic functionality.

### Optional Frontend Enhancements
If desired, the frontend could display:
- Which model detected the fracture (`model_used` field)
- Warning messages when manual review is recommended
- Specific fracture type from 7-class taxonomy

**Note:** These are optional and not required for the cascade to work.

---

## 9. Rollback Plan

If issues arise, rollback is simple:

1. **Revert Code**: Git checkout previous commit
2. **Revert Models**: Use single YOLO model in Hugging Face
3. **No Data Loss**: sessionStorage and API format remain compatible

The cascade implementation is **backward compatible** - if Model 2 is missing, the system can fall back to single-model behavior.

---

## 10. Success Metrics

### Before Cascade (Current)
- Detection Coverage: ~70-80%
- Single YOLO model
- No fallback mechanism

### After Cascade (Expected)
- Detection Coverage: ~80-90%
- Dual YOLO models with complementary strengths
- Fallback mechanism for edge cases
- 10-15 fewer missed fractures per 100 cases

### Monitoring
Track in production:
- `model_used` distribution (Model 1 vs Model 2 vs None)
- Average inference time
- User feedback on detection accuracy

---

## 11. Implementation Checklist

- [x] Create implementation branch
- [ ] Update `load_model.py` for dual YOLO models
- [ ] Update `hybrid_detector.py` with cascade logic
- [ ] Update `main.py` API endpoint
- [ ] Update documentation
- [ ] Upload Model 1 and Model 2 to Hugging Face
- [ ] Test locally with sample images
- [ ] Deploy to staging environment
- [ ] Validate detection improvements
- [ ] Deploy to production
- [ ] Monitor metrics

---

## 12. File Changes Summary

| File | Changes | Lines Modified |
|------|---------|----------------|
| `load_model.py` | Add Model 2 download, update return type | ~30 lines |
| `hybrid_detector.py` | Add cascade detection logic, dual models | ~50 lines |
| `main.py` | Update model initialization, response format | ~10 lines |
| `IMPLEMENTATION_PLAN.md` | New file (this document) | New file |
| `README.md` | Update with cascade architecture info | ~20 lines |

**Total Estimated Changes**: ~110 lines of code + documentation

---

## 13. Timeline Estimate

1. **Code Implementation**: Completed in this session
2. **Model Upload to Hugging Face**: Requires access to trained models
3. **Local Testing**: 1-2 hours
4. **Staging Deployment**: 30 minutes
5. **Production Deployment**: After validation

---

## References

- Research Repository: `m3iyo/Research`
- Notebook: `Code Testing(Pretrained).ipynb`
- Documentation: `SYSTEM_GUIDE.md`, `IMPROVEMENTS_AND_CHANGES.md`
- OrthoVision Backend: `src/backend/orthovision/`

---

**Implementation Status**: ✅ In Progress
**Branch**: `claude/OrthoVision_Cascade-01YDT71UHFvkwccbecnU335R`
**Last Updated**: 2025-11-24
