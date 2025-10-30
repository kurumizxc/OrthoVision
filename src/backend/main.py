from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI, UploadFile, File, Request
from fastapi.responses import JSONResponse
from PIL import Image
from io import BytesIO
from dotenv import load_dotenv
import os
from orthovision.load_model import load_model

# Load environment variables from .env (e.g., HF_TOKEN)
load_dotenv()

# Create FastAPI app and attach lifespan that loads models on startup
app = FastAPI(
    title="OrthoVision Backend",
    version="0.1.0",
    lifespan=load_model
)

# Configure CORS
allowed_origins = ["https://orthovision.vercel.app", "http://localhost:3000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/")
async def read_root():
    return {"message": "OrthoVision backend running successfully!"}

# Fracture detection endpoint
@app.post("/detect")
async def detect_fracture(request: Request, image: UploadFile = File(...)):
    # Run fracture detection on an uploaded X-ray image.
    try:
        # Read uploaded file and open as PIL image
        contents = await image.read()
        pil_image = Image.open(BytesIO(contents))
        # Extract dimensions for frontend rendering
        width, height = pil_image.size
        # Run inference using the app-scoped model
        result = request.app.state.model.process_image(pil_image)
        return JSONResponse({
            "class": result["class"],
            "confidence": f"{result['confidence'] * 100:.2f}%",
            "recommendation": result["recommendation"],
            "imageWidth": width,
            "imageHeight": height,
            "detections": result["detections"]
        })
    except Exception as e:
        # Log full traceback for debugging and return 500 error
        import traceback
        print(f"Error processing image: {e}")
        print(traceback.format_exc())
        return JSONResponse(status_code=500, content={"error": str(e)})

# - Loads environment variables (dotenv) and configures CORS using FRONTEND_URL.
# - Creates the FastAPI application and attaches a lifespan handler that
#   loads ML models at startup via orthovision.load_model.load_model and
#   exposes the detector on app.state.model.
# - Exposes endpoints:
#   - GET /          : Health check
#   - POST /detect   : Accepts an image file and returns classification,
#                      confidence, recommendation, image dimensions, and detections.
