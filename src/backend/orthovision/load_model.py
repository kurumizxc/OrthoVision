from contextlib import asynccontextmanager
from huggingface_hub import hf_hub_download, HfApi
from orthovision.hybrid_detector import HybridFractureDetector
from pathlib import Path
import hashlib
import shutil
import os
import json

# Model directory and Hugging Face repository configuration.
MODEL_DIR = Path(__file__).resolve().parent.parent / "models"
HF_REPO_ID = "kurumizxc/orthovision-models"  # Replace with private repo
RESNET_FILE = "best_model_f1_focused.pth"
YOLO_FILE = "best.pt"
META_FILE = MODEL_DIR / "model_meta.json"

# Helper functions for model management.
def file_hash(path: Path) -> str:
    # Compute SHA256 hash for a file.
    sha256 = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(8192), b""):
            sha256.update(chunk)
    return sha256.hexdigest()

# Save and load model metadata.
def save_meta(repo_revision: str):
    META_FILE.write_text(json.dumps({"revision": repo_revision}))

# Load stored revision hash.
def load_meta() -> str | None:
    if META_FILE.exists():
        try:
            return json.loads(META_FILE.read_text()).get("revision")
        except Exception:
            return None
    return None

# Clear local model directory before redownloading new ones.
def clear_old_models():
    if MODEL_DIR.exists():
        print("Clearing outdated models and cache...")
        for item in MODEL_DIR.iterdir():
            try:
                if item.is_file() or item.is_symlink():
                    item.unlink()
                elif item.is_dir():
                    shutil.rmtree(item)
            except Exception as e:
                print(f"Could not delete {item}: {e}")
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

# Downloads model file from Hugging Face.
def download_model(filename: str, hf_token: str):
    print(f"Downloading {filename} from Hugging Face...")
    downloaded = hf_hub_download(
        repo_id=HF_REPO_ID,
        filename=filename,
        cache_dir=MODEL_DIR,
        token=hf_token
    )
    local_path = MODEL_DIR / filename
    os.rename(downloaded, local_path)
    print(f"Downloaded {filename}")
    return local_path

# Ensure models exist and are up-to-date.
# If the Hugging Face repo has a newer revision,
# download fresh copies and clear old cache.
def ensure_latest_models(hf_token: str | None = None) -> tuple[Path, Path]:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    api = HfApi()
    print(f"Checking Hugging Face repo: {HF_REPO_ID}")
    repo_info = api.repo_info(repo_id=HF_REPO_ID, token=hf_token)
    current_revision = repo_info.sha
    saved_revision = load_meta()

    refresh_required = saved_revision != current_revision

    resnet_path = MODEL_DIR / RESNET_FILE
    yolo_path = MODEL_DIR / YOLO_FILE

    if refresh_required or not resnet_path.exists() or not yolo_path.exists():
        clear_old_models()
        resnet_path = download_model(RESNET_FILE, hf_token)
        yolo_path = download_model(YOLO_FILE, hf_token)
        save_meta(current_revision)
        print("Updated to latest model version.")
    else:
        print("Local models are up-to-date with Hugging Face.")

    print(f"ResNet SHA256: {file_hash(resnet_path)[:12]}...")
    print(f"YOLO SHA256:   {file_hash(yolo_path)[:12]}...")

    return resnet_path, yolo_path

# Load or refresh models automatically at app startup.
@asynccontextmanager
async def load_model(app):
    print("\nStarting OrthoVision backend...")
    hf_token = os.getenv("HF_TOKEN")

    try:
        resnet_path, yolo_path = ensure_latest_models(hf_token)
    except Exception as e:
        print(f"Error checking Hugging Face: {e}")
        raise

    print("Loading HybridFractureDetector...")
    app.state.model = HybridFractureDetector(
        resnet_path=str(resnet_path),
        yolo_path=str(yolo_path)
    )

    print("Models loaded and verified successfully!\n")

    try:
        yield
    finally:
        if hasattr(app.state, "model"):
            del app.state.model
        print("Models unloaded. Backend shutting down.")

# - Syncs model artifacts from Hugging Face (repo revision-aware cache refresh).
# - Verifies files via SHA256 and stores the current revision in models/model_meta.json.
# - Provides a FastAPI lifespan context manager that loads HybridFractureDetector
#   and exposes it on app.state.model, and cleans it up on shutdown.
# - Environment:
#   - HF_TOKEN 
