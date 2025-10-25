# OrthoVision

A full‑stack application for X‑ray fracture detection.

- Frontend: Next.js 14 (App Router), React 18, Tailwind CSS, shadcn/ui, Radix UI, Zod, React Hook Form
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
│     └─ orthovision/
│        ├─ load_model.py # HF sync + model lifecycle
│        └─ hybrid_detector.py
└─ README.md
```


## Prerequisites

- Node.js 18+ and pnpm/npm/yarn
- Python 3.10+
- (Optional) Hugging Face access token if the model repo is private


## Environment Variables

Create separate `.env` files for frontend and backend.

- Frontend (src/frontend/.env.local)
  - `NEXT_PUBLIC_API_URL` (default used by code if not set: `http://localhost:8000`)

- Backend (project root or src/backend/.env)
  - `FRONTEND_URL` (default: `http://localhost:3000`)
  - `HF_TOKEN` (required if the Hugging Face repo is private)

Notes:
- The backend will allow CORS from `FRONTEND_URL`.
- On startup, the backend fetches model artifacts from Hugging Face and caches the latest revision.


## Setup & Run

### 1) Backend (FastAPI)

From the project root:

```bash
# create and activate a virtual environment (example with venv)
python -m venv .venv
# Windows PowerShell
. .venv/Scripts/Activate.ps1

# install dependencies
pip install -r src/backend/requirements.txt

# set env (PowerShell examples)
$env:FRONTEND_URL="http://localhost:3000"
# Only if required (private repo)
# $env:HF_TOKEN="<your_hf_token>"

# run the API
uvicorn main:app
```

The API will be available at `http://localhost:8000`.


### 2) Frontend (Next.js)

From `src/frontend`:

```bash
# install deps
npm install

# set env (create .env.local or set inline)
# .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:8000

# run dev server
npm run dev
```

The app will be available at `http://localhost:3000`.


## API

Base URL: `http://<backend-host>:8000`

- `GET /` — Health check
- `GET /version` — Model repo revision metadata (if available)
- `POST /detect` — Detect fracture from an uploaded image

Request (multipart/form-data):
- field: `image` (file or blob)

Response (200):
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

Errors (4xx/5xx): `{ "error": "message" }`


## Development Notes

- The backend loads and exposes the detector on `app.state.model` during app lifespan.
- Models are stored under `src/backend/models/` and refreshed when the remote revision changes.
- Frontend reads the API base from `NEXT_PUBLIC_API_URL` via `src/frontend/lib/config.ts`.


## Scripts

Frontend (from `src/frontend`):
- `npm run dev` — Start Next.js dev server
- `npm run build` — Build for production
- `npm start` — Start production server
- `npm run lint` — Lint

Backend (from project root):
- `uvicorn src.backend.main:app --host 0.0.0.0 --port 8000` — Start API


## License

TBF
