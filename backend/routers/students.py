from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List, Optional
from datetime import date
from backend.database import get_session
from backend.models import Student, User, LessonLog, BodyMeasurement  # Correct imports
from backend.routers.auth import get_current_user # Need to implement this dependency
from pydantic import BaseModel

router = APIRouter(prefix="/students", tags=["students"])

# Need to move get_current_user to a common dependency file or redefine here slightly for speed
# For now, let's assume we pass the user dependency. 
# Actually, let's implement a simple dependency here or import it if I exported it.
# I didn't export get_current_user in auth.py, I only defined login/register.
# Let's fix auth.py to export a get_current_user dependency first.

class StudentCreate(BaseModel):
    first_name: str
    last_name: str
    birth_date: Optional[date] = None
    package_total: int
    note: Optional[str] = None

class StudentRead(StudentCreate):
    id: int
    package_remaining: int
    is_active: bool

@router.post("/", response_model=StudentRead)
def create_student(
    student: StudentCreate, 
    session: Session = Depends(get_session),
    # user: User = Depends(get_current_user) # TODO: add auth lock later
):
    db_student = Student.model_validate(student)
    db_student.package_remaining = student.package_total # Start full
    session.add(db_student)
    session.commit()
    session.refresh(db_student)
    
    # Log initial package if > 0
    if student.package_total > 0:
        log = LessonLog(
            student_id=db_student.id,
            count=student.package_total,
            type="add"
        )
        session.add(log)
        session.commit()
    
    return db_student

@router.put("/{student_id}", response_model=StudentRead)
def update_student(
    student_id: int,
    student_data: StudentCreate,
    session: Session = Depends(get_session)
):
    db_student = session.get(Student, student_id)
    if not db_student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    student_data_dict = student_data.model_dump(exclude_unset=True)
    for key, value in student_data_dict.items():
        setattr(db_student, key, value)
        
    session.add(db_student)
    session.commit()
    session.refresh(db_student)
    return db_student

from datetime import datetime

class StudentReadWithDate(StudentRead):
    last_lesson_date: Optional[datetime] = None

@router.get("/", response_model=List[StudentReadWithDate])
def read_students(
    session: Session = Depends(get_session),
    active_only: bool = False
):
    query = select(Student)
    if active_only:
        query = query.where(Student.is_active == True)
    
    # Sort alphabetically
    query = query.order_by(Student.first_name)
    students = session.exec(query).all()
    
    result = []
    for s in students:
        # Find last deduct log
        last_log = session.exec(
            select(LessonLog)
            .where(LessonLog.student_id == s.id, LessonLog.type == "deduct")
            .order_by(LessonLog.date.desc())
        ).first()
        
        # Convert SQLModel to dict and add extra field
        s_data = s.model_dump()
        s_data["last_lesson_date"] = last_log.date if last_log else None
        result.append(s_data)
        
    return result

@router.post("/{student_id}/deduct")
def deduct_lesson(
    student_id: int, 
    session: Session = Depends(get_session)
):
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Logic: Allow negative balance
    student.package_remaining -= 1
    
    # Log it
    log = LessonLog(
        student_id=student.id,
        count=1,
        type="deduct"
    )
    
    session.add(log)
    session.add(student)
    session.commit()
    return {"ok": True, "remaining": student.package_remaining}

@router.post("/{student_id}/undo")
def undo_last_lesson(
    student_id: int,
    session: Session = Depends(get_session)
):
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    # Find last deduct log
    statement = select(LessonLog).where(
        LessonLog.student_id == student_id, 
        LessonLog.type == "deduct"
    ).order_by(LessonLog.date.desc())
    
    last_log = session.exec(statement).first()
    
    if not last_log:
        raise HTTPException(status_code=400, detail="No lesson to undo")
    
    # Revert
    student.package_remaining += last_log.count
    
    # Create undo log or just delete the old log? 
    # User asked for "Cancel", usually means delete or compensate.
    # Let's delete the log to keep history clean? Or mark as cancelled.
    # Deleting is simpler for "Undo".
    
    session.delete(last_log) # Remove the log
    session.add(student)
    session.commit()
    
    return {"ok": True, "remaining": student.package_remaining}

class AddPackageRequest(BaseModel):
    count: int

@router.post("/{student_id}/add_package")
def add_package_lessons(
    student_id: int,
    data: AddPackageRequest,
    session: Session = Depends(get_session)
):
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    
    if data.count <= 0:
        raise HTTPException(status_code=400, detail="Count must be positive")

    # Increase balance
    student.package_remaining += data.count
    
    # Log it
    log = LessonLog(
        student_id=student.id,
        count=data.count,
        type="add"
    )
    
    session.add(log)
    session.add(student)
    session.commit()
    return {"ok": True, "remaining": student.package_remaining}

@router.delete("/{student_id}")
def delete_student(student_id: int, session: Session = Depends(get_session)):
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    session.delete(student)
    session.commit()
    return {"ok": True}

@router.get("/{student_id}/logs", response_model=List[LessonLog])
def get_student_logs(
    student_id: int,
    session: Session = Depends(get_session)
):
    student = session.get(Student, student_id)
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    logs = session.exec(select(LessonLog).where(LessonLog.student_id == student_id).order_by(LessonLog.date.desc())).all()
    return logs
