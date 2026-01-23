from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from backend.database import get_session
from backend.models import User
from backend.routers.auth import get_current_user
# from backend.utils.email import send_email # Removed
from pydantic import BaseModel

router = APIRouter(prefix="/profile", tags=["profile"])

class UserUpdate(BaseModel):
    first_name: str
    last_name: str
    email: str

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
    
    session.add(user_db)
    session.commit()
    session.refresh(user_db)
    return user_db

from fastapi.responses import StreamingResponse
import io
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

@router.get("/export-pdf")
def export_pdf_report(
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    # Fetch data
    logs = session.exec(select(LessonLog).order_by(LessonLog.date.desc())).all()
    
    # Register Font
    import os
    font_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "fonts", "Roboto-Regular.ttf")
    pdfmetrics.registerFont(TTFont('Roboto-Regular', font_path))
    
    # Create PDF buffer
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    elements = []
    
    styles = getSampleStyleSheet()
    styles['Normal'].fontName = 'Roboto-Regular'
    styles['Title'].fontName = 'Roboto-Regular'
    
    title_style = styles["Title"]
    normal_style = styles["Normal"]
    
    # Title
    elements.append(Paragraph(f"PT Tracker - Ders Raporu ({datetime.now().strftime('%d.%m.%Y')})", title_style))
    elements.append(Spacer(1, 20))
    
    # Summary
    total_lessons = sum(1 for l in logs if l.type == 'deduct')
    elements.append(Paragraph(f"Toplam İşlenen Ders: {total_lessons}", normal_style))
    elements.append(Spacer(1, 20))
    
    # Table Data
    data = [["Tarih", "Öğrenci", "İşlem", "Miktar"]]
    
    for log in logs:
        student_name = f"{log.student.first_name} {log.student.last_name}" if log.student else "Silinmiş Öğrenci"
        action = "Ders İşlendi" if log.type == 'deduct' else \
                 "Paket Eklendi" if log.type == 'add' else \
                 "İptal/İade"
                 
        count_str = f"-{log.count}" if log.type == 'deduct' else f"+{log.count}"
        
        data.append([
            log.date.strftime("%d.%m.%Y %H:%M"),
            student_name,
            action,
            count_str
        ])
        
    # Table Style
    table = Table(data, colWidths=[100, 150, 100, 80])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, -1), 'Roboto-Regular'),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black),
    ]))
    
    elements.append(table)
    
    doc.build(elements)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=ders_raporu_{datetime.now().strftime('%Y%m%d')}.pdf"}
    )

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
