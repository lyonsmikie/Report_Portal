# backend/app/reset_users_table.py
from app.database import Base, engine
from app import models

# Drop only the users table
models.User.__table__.drop(engine, checkfirst=True)

# Recreate the table according to the model
models.User.__table__.create(engine)
print("users table reset successfully")
