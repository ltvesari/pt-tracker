from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from backend.database import get_session
from backend.models import User
from backend.routers.auth import get_current_user
from backend.utils.email import send_email
from pydantic import BaseModel

router = APIRouter(prefix="/profile", tags=["profile"])

class UserUpdate(BaseModel):
    first_name: str
    last_name: str
    email: str
    receive_daily_backup: bool
    receive_weekly_backup: bool

@router.put("/settings")
def update_settings(
    settings: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Retrieve fresh from DB to update
    user_db = session.get(User, current_user.id)
    if not user_db:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if email is being changed and if it is already taken by someone else
    if settings.email != user_db.email:
        existing_email = session.exec(select(User).where(User.email == settings.email)).first()
        if existing_email:
             raise HTTPException(status_code=400, detail="Bu email adresi zaten kullanımda.")
    
    user_db.first_name = settings.first_name
    user_db.last_name = settings.last_name
    user_db.email = settings.email
    user_db.receive_daily_backup = settings.receive_daily_backup
    user_db.receive_weekly_backup = settings.receive_weekly_backup
    
    session.add(user_db)
    session.commit()
    session.refresh(user_db)
    return user_db

@router.post("/send-backup")
async def send_manual_backup(
    current_user: User = Depends(get_current_user)
):
    """
    Triggers a manual backup email to the current user.
    """
    subject = "PT Tracker - Manuel Yedek"
    body = f"""
    <h1>Merhaba {current_user.first_name},</h1>
    <p>Manuel olarak talep ettiğiniz yedekleme işlemi başarıyla tetiklendi.</p>
    <p>Şu an için bu bir test mailidir. İlerleyen güncellemelerde burada veritabanı yedeğiniz (PDF/JSON) eklenecektir.</p>
    <br/>
    <p>Saygılar,<br/>PT Tracker Ekibi</p>
    """
    
    # Send email
    result = await send_email(subject, [current_user.email], body)
    
    return result

from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from backend.models import Student, LessonLog, BodyMeasurement

@router.get("/export-data")
def export_data(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Fetch all data
    students = session.exec(select(Student)).all()
    logs = session.exec(select(LessonLog)).all()
    measurements = session.exec(select(BodyMeasurement)).all()
    
    data = {
        "export_date": str(datetime.utcnow()),
        "user": current_user.username,
        "students": [jsonable_encoder(s) for s in students],
        "logs": [jsonable_encoder(l) for l in logs],
        "measurements": [jsonable_encoder(m) for m in measurements]
    }
    
    return JSONResponse(
        content=data,
        headers={"Content-Disposition": f"attachment; filename=pt_tracker_backup.json"}
    )
