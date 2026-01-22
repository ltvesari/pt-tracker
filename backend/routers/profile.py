from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from backend.database import get_session
from backend.models import User
from backend.routers.auth import get_current_user
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
    
    user_db.first_name = settings.first_name
    user_db.last_name = settings.last_name
    user_db.email = settings.email
    user_db.receive_daily_backup = settings.receive_daily_backup
    user_db.receive_weekly_backup = settings.receive_weekly_backup
    
    session.add(user_db)
    session.commit()
    session.refresh(user_db)
    return user_db
