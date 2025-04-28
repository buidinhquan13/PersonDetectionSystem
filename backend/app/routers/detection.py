from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional
import cv2
import numpy as np
import os
import time
from datetime import datetime
from pathlib import Path
from ultralytics import YOLO
from PIL import Image


from .. import models, schemas, database

router = APIRouter()

# Định nghĩa đường dẫn model YOLO
BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = str(BASE_DIR / "models" / "yolov8n.pt")

# Load YOLO model
try:
    model = YOLO(MODEL_PATH)
except Exception as e:
    raise FileNotFoundError(
        f"YOLO model not found at {MODEL_PATH}"
        "Please run 'python -m app.download_model' first" 
    )
    
UPLOAD_DIR = "uploads"

@router.post("/upload/", response_model = schemas.Detection)
async def  upload_image(
    file: UploadFile = File(...),
    db: Session = Depends(database.get_db)
):
    # Kiem tra file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail = "File must be an image")
    
    # Create timestamp for unique filename
    timestamp = time.time()
    
    # Create original and detected image paths without "uploads/"
    original_filename = f"original_{timestamp}.jpg"
    detected_filename = f"detected_{timestamp}.jpg"
    
    # Full path for saving files
    original_path = os.path.join(UPLOAD_DIR, original_filename)
    detected_path = os.path.join(UPLOAD_DIR, detected_filename)
    
    # Ensure uploads directory exists
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    
    contents = await file.read()
    with open(original_path, "wb") as f:
        f.write(contents)
        
    # Doc anh voi OpenCV
    nparr = np.fromstring(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    start_time = time.time()
    
    # detec with YOLO
    results = model(img)
    result = results[0] # lay ket qua dau tien
    
    # Loc chi lay person (class = 0)
    person_boxes = []
    confidence_scores = []
    
    for box in result.boxes:
        if box.cls == 0: # class = 0
            person_boxes.append(box.xyxy[0].cpu().numpy())
            confidence_scores.append(box.conf.cpu().numpy())
    
    # Ve bounding boxes
    for box in person_boxes:
        x1, y1, x2, y2 = map(int, box)
        cv2.rectangle(img, (x1, y1), (x2, y2), (0, 255, 0), 2)
        
    # Luu anh detect
    cv2.imwrite(detected_path, img)
    
    processing_time = time.time() - start_time
    num_people = len(person_boxes)
    avg_confidence = np.mean(confidence_scores) if confidence_scores else 0
    
    # Luu vao database
    detection = models.Detection(
        timestamp = datetime.now(),
        num_people = num_people,
        original_image_path = original_filename,
        detected_image_path = detected_filename,
        confidence_score = float(avg_confidence),
        processing_time = processing_time
    ) 
    
    db.add(detection)
    db.commit()
    db.refresh(detection)
    
    return detection

@router.get("/detections", response_model = schemas.DetectionPage)
async def get_detections(
    skip: int = 0,
    limit: int = 10,
    min_people: Optional[int] = Query(None, ge=0),
    max_people: Optional[int] = Query(None, ge=0),
    min_confidence: Optional[float] = Query(None, ge=0, le=1),
    db: Session = Depends(database.get_db)
):
    try:
        query = db.query(models.Detection)
        
        if min_people is not None:
            query = query.filter(models.Detection.num_people >= min_people)
        
        if max_people is not None:
            query = query.filter(models.Detection.num_people <= max_people)
            
        if min_confidence is not None:
            query = query.filter(models.Detection.confidence_score >= min_confidence)
        
        total = query.count()
        items = query.order_by(models.Detection.timestamp.desc()).offset(skip).limit(limit).all()
        
        return {
            "total": total,
            "items": items
        }
    except Exception as e:
        print(f"Error in get_detections: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
@router.get("/images/{image_path:path}")
async def get_image(image_path: str):
    full_path = os.path.join(UPLOAD_DIR, image_path)
    if not os.path.exists(full_path):
        raise HTTPException(status_code = 404, detail = "Image not found")
    return FileResponse(full_path)

@router.delete("/detections/{detection_id}")
async def delete_detection(detection_id: int, db: Session = Depends(database.get_db)):
    detection = db.query(models.Detection).filter(models.Detection.id == detection_id).first()
    if not detection:
        raise HTTPException(status_code=404, detail="Detection not found")
    
    # Detele image files
    try:
        original_path = os.path.join(UPLOAD_DIR, detection.original_image_path)
        detected_path = os.path.join(UPLOAD_DIR, detection.detected_image_path)
        if os.path.exists(original_path):
            os.remove(original_path)
        if os.path.exists(detected_path):
            os.remove(detected_path)
    except Exception as e:
        print(f"Error deleting files: {e}")
        
    # Detele database record
    db.delete(detection)
    db.commit()
    
    return {"message" : "Detection deteled successfully"}    