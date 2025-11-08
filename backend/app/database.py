from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# PostgreSQL connection URL
SQLALCHEMY_DATABASE_URL = "postgresql://admin:admin@localhost:5432/report_db"


# Create the engine
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    echo=True  # set to False in production
)

# SessionLocal class used to create DB sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()
