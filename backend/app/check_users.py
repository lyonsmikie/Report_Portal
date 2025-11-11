from sqlalchemy.orm import Session
from . import database, models

def show_users():
    db: Session = database.SessionLocal()
    try:
        users = db.query(models.User).all()
        for u in users:
            print(f"ID: {u.id}, Email: {u.email}, Site: {u.site_name}, Hashed: {u.hashed_password[:10]}...")
    finally:
        db.close()

if __name__ == "__main__":
    show_users()
