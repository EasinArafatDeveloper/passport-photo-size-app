import os
import uuid
import io
import json
import tempfile
from pathlib import Path
from typing import Optional

import cv2
import numpy as np
from PIL import Image
from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from image_processor import PassportPhotoProcessor

app = FastAPI(title="Passport Photo Generator API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tightened via env in production if needed
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Temp storage for uploaded/processed files
UPLOAD_DIR = Path("temp_uploads")
OUTPUT_DIR = Path("temp_outputs")
UPLOAD_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

processor = PassportPhotoProcessor()


class ProcessRequest(BaseModel):
    session_id: str
    copies: int = 6
    bg_color: str = "white"  # white | light_blue
    country_preset: str = "standard"  # standard | bangladesh | usa | uk


def cleanup_files(paths: list[str]):
    """Remove temp files after download."""
    for p in paths:
        try:
            os.remove(p)
        except Exception:
            pass


@app.get("/")
async def root():
    return {"message": "Passport Photo Generator API is running"}


@app.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """Accept an image upload and return a session ID."""
    allowed_types = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type: {file.content_type}. Use JPEG, PNG, or WebP."
        )

    session_id = str(uuid.uuid4())
    file_path = UPLOAD_DIR / f"{session_id}.jpg"

    contents = await file.read()
    # Convert to JPEG regardless of input format
    img = Image.open(io.BytesIO(contents)).convert("RGB")
    img.save(str(file_path), "JPEG", quality=95)

    return {"session_id": session_id, "message": "Image uploaded successfully"}


@app.post("/process-photo")
async def process_photo(request: ProcessRequest):
    """Run the full processing pipeline and return processed image path."""
    source_path = UPLOAD_DIR / f"{request.session_id}.jpg"
    if not source_path.exists():
        raise HTTPException(status_code=404, detail="Session not found. Please upload an image first.")

    try:
        # Get country preset dimensions
        preset = get_preset(request.country_preset)

        # Run pipeline
        result = processor.process(
            str(source_path),
            copies=request.copies,
            bg_color=request.bg_color,
            preset=preset,
        )

        preview_path = OUTPUT_DIR / f"{request.session_id}_preview.jpg"
        result["preview_image"].save(str(preview_path), "JPEG", quality=90)

        pdf_path = OUTPUT_DIR / f"{request.session_id}_passport.pdf"
        result["pdf_bytes"].seek(0)
        with open(str(pdf_path), "wb") as f:
            f.write(result["pdf_bytes"].read())

        return JSONResponse({
            "session_id": request.session_id,
            "status": "success",
            "message": "Passport photo processed successfully",
            "preview_url": f"/preview/{request.session_id}",
            "download_url": f"/download-pdf/{request.session_id}",
            "copies": request.copies,
            "preset": preset,
        })

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


@app.get("/preview/{session_id}")
async def get_preview(session_id: str):
    """Return the preview image."""
    preview_path = OUTPUT_DIR / f"{session_id}_preview.jpg"
    if not preview_path.exists():
        raise HTTPException(status_code=404, detail="Preview not found")
    return FileResponse(str(preview_path), media_type="image/jpeg")


@app.get("/download-pdf/{session_id}")
async def download_pdf(session_id: str, background_tasks: BackgroundTasks):
    """Return the final PDF for download."""
    pdf_path = OUTPUT_DIR / f"{session_id}_passport.pdf"
    if not pdf_path.exists():
        raise HTTPException(status_code=404, detail="PDF not found. Please process the photo first.")

    upload_path = UPLOAD_DIR / f"{session_id}.jpg"
    preview_path = OUTPUT_DIR / f"{session_id}_preview.jpg"

    background_tasks.add_task(
        cleanup_files,
        [str(upload_path), str(preview_path)]
    )

    return FileResponse(
        str(pdf_path),
        media_type="application/pdf",
        filename="passport_photos.pdf",
        headers={"Content-Disposition": "attachment; filename=passport_photos.pdf"},
    )


def get_preset(country: str) -> dict:
    presets = {
        "standard": {
            "width_mm": 35, "height_mm": 45,
            "face_ratio": 0.74, "face_width_ratio": 0.58, "top_margin_ratio": 0.09,
            "label": "Standard (35×45mm)"
        },
        "bangladesh": {
            "width_mm": 35, "height_mm": 45,
            "face_ratio": 0.74, "face_width_ratio": 0.58, "top_margin_ratio": 0.09,
            "label": "Bangladesh (35×45mm)"
        },
        "usa": {
            "width_mm": 51, "height_mm": 51,
            "face_ratio": 0.75, "face_width_ratio": 0.60, "top_margin_ratio": 0.09,
            "label": "USA (51×51mm / 2×2 inch)"
        },
        "uk": {
            "width_mm": 35, "height_mm": 45,
            "face_ratio": 0.72, "face_width_ratio": 0.57, "top_margin_ratio": 0.10,
            "label": "UK (35×45mm)"
        },
    }
    return presets.get(country, presets["standard"])


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
