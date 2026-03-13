import os
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient

# ensure environment variable is set to not interfere
os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from app import main, models

@pytest.fixture(scope="session")
def db_engine(tmp_path_factory):
    # use a temporary sqlite file for the session
    db_file = tmp_path_factory.mktemp("data") / "test.db"
    engine = create_engine(f"sqlite:///{db_file}", connect_args={"check_same_thread": False})
    models.Base.metadata.create_all(bind=engine)
    return engine

@pytest.fixture()
def db_session(db_engine):
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=db_engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()

@pytest.fixture()
def client(db_session):
    # override dependency to use the session created above
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    main.app.dependency_overrides[main.get_db] = override_get_db
    with TestClient(main.app) as c:
        yield c
    main.app.dependency_overrides.clear()
