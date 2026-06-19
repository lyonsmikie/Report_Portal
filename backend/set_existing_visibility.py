"""
Run from the `backend/` folder:

python set_existing_visibility.py

This script will set `visibility = 'shared'` for any Report rows where visibility is NULL or empty.
It uses the app's database configuration (app.database.SessionLocal).
"""

from app.database import SessionLocal
from app import models


def main():
    db = SessionLocal()
    try:
        # Find reports with NULL or empty visibility
        reports = db.query(models.Report).filter((models.Report.visibility == None) | (models.Report.visibility == "")).all()
        if not reports:
            print("No reports with empty visibility found.")
            return

        count = 0
        for r in reports:
            r.visibility = "shared"
            db.add(r)
            count += 1

        db.commit()
        print(f"Updated {count} reports to visibility='shared'.")
    except Exception as e:
        print("Error updating reports:", e)
    finally:
        db.close()


if __name__ == '__main__':
    main()
