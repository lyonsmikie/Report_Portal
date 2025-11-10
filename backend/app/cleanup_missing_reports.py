import os
from .database import SessionLocal
from .models import Report
from .main import UPLOAD_FOLDER  # or define the path here

db = SessionLocal()

reports = db.query(Report).all()
for r in reports:
    if not os.path.exists(os.path.join(UPLOAD_FOLDER, r.file_name)):
        print(f"Deleting missing file DB entry: {r.file_name}")
        db.delete(r)

db.commit()
db.close()
