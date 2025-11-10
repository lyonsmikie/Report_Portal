# main.py
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from .database import SessionLocal, engine
from . import models, crud, auth
from datetime import datetime
import shutil
import os

# --- Create database tables ---
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Report Portal API")

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Database dependency ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ============================================================
# AUTHENTICATION
# ============================================================
@app.post("/login")
def login(email: str, password: str, db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, email)
    if not user or not auth.verify_password(password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = auth.create_access_token({"sub": user.email, "site_name": user.site_name})
    return {"access_token": token, "token_type": "bearer"}

# ============================================================
# SITE MANAGEMENT
# ============================================================
@app.get("/sites")
def get_sites():
    """Return available sites for dropdowns or landing page."""
    return [
        {"name": "personal"},
        {"name": "shared"},
    ]

# ============================================================
# REPORTS: CATEGORY + DATE HANDLERS
# ============================================================

REPORT_CATEGORIES = ["MACD", "RSI", "Stochastic", "Other1", "Other2"]

@app.get("/report-categories")
def get_categories():
    """Return fixed list of report categories."""
    return REPORT_CATEGORIES

# ============================================================
# FETCH REPORTS BY SITE NAME
# ============================================================
@app.get("/reports")
def get_reports(site_name: str, db: Session = Depends(get_db)):
    """Fetch all reports for a given site."""
    reports = crud.get_reports_by_site(db, site_name.lower())
    return reports

# ============================================================
# FETCH REPORTS BY CATEGORY (site_name + category)
# ============================================================
@app.get("/reports/{site_name}/{category}")
def get_reports_by_category(site_name: str, category: str, db: Session = Depends(get_db)):
    """Fetch all reports by site and category."""
    reports = crud.get_reports_by_category(db, site_name.lower(), category.lower())
    if not reports:
        return []
    return reports

# ============================================================
# FETCH REPORTS BY DATE (site_name + category + date)
# ============================================================
@app.get("/reports/{site_name}/{category}/{date}")
def get_reports_by_date(site_name: str, category: str, date: str, db: Session = Depends(get_db)):
    """Fetch all reports by site, category, and date."""
    try:
        parsed_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    start = datetime.combine(parsed_date, datetime.min.time())
    end = datetime.combine(parsed_date, datetime.max.time())

    reports = crud.get_reports_by_date(db, site_name.lower(), category.lower(), start, end)
    return reports

# ============================================================
# FILE UPLOAD
# ============================================================

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), "..", "uploaded_reports")
UPLOAD_FOLDER = os.path.abspath(UPLOAD_FOLDER)
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Serve uploaded files
app.mount("/uploaded_reports", StaticFiles(directory=UPLOAD_FOLDER), name="uploaded_reports")

@app.post("/upload-report")
async def upload_report(
    site_name: str = Form(...),
    category: str = Form(...),
    date: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        # Parse date or default to now
        report_date = datetime.strptime(date, "%Y-%m-%d") if date and date.strip() else datetime.now()
        
        # Format date for filename
        report_date_str = report_date.strftime("%d%m%Y")
        
        # Safe filename
        import uuid
        file_ext = file.filename.split('.')[-1]
        filename = f"{category}_{report_date_str}.{file_ext}"
        file_path = os.path.join(UPLOAD_FOLDER, filename)

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # DB record
        new_report = models.Report(
            site_name=site_name.lower(),
            category=category.lower(),
            file_name=filename,
            file_type=file.filename.split('.')[-1],
            date=report_date
        )
        db.add(new_report)
        db.commit()
        db.refresh(new_report)

        return {
            "message": "Report uploaded successfully",
            "report": {
                "id": new_report.id,
                "file_name": filename,  # already in Category_ddmmyyyy format
                "site_name": new_report.site_name,
                "category": new_report.category,
                "date": new_report.date.strftime("%Y-%m-%d")
            }
        }
    except Exception as e:
        print("Upload error:", e)
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# REPORT FILE ACCESS (DIRECT BY ID)
# ============================================================
@app.get("/report-file/{report_id}")
def get_report_file(report_id: int, db: Session = Depends(get_db)):
    """Return a report file by ID (used for internal links)."""
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    file_path = os.path.join(UPLOAD_FOLDER, report.file_name)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File missing on server")

    return {"file_name": report.file_name, "file_path": file_path}

# ============================================================
# REPORT DATES (ALL UNIQUE DATES FOR A CATEGORY)
# ============================================================
@app.get("/report-dates/{site_name}/{category}")
def get_report_dates(site_name: str, category: str, db: Session = Depends(get_db)):
    """Return all unique report dates for a given site and category."""
    reports = crud.get_reports_by_category(db, site_name.lower(), category.lower())

    # Remove DB entries for files that no longer exist
    for r in reports:
        file_path = os.path.join(UPLOAD_FOLDER, r.file_name)
        if not os.path.exists(file_path):
            db.delete(r)
    db.commit()

    # Re-fetch reports after deletion
    reports = crud.get_reports_by_category(db, site_name.lower(), category.lower())
    
    # Filter out reports whose file no longer exists
    existing_reports = [
        r for r in reports if os.path.exists(os.path.join(UPLOAD_FOLDER, r.file_name))
    ]

    unique_dates = sorted(
        list({r.date.strftime("%Y-%m-%d") for r in existing_reports}),
        reverse=True,
    )
    return unique_dates

# ============================================================
# DELETED REPORTS
# ============================================================
@app.delete("/delete-report/{report_id}")
def delete_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Delete file from disk
    file_path = os.path.join(UPLOAD_FOLDER, report.file_name)
    if os.path.exists(file_path):
        os.remove(file_path)

    # Remove from DB
    db.delete(report)
    db.commit()
    return {"detail": "Report deleted successfully"}
