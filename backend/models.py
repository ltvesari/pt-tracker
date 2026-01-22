from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, date as dt_date
from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from backend.models import LessonLog, BodyMeasurement

class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    username: str = Field(index=True, unique=True)
    password_hash: str
    first_name: str
    last_name: str
    email: str = Field(unique=True)
    receive_daily_backup: bool = False
    receive_weekly_backup: bool = False

class Student(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    first_name: str
    last_name: str
    birth_date: Optional[dt_date] = None
    
    package_total: int = 0
    package_remaining: int = 0
    is_active: bool = True
    note: Optional[str] = None
    
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    logs: List["LessonLog"] = Relationship(back_populates="student")
    measurements: List["BodyMeasurement"] = Relationship(back_populates="student")

class LessonLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="student.id")
    date: datetime = Field(default_factory=datetime.utcnow)
    count: int = 1
    type: str # 'deduct' or 'undo' or 'add_package'
    
    student: Student = Relationship(back_populates="logs")

class BodyMeasurement(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="student.id")
    date: dt_date = Field(default_factory=dt_date.today)
    
    weight: Optional[float] = None
    muscle_ratio: Optional[float] = None
    fat_ratio: Optional[float] = None
    circumference_waist: Optional[float] = None
    circumference_hip: Optional[float] = None
    
    student: Student = Relationship(back_populates="measurements")
