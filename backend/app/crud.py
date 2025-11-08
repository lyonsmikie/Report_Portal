# crud.py
from sqlalchemy.orm import Session
from . import models

# ✅ Get all reports for a given site (by site_name)
def get_reports_by_site(db: Session, site_name: str):
    return (
        db.query(models.Report)
        .filter(models.Report.site_name.ilike(site_name))
        .order_by(models.Report.date.desc())
        .all()
    )

# ✅ Get reports filtered by category
def get_reports_by_category(db: Session, site_name: str, category: str):
    return (
        db.query(models.Report)
        .filter(
            models.Report.site_name.ilike(site_name),
            models.Report.category.ilike(category)
        )
        .order_by(models.Report.date.desc())
        .all()
    )

# ✅ Optionally, get reports by date (to simplify main.py)
def get_reports_by_date(db: Session, site_name: str, category: str, start, end):
    return (
        db.query(models.Report)
        .filter(
            models.Report.site_name.ilike(site_name),
            models.Report.category.ilike(category),
            models.Report.date >= start,
            models.Report.date <= end
        )
        .order_by(models.Report.date.desc())
        .all()
    )

# ✅ Keep this if you have users
def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()
