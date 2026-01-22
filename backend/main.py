from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from sqlmodel import Session, select, text
from backend.database import create_db_and_tables, engine
from backend.routers import auth, students, measurements, reports, profile, admin
from backend.models import User
from backend.routers.auth import get_password_hash

app = FastAPI(title="PT Tracker API", version="1.0.0")

# Rate Limiter Setup (Brute Force Protection)
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS Setup (Allow Frontend)
origins = [
    "http://localhost:5173",  # Vite default
    "http://127.0.0.1:5173",
    "http://localhost:8000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(students.router)
app.include_router(measurements.router)
app.include_router(reports.router)
app.include_router(profile.router)
app.include_router(admin.router)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()
    
    # Manual Migration for 'is_admin' column (since SQLModel create_all doesn't alter existing tables)
    with Session(engine) as session:
        try:
            # Try to select the column to see if it exists
            session.exec(text('SELECT is_admin FROM "user" LIMIT 1'))
        except Exception:
            print("Column is_admin not found, adding it...")
            try:
                # Add the column
                session.exec(text('ALTER TABLE "user" ADD COLUMN is_admin BOOLEAN DEFAULT FALSE'))
                session.commit()
                print("Column is_admin added successfully.")
            except Exception as e:
                print(f"Migration failed: {e}")
                # Don't raise, might be SQLite or other issue, proceed to let SQLModel try its thing if it can
                session.rollback()

    # Create Default Admin
    with Session(engine) as session:
        try:
            admin_user = session.exec(select(User).where(User.username == "admin")).first()
            if not admin_user:
                print("Creating default admin user...")
                admin_user = User(
                    username="admin",
                    password_hash=get_password_hash("1189*"),
                    first_name="Super",
                    last_name="Admin",
                    email="admin@pt-tracker.com",
                    is_admin=True
                )
                session.add(admin_user)
                session.commit()
                print("Default admin user created: admin / 1189*")
            else:
                 # Ensure existing admin has is_admin=True
                if not admin_user.is_admin:
                    admin_user.is_admin = True
                    session.add(admin_user)
                    session.commit()
        except Exception as e:
            print(f"Admin creation failed: {e}")

@app.get("/")
def read_root():
    return {"message": "Welcome to PT Tracker API"}

@app.get("/health")
def health_check():
    return {"status": "ok"}
