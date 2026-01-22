from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
from backend.database import get_session
from backend.models import User
from backend.routers.auth import get_current_user, get_password_hash
from pydantic import BaseModel
from typing import Optional

router = APIRouter(prefix="/admin", tags=["admin"])

class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    password: Optional[str] = None
    is_admin: Optional[bool] = None

# Dependency to ensure user is admin
def get_current_admin_user(current_user: User = Depends(get_current_user)):
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user

@router.get("/users", response_model=List[User])
def read_users(
    skip: int = 0, 
    limit: int = 100, 
    current_user: User = Depends(get_current_admin_user), 
    session: Session = Depends(get_session)
):
    users = session.exec(select(User).offset(skip).limit(limit)).all()
    return users

@router.delete("/users/{user_id}")
def delete_user(
    user_id: int, 
    current_user: User = Depends(get_current_admin_user), 
    session: Session = Depends(get_session)
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own admin account")
    
    session.delete(user)
    session.commit()
    return {"ok": True}

@router.put("/users/{user_id}", response_model=User)
def update_user_by_admin(
    user_id: int, 
    user_update: UserUpdate,
    current_user: User = Depends(get_current_admin_user),
    session: Session = Depends(get_session)
):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_update.first_name is not None:
        user.first_name = user_update.first_name
    if user_update.last_name is not None:
        user.last_name = user_update.last_name
    if user_update.email is not None:
        user.email = user_update.email
    if user_update.is_admin is not None:
         # Prevent removing own admin status entirely if it's the only one, but strict logic is complex.
         # For now, just allow.
        user.is_admin = user_update.is_admin
        
    if user_update.password:
        user.password_hash = get_password_hash(user_update.password)
        
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
