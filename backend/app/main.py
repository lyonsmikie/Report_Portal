# main.py
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi import Body
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from .database import SessionLocal, engine
from . import models, crud, auth, database
from .auth import get_current_user
from datetime import datetime
import shutil
import os
import uuid
from dotenv import load_dotenv

# load .env variables if present
load_dotenv()

# --- Debug: print key startup configuration ---
print("Report Portal starting up...")
print("DATABASE_URL:", os.getenv("DATABASE_URL"))
print("ALLOW_ORIGINS:", os.getenv("ALLOW_ORIGINS"))

# --- Create database tables (guarded) ---
try:
    models.Base.metadata.create_all(bind=engine)
    print("Database tables ensured (create_all completed)")
except Exception as e:
    print("Error creating database tables:", e)
    raise

# --- Ensure visibility column exists (backward compatibility) ---
from sqlalchemy import inspect, String, text
try:
    inspector = inspect(engine)
    if "reports" in inspector.get_table_names():
        columns = [c["name"] for c in inspector.get_columns("reports")]
        if "visibility" not in columns:
            print("Adding missing 'visibility' column to 'reports' table...")
            with engine.connect() as conn:
                # Add the column with default value 'shared'
                if "sqlite" in engine.url.drivername.lower():
                    conn.execute(text("ALTER TABLE reports ADD COLUMN visibility TEXT DEFAULT 'shared'"))
                else:  # PostgreSQL
                    conn.execute(text("ALTER TABLE reports ADD COLUMN visibility VARCHAR DEFAULT 'shared'"))
                conn.commit()
            print("Column 'visibility' added successfully")
except Exception as e:
    print("Warning: Could not add visibility column:", e)
    # Don't crash on this—the column might already exist or DB might be read-only

app = FastAPI(title="Report Portal API")

# --- CORS ---
# allow_origins can be a comma-separated list in the ALLOW_ORIGINS env var
origins = os.getenv("ALLOW_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
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

class LoginRequest(BaseModel):
    email: str
    password: str

from typing import List, Optional

class CreateUserRequest(BaseModel):
    email: EmailStr
    password: str
    site_name: Optional[str] = "shared"
    allowed_sites: Optional[List[str]] = None

# ============================================================
# AUTHENTICATION
# ============================================================
# AUTHENTICATION
@app.post("/login")
def login(login_req: LoginRequest, db: Session = Depends(get_db)):
    email = login_req.email
    password = login_req.password
    print("Received login attempt:", email)

    user = crud.get_user_by_email(db, email)
    if not user:
        print("Login failed: user not found for email:", email)
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not auth.verify_password(password, user.hashed_password):
        print("Login failed: password incorrect for email:", email)
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = auth.create_access_token({"sub": user.email, "site_name": user.site_name})
    print("Login successful for user:", email)

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "email": user.email,
            "site_name": user.site_name,
            # send as comma-string to mimic create-account payload
            "allowed_sites": user.allowed_sites
        }
    }

