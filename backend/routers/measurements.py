from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from datetime import date
from backend.database import get_session
from backend.models import BodyMeasurement, Student
from pydantic import BaseModel

router = APIRouter(prefix="/measurements", tags=["measurements"])

class MeasurementCreate(BaseModel):
    student_id: int
    date: Optional[date] = None
    weight: Optional[float] = None
    muscle_ratio: Optional[float] = None
    fat_ratio: Optional[float] = None
    circumference_waist: Optional[float] = None
    circumference_hip: Optional[float] = None

class MeasurementRead(MeasurementCreate):
    id: int

@router.post("/", response_model=MeasurementRead)
def create_measurement(
    measurement: MeasurementCreate, 
    session: Session = Depends(get_session)
):
    student = session.get(Student, measurement.student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    db_measurement = BodyMeasurement.model_validate(measurement)
    if not db_measurement.date:
        db_measurement.date = date.today()
        
    session.add(db_measurement)
    session.commit()
    session.refresh(db_measurement)
    return db_measurement

@router.get("/{student_id}", response_model=List[MeasurementRead])
def get_student_measurements(
    student_id: int, 
    session: Session = Depends(get_session)
):
    query = select(BodyMeasurement).where(BodyMeasurement.student_id == student_id).order_by(BodyMeasurement.date.desc())
    measurements = session.exec(query).all()
    return measurements

@router.delete("/{measurement_id}")
def delete_measurement(measurement_id: int, session: Session = Depends(get_session)):
    measurement = session.get(BodyMeasurement, measurement_id)
    if not measurement:
        raise HTTPException(status_code=404, detail="Measurement not found")
    session.delete(measurement)
    session.commit()
    return {"ok": True}
