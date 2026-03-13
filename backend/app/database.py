from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os
from dotenv import load_dotenv

# load .env if present
load_dotenv()

# PostgreSQL connection URL (override with DATABASE_URL env var)
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://admin:admin@localhost:5432/report_db"
)

# Create the engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    echo=os.getenv("SQL_ECHO", "true").lower() == "true"  # set to False in production
)

# SessionLocal class used to create DB sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Base class for models
Base = declarative_base()

# Uplaod folder location
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploaded_reports')