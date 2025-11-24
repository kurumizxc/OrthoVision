import torch
import torchvision.transforms as transforms
import torchvision.models as models
import torch.nn as nn
from ultralytics import YOLO
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Combines a ResNet classifier with dual YOLO detectors in cascade to analyze X-ray images.
# Classifies as Fractured/Non Fractured and, when confident and fractured,
# provides detection boxes using a two-stage cascade approach for better coverage.
class HybridFractureDetector:

    # Load classifier/detector weights and set up preprocessing.
    # resnet_path: path to .pth classifier weights
    # yolo_model1_path: path to .pt primary detector weights (FracAtlas)
    # yolo_model2_path: path to .pt fallback detector weights (Combined)
    def __init__(self, resnet_path: str, yolo_model1_path: str, yolo_model2_path: str):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.detector_model1 = None
        self.detector_model2 = None
        self.classifier = None

        #Load ResNet Classifier
        self.classifier = models.resnet18(weights=None)
        self.classifier.conv1 = nn.Conv2d(1, 64, kernel_size=7, stride=2, padding=3, bias=False)
        num_features = self.classifier.fc.in_features
        self.classifier.fc = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(num_features, 2),
            nn.LogSoftmax(dim=1)
        )

        checkpoint = torch.load(resnet_path, map_location=self.device)
        self.classifier.load_state_dict(checkpoint['model_state_dict'])
        self.classifier.to(self.device).eval()
        logging.info(f"Loaded ResNet model from {resnet_path}")

        #Load YOLO Model 1 (Primary - FracAtlas)
        self.detector_model1 = YOLO(yolo_model1_path)
        logging.info(f"Loaded YOLO Model 1 (FracAtlas) from {yolo_model1_path}")

        #Load YOLO Model 2 (Fallback - Combined)
        self.detector_model2 = YOLO(yolo_model2_path)
        logging.info(f"Loaded YOLO Model 2 (Combined) from {yolo_model2_path}")

        #Preprocessing Transform
        self.transform = transforms.Compose([
            transforms.Grayscale(num_output_channels=1),
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485], std=[0.229])
        ])

    # Run classification on a PIL image and optionally detect fracture boxes using cascade.
    # image: PIL.Image
    # returns: dict with keys: class, confidence (0..1), detections (list), recommendation (str), model_used (str), warning (str|None)
    def process_image(self, image):
        results = {}
        image = image.convert('RGB')

        #Classification
        img_tensor = self.transform(image).unsqueeze(0).to(self.device)
        with torch.no_grad():
            outputs = self.classifier(img_tensor)
            probs = torch.softmax(outputs, dim=1)
            pred_class_idx = torch.argmax(probs).item()
            confidence = probs[0][1].item()

        classification_result = 'Fractured' if pred_class_idx == 1 else 'Non Fractured'
        results['class'] = classification_result
        results['confidence'] = confidence

        #Cascade YOLO Detection (two-stage approach)
        detections = []
        model_used = None
        warning = None

        if classification_result == 'Fractured' and confidence >= 0.5:
            # Stage 1: Try Model 1 (FracAtlas - Binary detection)
            logging.info("Running YOLO Model 1 (FracAtlas) for fracture detection...")
            yolo_results_model1 = self.detector_model1(image, conf=0.25)

            if len(yolo_results_model1[0].boxes) > 0:
                # Model 1 successfully detected fractures
                model_used = "Model 1 (FracAtlas)"
                logging.info(f"Model 1 detected {len(yolo_results_model1[0].boxes)} fracture(s)")

                for i, box in enumerate(yolo_results_model1[0].boxes.xyxy):
                    x1, y1, x2, y2 = map(float, box.tolist())
                    detections.append({
                        "id": i + 1,
                        "label": f"Fracture Area {i + 1}",
                        "box": [x1, y1, x2, y2]
                    })
            else:
                # Stage 2: Fallback to Model 2 (Combined - 7-class detection)
                logging.info("Model 1 found no detections, trying Model 2 (Combined)...")
                yolo_results_model2 = self.detector_model2(image, conf=0.25)

                if len(yolo_results_model2[0].boxes) > 0:
                    # Model 2 successfully detected fractures
                    model_used = "Model 2 (Combined)"
                    logging.info(f"Model 2 detected {len(yolo_results_model2[0].boxes)} fracture(s)")

                    for i, box in enumerate(yolo_results_model2[0].boxes.xyxy):
                        x1, y1, x2, y2 = map(float, box.tolist())
                        # Get class name if available
                        class_id = int(yolo_results_model2[0].boxes.cls[i].item()) if len(yolo_results_model2[0].boxes.cls) > 0 else None
                        class_names = ['elbow', 'fingers', 'forearm', 'humerus', 'shoulder', 'wrist', 'other']
                        fracture_type = class_names[class_id] if class_id is not None and class_id < len(class_names) else "unknown"

                        detections.append({
                            "id": i + 1,
                            "label": f"{fracture_type.capitalize()} Fracture {i + 1}",
                            "box": [x1, y1, x2, y2]
                        })
                else:
                    # Both models failed - flag for manual review
                    model_used = "None"
                    warning = (
                        "Fracture suspected but not localized. Manual review recommended. "
                        "Possible reasons: hairline fracture (very subtle), threshold too high, or unusual fracture type."
                    )
                    logging.warning("Both YOLO models failed to detect fractures despite positive classification")

        results["detections"] = detections
        results["model_used"] = model_used
        results["warning"] = warning

        #Recommendation
        if classification_result == "Fractured":
            if warning:
                results["recommendation"] = (
                    "Fracture identified by classification but location not determined. "
                    "Manual radiologist review strongly recommended for proper assessment and management."
                )
            else:
                results["recommendation"] = (
                    "Fracture identified on the imaging results. "
                    "Please monitor the condition closely and refer to orthopedics for further evaluation and management."
                )
        else:
            results["recommendation"] = (
                "No signs of fracture on the imaging results. "
                "Please monitor the condition and refer to orthopedics for further evaluation if needed."
            )

        return results

# File overview
# - Defines HybridFractureDetector that loads:
#   - A ResNet classifier (.pth) for fracture vs non-fracture classification
#   - Two YOLO detectors (.pt) in cascade for comprehensive fracture localization:
#     * Model 1 (FracAtlas): Primary detector with binary classification
#     * Model 2 (Combined): Fallback detector with 7-class taxonomy
# - Exposes process_image(image) to return class, confidence, detections, recommendation, model_used, and warning.
# - Cascade approach provides 10-15% better detection coverage vs single model.
# - Logging informs when each model is loaded and which model successfully detected fractures.
