from contextlib import asynccontextmanager
from huggingface_hub import hf_hub_download
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

# Downloads model file to the models directory (no symlinks, no cache indirection).
def download_model(filename: str, hf_token: str) -> Path:
    print(f"Downloading {filename} from Hugging Face into {MODEL_DIR} ...")
    MODEL_DIR.mkdir(parents=True, exist_ok=True)
    # Place the file directly under MODEL_DIR to match expected paths
    downloaded_path = hf_hub_download(
        repo_id=HF_REPO_ID,
        filename=filename,
        local_dir=str(MODEL_DIR),
        token=hf_token,
    )
    local_path = MODEL_DIR / filename

    # Ensure the file ends up exactly at models/<filename>
    downloaded_path = Path(downloaded_path)
    if downloaded_path.exists() and downloaded_path != local_path:
        try:
            local_path.parent.mkdir(parents=True, exist_ok=True)
            shutil.move(str(downloaded_path), str(local_path))
        except Exception as move_err:
            print(f"Move failed ({move_err}), attempting copy/remove fallback...")
            try:
                shutil.copy2(str(downloaded_path), str(local_path))
                try:
                    downloaded_path.unlink()
                except Exception:
                    pass
            except Exception as copy_err:
                print(f"Copy fallback also failed: {copy_err}")

    # As a last resort, search recursively for the file within MODEL_DIR
    if not local_path.exists():
        print(f"Expected path not found: {local_path}. Searching recursively in {MODEL_DIR}...")
        found = _find_file_recursively(MODEL_DIR, filename)
        if found:
            try:
                shutil.move(str(found), str(local_path))
            except Exception as e:
                print(f"Could not move found file {found} to {local_path}: {e}")

    if not local_path.exists():
        _debug_list_dir(MODEL_DIR)
        raise FileNotFoundError(f"After download, expected file missing: {local_path}")

    print(f"Downloaded {filename} -> {local_path}")
    return local_path

# Ensure models exist and are up-to-date.
# If the Hugging Face repo has a newer revision,
# download fresh copies and clear old cache.
def ensure_latest_models(hf_token: str | None = None) -> tuple[Path, Path]:
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    resnet_path = MODEL_DIR / RESNET_FILE
    yolo_path = MODEL_DIR / YOLO_FILE

    # Skip revision check: only download if files are missing
    if not resnet_path.exists() or not yolo_path.exists():
        print("One or more model files are missing locally. Downloading required files...")
        try:
            if not resnet_path.exists():
                resnet_path = download_model(RESNET_FILE, hf_token)
            if not yolo_path.exists():
                yolo_path = download_model(YOLO_FILE, hf_token)
        except Exception as e:
            print(f"Warning: Could not download missing models from Hugging Face: {e}")
            # If download failed and files are still missing, abort with clear error
            if not resnet_path.exists() or not yolo_path.exists():
                raise RuntimeError(
                    "Models not found locally and Hugging Face download failed. "
                    "Ensure HF_TOKEN is set (if repo is private) or pre-populate 'src/backend/models' with required files."
                )
    else:
        print("Found existing model files locally. Skipping download.")

    # Final existence check (no hashing to keep startup light)
    if not resnet_path.exists():
        raise FileNotFoundError(f"Missing model file: {resnet_path}")
    if not yolo_path.exists():
        raise FileNotFoundError(f"Missing model file: {yolo_path}")

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

    print("Models loaded successfully!\n")

    try:
        yield
    finally:
        if hasattr(app.state, "model"):
            del app.state.model
        print("Models unloaded. Backend shutting down.")

# - Syncs model artifacts from Hugging Face (repo revision-aware cache refresh).
# - Provides a FastAPI lifespan context manager that loads HybridFractureDetector
#   and exposes it on app.state.model, and cleans it up on shutdown.
# - Environment:
#   - HF_TOKEN 
