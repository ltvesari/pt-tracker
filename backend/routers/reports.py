from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from typing import List, Dict, Any
from datetime import datetime, timedelta
from backend.database import get_session
from backend.models import Student, LessonLog
from pydantic import BaseModel

router = APIRouter(prefix="/reports", tags=["reports"])

@router.get("/dashboard-stats")
def get_dashboard_stats(session: Session = Depends(get_session)):
    # 1. Low Balance Students (<5)
    low_balance = session.exec(select(Student).where(Student.package_remaining < 5)).all()
    
    # 2. Absent Students (Last lesson > 7 days ago or never)
    # This is a bit complex in SQLModel/SQLAlchemy without raw SQL or joining
    # Strategy: Get all students, check their latest log
    absent_students = []
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    
    all_students = session.exec(select(Student).where(Student.is_active == True)).all()
    for s in all_students:
        last_log = session.exec(
            select(LessonLog)
            .where(LessonLog.student_id == s.id, LessonLog.type == "deduct")
            .order_by(LessonLog.date.desc())
        ).first()
        
        if not last_log:
            # New student never had a lesson, count as absent? Maybe.
            # Let's say yes for now or maybe checks creation date.
            pass
        elif last_log.date < seven_days_ago:
            absent_students.append({
                "id": s.id,
                "first_name": s.first_name,
                "last_name": s.last_name,
                "last_lesson_date": last_log.date
            })

    # 3. Monthly Lesson Counts (Last 6 Months)
    # Group by Month-Year
    # Ideally use SQL GROUP BY
    logs = session.exec(select(LessonLog).where(LessonLog.type == "deduct")).all()
    
    monthly_stats = {}
    for log in logs:
        key = log.date.strftime("%Y-%m")
        monthly_stats[key] = monthly_stats.get(key, 0) + log.count

    # Format for chart [{"name": "Jan", "lessons": 12}, ...]
    chart_data = []
    # Sort keys
    for key in sorted(monthly_stats.keys()):
        date_obj = datetime.strptime(key, "%Y-%m")
        chart_data.append({
            "name": date_obj.strftime("%b"),
            "lessons": monthly_stats[key]
        })
        
    return {
        "low_balance": low_balance,
        "absent_students": absent_students,
        "monthly_chart": chart_data[-6:] # Last 6 months
    }

@router.get("/history")
def get_full_history(session: Session = Depends(get_session)):
    # Join Student to get names
    # SQLModel doesn't support joinedload easily for simple query returning Dict
    # limiting to 100 for perf
    logs = session.exec(select(LessonLog).order_by(LessonLog.date.desc()).limit(100)).all()
    
    result = []
    for log in logs:
        # N+1 problem here but negligible for 100 items on SQLite
        # Ideally eager load
        student = session.get(Student, log.student_id)
        if student:
            result.append({
                "id": log.id,
                "date": log.date,
                "student_name": f"{student.first_name} {student.last_name}",
                "type": log.type,
                "count": log.count 
            })
    return result
