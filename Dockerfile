# Multi-service repo: build and run only the backend service
# Use a small base image
FROM python:3.10.0-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

# System dependencies for opencv-python-headless and image libs
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 libsm6 libxrender1 libxext6 libgl1-mesa-glx \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies first for better layer caching
COPY src/backend/requirements.txt /app/requirements.txt
RUN python -m pip install --upgrade pip \
    && pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu torch==2.4.1 torchvision==0.19.1 \
    && pip install --no-cache-dir -r /app/requirements.txt

# Copy backend source only (frontend excluded by default)
COPY src/backend /app

# Ensure models dir exists (kept empty; models downloaded at runtime)
RUN mkdir -p /app/models

# Railway sets PORT env var
ENV PORT=8000

# Start the FastAPI app
# Using shell form to allow ${PORT} expansion on Railway
CMD uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}
