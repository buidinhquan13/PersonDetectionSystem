from sqlalchemy import Column, Integer, String, Float, DateTime
from sqlalchemy.sql import func
from .database import Base

class Detection(Base):
    __tablename__ = "detectiosn"
    
    id = Column(Integer, primary_key=True, index=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    num_people = Column(Integer)
    original_image_path = Column(String)
    detected_image_path = Column(String)
    confidence_score = Column(Float, default=0.0)
    processing_time = Column(Float, default=0.0) 
    
    