import os
from pathlib import Path
from huggingface_hub import HfApi, upload_file
from dotenv import load_dotenv

# Load token from .env
load_dotenv()

HF_TOKEN = os.getenv("HF_TOKEN")
HF_REPO_ID = "kurumizxc/orthovision-models"

if not HF_TOKEN:
    raise EnvironmentError("Missing HF_TOKEN. Please add it to your .env file.")

api = HfApi()
model_dir = Path("models")

# Ensure folder exists
if not model_dir.exists():
    raise FileNotFoundError("'models/' folder not found. Please ensure your trained weights exist.")

# Define files to upload
model_files = [
    "best_model_f1_focused.pth",
    "best.pt"
]

# Create repo if missing
print(f"🔍 Checking repo: {HF_REPO_ID}")
api.create_repo(repo_id=HF_REPO_ID, private=True, exist_ok=True, token=HF_TOKEN)

# Upload models
for filename in model_files:
    filepath = model_dir / filename
    if not filepath.exists():
        print(f"Skipping {filename} — file not found.")
        continue

    print(f"Uploading {filename}...")
    upload_file(
        path_or_fileobj=str(filepath),
        path_in_repo=filename,
        repo_id=HF_REPO_ID,
        token=HF_TOKEN
    )

print("Upload complete! Models updated in Hugging Face.")


# Usage
# -----
# Step 1: Configure environment
# - In your .env file, set: HF_TOKEN=your_huggingface_token
#
# Step 2: Prepare models
# - Place your model files in the local 'models/' folder.
# - Ensure filenames match those listed in 'model_files'.
#
# Step 3: Run
# - Via module:  python -m src.backend.upload_models
# - Or directly: python src/backend/upload_models.py
#
# Expected output (example)
# - Checking repo: yourusername/orthovision-models
# - Uploading best_model_f1_focused.pth...
# - Uploading best.pt...
# - Upload complete! Models updated in Hugging Face.
#
# Behavior
# - Same filename → overwrites the existing file in the repo.
# - Renamed file → uploaded as a new artifact (does not overwrite).
# - Repository is private; access requires your HF token.