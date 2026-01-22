from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlmodel import Session, select
from datetime import datetime, timedelta
from typing import Optional
from backend.database import get_session
from backend.models import User
from passlib.context import CryptContext
from jose import JWTError, jwt
from pydantic import BaseModel
import hashlib

router = APIRouter(prefix="/auth", tags=["auth"])

# Secret & Config (Should be in env)
SECRET_KEY = "supersecretkey" # TODO: Change this
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7 # 1 week session

# pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

class UserCreate(BaseModel):
    username: str
    password: str
    first_name: str
    last_name: str
    email: str

class Token(BaseModel):
    access_token: str
    token_type: str

class LoginRequest(BaseModel):
    username: str
    password: str

def verify_password(plain_password, hashed_password):
    # return pwd_context.verify(plain_password, hashed_password)
    # Debug:
    # print(f"Verifying: {plain_password} vs {hashed_password}")
    return hashlib.sha256(plain_password.encode()).hexdigest() == hashed_password

def get_password_hash(password):
    # return pwd_context.hash(password)
    return hashlib.sha256(password.encode()).hexdigest()

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@router.post("/register", response_model=Token)
def register(user: UserCreate, request: Request, session: Session = Depends(get_session)):
    # Check rate limit (would be here if Limiter attached to router)
    
    # Check existing
    existing_user = session.exec(select(User).where(User.username == user.username)).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    existing_email = session.exec(select(User).where(User.email == user.email)).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create User
    try:
        db_user = User(
            username=user.username,
            password_hash=get_password_hash(user.password),
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email
        )
        session.add(db_user)
        session.commit()
        session.refresh(db_user)
    except Exception as e:
        print(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail=str(e))
    
    # Generate Token
    access_token = create_access_token(data={"sub": db_user.username})
    return {"access_token": access_token, "token_type": "bearer"}

from fastapi.security import OAuth2PasswordBearer

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), session: Session = Depends(get_session)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    user = session.exec(select(User).where(User.username == username)).first()
    if user is None:
        raise credentials_exception
    return user

@router.get("/me", response_model=User)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/login", response_model=Token)
def login(form_data: LoginRequest, session: Session = Depends(get_session)):
    print(f"Login attempt for: {form_data.username}")
    user = session.exec(select(User).where(User.username == form_data.username)).first()
    if not user:
        print("User not found in DB")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not verify_password(form_data.password, user.password_hash):
        print(f"Password mismatch for {form_data.username}")
        # print(f"Input hash: {hashlib.sha256(form_data.password.encode()).hexdigest()}")
        # print(f"DB hash:    {user.password_hash}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    print("Login successful")
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}
