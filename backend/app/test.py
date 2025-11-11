from app.database import SessionLocal
from app import models

db = SessionLocal()
user = db.query(models.User).filter(models.User.email == "personal@test.com").first()
print(user.email, user.hashed_password)
db.close()
