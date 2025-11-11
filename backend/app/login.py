from sqlalchemy.orm import Session
from . import database, models, auth

def login_user(email: str, password: str):
    db: Session = database.SessionLocal()
    try:
        user = db.query(models.User).filter(models.User.email == email).first()
        if not user:
            return False, "User not found"

        if auth.verify_password(password, user.hashed_password):
            return True, f"Login successful for {email}"
        else:
            return False, "Incorrect password"
    finally:
        db.close()

if __name__ == "__main__":
    # Test login with your users
    email_input = input("Email: ")
    password_input = input("Password: ")

    success, message = login_user(email_input, password_input)
    print(message)
