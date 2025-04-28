from pydantic import BaseModel
from datetime import datetime
from typing import List

class DetectionBase(BaseModel):
    timestamp: datetime
    num_people: int
    original_image_path: str
    detected_image_path: str
    confidence_score: float
    processing_time: float

class DetectionCreate(DetectionBase):
    pass

class Detection(BaseModel):
    id: int
    timestamp: datetime
    num_people: int
    original_image_path: str
    detected_image_path: str
    confidence_score: float
    processing_time: float
    
    class Config:
        orm_mode = True
        
class DetectionResponse(BaseModel):
    total: int
    items: List[Detection]
    
# Thêm schema mới cho phân trang
class DetectionPage(BaseModel):
    total: int
    items: List[Detection]
    
    class Config:
        orm_mode = True