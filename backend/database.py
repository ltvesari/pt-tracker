from sqlmodel import SQLModel, create_engine, Session
import os

# Default to SQLite local, but prefer Env Var (Railway uses DATABASE_URL)
database_url = os.getenv("DATABASE_URL")

if database_url:
    # Fix for some platforms (Railway/Heroku) using postgres:// instead of postgresql://
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)
    engine = create_engine(database_url)
else:
    sqlite_file_name = "pt_tracker.db"
    sqlite_url = f"sqlite:///{sqlite_file_name}"
    engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

def get_session():
    with Session(engine) as session:
        yield session