# ============================================================
# CREATE ACCOUNT
# ============================================================
@app.post("/create-account")
def create_account(req: CreateUserRequest, db: Session = Depends(get_db)):
    print("Incoming create-account payload:", req)

    # Check if email exists
    existing_user = crud.get_user_by_email(db, req.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    # Create new user
    hashed_password = auth.get_password_hash(req.password)
    allowed = req.allowed_sites or [req.site_name]
    new_user = models.User(
        email=req.email,
        hashed_password=hashed_password,
        site_name=req.site_name or "shared",
        allowed_sites=",".join(allowed)
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # AUTO-LOGIN AFTER CREATION (critical fix)
    token = auth.create_access_token({
        "sub": new_user.email,
        "site_name": new_user.site_name
    })

    return {
        "message": f"User {req.email} created successfully",
        "access_token": token,
        "token_type": "bearer",
        "allowed_sites": new_user.allowed_sites.split(",")
    }

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
# CHANGE REPORT VISIBILITY (ADMIN ONLY)
# ============================================================
@app.patch("/report/{report_id}/visibility")
def change_report_visibility(report_id: int, payload: dict = Body(...), db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    if user.site_name != "admin":
        raise HTTPException(status_code=403, detail="Only admins can change report visibility")

    visibility = (payload.get("visibility") or "").lower()
    if visibility not in ["shared", "personal"]:
        raise HTTPException(status_code=400, detail="visibility must be 'shared' or 'personal'")

    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    report.visibility = visibility
    db.add(report)
    db.commit()
    db.refresh(report)

    return {"message": "Visibility updated", "report": {"id": report.id, "visibility": report.visibility}}

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
def get_reports(site_name: str, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    """Fetch all reports for a given site, including admin reports, filtered by visibility tags and current user."""
    reports = (
        db.query(models.Report)
        .filter(
            (models.Report.site_name.ilike(site_name.lower())) |
            (models.Report.site_name.ilike("admin"))
        )
        .order_by(models.Report.date.desc())
        .all()
    )

    # Apply visibility filtering in Python for clarity
    allowed_sites = (user.allowed_sites or "").split(',')

    def visible_to_user(r):
        vis = (r.visibility or "shared").lower()
        if vis == "shared":
            return True
        if vis == "personal":
            return user.site_name == "admin" or user.site_name == "personal" or ("personal" in allowed_sites)
        return False

    return [r for r in reports if visible_to_user(r)]

# ============================================================
# FETCH REPORTS BY CATEGORY (site_name + category)
# ============================================================
@app.get("/reports/{site_name}/{category}")
def get_reports_by_category(site_name: str, category: str, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    """Fetch all reports by site + category, including admin/global, filtered by visibility."""
    reports = (
        db.query(models.Report)
        .filter(
            (
                models.Report.site_name.ilike(site_name.lower()) |
                models.Report.site_name.ilike("admin")
            ),
            models.Report.category.ilike(category.lower())
        )
        .order_by(models.Report.date.desc())
        .all()
    )

    allowed_sites = (user.allowed_sites or "").split(',')

    def visible_to_user(r):
        vis = (r.visibility or "shared").lower()
        if vis == "shared":
            return True
        if vis == "personal":
            return user.site_name == "admin" or user.site_name == "personal" or ("personal" in allowed_sites)
        return False

    return [r for r in reports if visible_to_user(r)]

# ============================================================
# FETCH REPORTS BY DATE (site_name + category + date)
# ============================================================
@app.get("/reports/{site_name}/{category}/{date}")
def get_reports_by_date(site_name: str, category: str, date: str, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    """Fetch all reports by site, category, and date, including admin/global."""
    try:
        parsed_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD.")

    start = datetime.combine(parsed_date, datetime.min.time())
    end = datetime.combine(parsed_date, datetime.max.time())

    reports = (
        db.query(models.Report)
        .filter(
            (
                models.Report.site_name.ilike(site_name.lower()) |
                models.Report.site_name.ilike("admin")
            ),
            models.Report.category.ilike(category.lower()),
            models.Report.date >= start,
            models.Report.date <= end,
        )
        .order_by(models.Report.date.desc())
        .all()
    )

    allowed_sites = (user.allowed_sites or "").split(',')

    def visible_to_user(r):
        vis = (r.visibility or "shared").lower()
        if vis == "shared":
            return True
        if vis == "personal":
            return user.site_name == "admin" or user.site_name == "personal" or ("personal" in allowed_sites)
        return False

    return [r for r in reports if visible_to_user(r)]

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
    override: bool = Form(False),
    save_as_new: bool = Form(False),  # NEW
    visibility: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        # Parse date or default to now
        report_date = datetime.strptime(date, "%Y-%m-%d") if date and date.strip() else datetime.now()
        report_date_str = report_date.strftime("%d%m%Y")

        # File extension
        file_ext = file.filename.split('.')[-1]

        # Check existing reports
        existing_reports = db.query(models.Report).filter(
            models.Report.site_name == site_name.lower(),
            models.Report.category == category.lower(),
            models.Report.date == report_date
        ).all()

        if existing_reports:
            if override:
                # Delete existing files + DB
                for r in existing_reports:
                    existing_file_path = os.path.join(UPLOAD_FOLDER, r.file_name)
                    if os.path.exists(existing_file_path):
                        os.remove(existing_file_path)
                    db.delete(r)
                db.commit()
                filename = f"{category}_{report_date_str}.{file_ext}"
            elif save_as_new:
                # Create a new filename with iteration _X
                i = 2
                while True:
                    filename_candidate = f"{category}_{report_date_str}_{i}.{file_ext}"
                    if not any(r.file_name == filename_candidate for r in existing_reports):
                        filename = filename_candidate
                        break
                    i += 1
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"A report for {category} on {report_date.strftime('%Y-%m-%d')} already exists. Set override or save_as_new."
                )
        else:
            # No existing report → normal filename
            filename = f"{category}_{report_date_str}.{file_ext}"

        file_path = os.path.join(UPLOAD_FOLDER, filename)

        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Save to DB
        # visibility can be provided by the uploader; default to 'shared'
        visibility = visibility.lower() if visibility else "shared"

        new_report = models.Report(
            site_name=site_name.lower(),
            category=category.lower(),
            file_name=filename,
            file_type=file_ext,
            date=report_date,
            visibility=visibility
        )
        db.add(new_report)
        db.commit()
        db.refresh(new_report)

        return {
            "message": "Report uploaded successfully",
            "report": {
                "id": new_report.id,
                "file_name": filename,
                "site_name": new_report.site_name,
                "category": new_report.category,
                    "date": new_report.date.strftime("%Y-%m-%d"),
                    "visibility": new_report.visibility
            }
        }

    except HTTPException:
        raise
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
    """Return all unique report dates for a given site and category, including admin/global."""
    
    reports = (
        db.query(models.Report)
        .filter(
            (
                models.Report.site_name.ilike(site_name.lower()) |
                models.Report.site_name.ilike("admin")
            ),
            models.Report.category.ilike(category.lower())
        )
        .all()
    )

    # Remove DB entries for missing files
    cleaned = []
    for r in reports:
        file_path = os.path.join(UPLOAD_FOLDER, r.file_name)
        if os.path.exists(file_path):
            cleaned.append(r)
        else:
            db.delete(r)
    db.commit()

    # Rebuild unique date list
    unique_dates = sorted(
        {r.date.strftime("%Y-%m-%d") for r in cleaned},
        reverse=True
    )

    return unique_dates

# ============================================================
# DELETED REPORTS
# ============================================================
@app.delete("/delete-report/{report_id}")
def delete_report(report_id: int, db: Session = Depends(get_db), user: models.User = Depends(get_current_user)):
    # Only admins allowed
    if user.site_name != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete reports")
    
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Full file path
    file_path = os.path.join(UPLOAD_FOLDER, report.file_name)

    # Delete the file if it exists
    if os.path.exists(file_path):
        os.remove(file_path)
    else:
        print(f"⚠️ File {report.file_name} not found on disk")

    # Remove from DB
    db.delete(report)
    db.commit()
    return {"detail": "Report deleted successfully"}
