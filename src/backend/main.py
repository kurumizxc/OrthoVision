from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from PIL import Image
from io import BytesIO
from orthovision.hybrid_detector import HybridFractureDetector


app = FastAPI(title="OrthoVision Backend", version="0.1.0")

# Configure permissive CORS for development. Tighten in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with specific origins in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Load Models Once on Startup ---
model = HybridFractureDetector(
    resnet_path="models/best_model_f1_focused.pth",
    yolo_path="models/best.pt"
)


@app.get("/")
async def read_root():
    """Health endpoint to verify the API is running."""
    return {"message": "Hello, World!"}

@app.post("/detect")
async def detect_fracture(image: UploadFile = File(...)):
    """
    Detect fractures in an uploaded X-ray image.

    Args:
        image: Uploaded image file (JPEG/PNG).

    Returns:
        JSON with:
        - class: "Fractured" | "Non Fractured"
        - confidence: formatted percentage string (e.g., "91.23%")
        - recommendation: follow-up guidance based on classification
        - imageWidth / imageHeight: dimensions extracted from the uploaded image
        - detections: list of bounding boxes when fractured and confident enough
    """
    try:
        contents = await image.read()
        pil_image = Image.open(BytesIO(contents))

        # Get image dimensions
        width, height = pil_image.size

        # Process image to get classification and detections
        result = model.process_image(pil_image)

        # Return only detection data - frontend handles image display
        return JSONResponse({
            "class": result["class"],
            "confidence": f"{result['confidence'] * 100:.2f}%",
            "recommendation": result["recommendation"],
            "imageWidth": width,
            "imageHeight": height,
            "detections": result["detections"]
        })

    except Exception as e:
        import traceback
        print(f"Error processing image: {str(e)}")
        print(traceback.format_exc())
        return JSONResponse(status_code=500, content={"error": str(e)})

