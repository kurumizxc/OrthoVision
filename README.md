# OrthoVision

A full‑stack assistive application for X‑ray fracture detection.

- Frontend: Next.js 14 (App Router), React 18, Tailwind CSS, shadcn/ui
- Backend: FastAPI, Uvicorn, Pillow, OpenCV, PyTorch, Ultralytics YOLO
- Models: Pulled from Hugging Face at startup

## Project Structure

```
OrthoVision/
├─ src/
│  ├─ frontend/           # Next.js app (App Router)
│  └─ backend/            # FastAPI app and ML code
│     ├─ main.py          # FastAPI entrypoint
│     ├─ requirements.txt # Python dependencies
│     ├─ models/          # Model storage folder
│     └─ orthovision/
│        ├─ load_model.py # HF sync + model lifecycle
│        └─ hybrid_detector.py
└─ README.md
```

## Prerequisites

### System Requirements

- **Node.js** 18+ (with npm, yarn, or pnpm)
- **Python** 3.10+
- **Git** (for cloning the repository)

### Optional

- Hugging Face account & access token (if using a private model repository)

### For Evaluators: Model

1. Download the model from this [Google Drive folder](https://drive.google.com/drive/folders/1iIxhkTjVSNPm36kcNdEpbsYbgZsRQlTv?usp=drive_link)
2. Place the model files in the `src/backend/models/` folder
3. Ensure the folder structure matches the backend's expected model layout

## Environment Variables

Create separate `.env` files for frontend and backend.

### Frontend (src/frontend/.env.local)

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (project root or src/backend/.env)

```
FRONTEND_URL=http://localhost:3000
HF_TOKEN=<your_hf_token>  # Only if using a private Hugging Face repo
```

**Notes:**

- The backend allows CORS from `FRONTEND_URL`
- On startup, the backend fetches model artifacts from Hugging Face and caches the latest revision
- If you downloaded the model manually, you may not need `HF_TOKEN`

## Setup & Run

### 1) Backend (FastAPI)

From the project root:

```bash
# Create and activate a virtual environment
python -m venv .venv

# Activate virtual environment
# Windows PowerShell
. .venv/Scripts/Activate.ps1
# macOS / Linux
source .venv/bin/activate

# Install dependencies
pip install -r src/backend/requirements.txt

# Set environment variables (PowerShell example)
$env:FRONTEND_URL="http://localhost:3000"
# $env:HF_TOKEN="<your_hf_token>"  # Only if needed

# Run the API
uvicorn src.backend.main:app --reload
```

The API will be available at `http://localhost:8000`.

### 2) Frontend (Next.js)

From `src/frontend`:

```bash
# Install dependencies
npm install

# Create .env.local file with API URL
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Run dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

## API

Base URL: `http://<backend-host>:8000`

- `GET /` — Health check
- `GET /version` — Model repo revision metadata (if available)
- `POST /detect` — Detect fracture from an uploaded image

### Request (multipart/form-data):

- field: `image` (file or blob)

### Response (200):

```json
{
  "class": "Fractured" | "Non Fractured",
  "confidence": "92.10%",
  "recommendation": "...",
  "imageWidth": 1024,
  "imageHeight": 1024,
  "detections": [
    { "id": 1, "label": "Fracture", "box": [10, 20, 110, 100] }
  ]
}
```

### Errors (4xx/5xx):

```json
{ "error": "message" }
```

## Development Notes

- The backend loads and exposes the detector on `app.state.model` during app lifespan
- Models are stored under `src/backend/models/` and refreshed when the remote revision changes
- Frontend reads the API base from `NEXT_PUBLIC_API_URL` via `src/frontend/lib/config.ts`

## Scripts

### Frontend (from `src/frontend`):

- `npm run dev` — Start Next.js dev server
- `npm run build` — Build for production
- `npm start` — Start production server
- `npm run lint` — Lint code

### Backend (from project root):

- `uvicorn src.backend.main:app --reload` — Start FastAPI dev server

## License

TBF
