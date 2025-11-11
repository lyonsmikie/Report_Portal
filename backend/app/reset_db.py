# backend/app/reset_db.py
from app.database import Base, engine

# WARNING: This will delete all existing data in your tables
print("Dropping all tables...")
Base.metadata.drop_all(bind=engine)

print("Creating tables according to models...")
Base.metadata.create_all(bind=engine)

print("Done! Tables are reset.")
