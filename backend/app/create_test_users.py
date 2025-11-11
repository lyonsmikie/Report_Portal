from sqlalchemy.orm import Session
from . import models, database, auth  # auth contains password hashing function

# List of test users
test_users = [
    {"email": "personal@test.com", "password": "personal123", "site_name": "personal"},
    {"email": "shared@test.com", "password": "shared123", "site_name": "shared"},
    {"email": "admin@test.com", "password": "admin123", "site_name": "admin"},
]

def create_users():
    db: Session = database.SessionLocal()
    try:
        for u in test_users:
            existing = db.query(models.User).filter(models.User.email == u["email"]).first()
            if not existing:
                hashed = auth.get_password_hash(u["password"][:72])
                user = models.User(email=u["email"], hashed_password=hashed, site_name=u["site_name"])
                db.add(user)
        db.commit()
        print("✅ Test users created successfully")
    finally:
        db.close()

if __name__ == "__main__":
    create_users()
