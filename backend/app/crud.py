# crud.py
from sqlalchemy.orm import Session
from . import models

def get_reports_by_site(db: Session, site_id: int):
    return db.query(models.Report).filter(models.Report.site_id == site_id).all()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()
