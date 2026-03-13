"""Utility script to create a default admin user.
Run with `python create_admin.py` after setting up the virtualenv and installing requirements.
"""
from app import crud, auth, database, models
from sqlalchemy.orm import Session


def main():
    db: Session = next(database.get_db())
    email = os.getenv("ADMIN_EMAIL", "admin@example.com")
    password = os.getenv("ADMIN_PASSWORD", "secret")

    if crud.get_user_by_email(db, email):
        print(f"Admin user {email} already exists")
        return

    u = models.User(
        email=email,
        hashed_password=auth.get_password_hash(password),
        site_name="admin",
        allowed_sites=",".join(["admin", "shared", "personal"]),
    )
    db.add(u)
    db.commit()
    print(f"Created admin user {email}")


if __name__ == "__main__":
    import os
    main()
