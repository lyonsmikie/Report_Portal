# backend/app/check_db.py
from app.database import engine

with engine.connect() as conn:
    result = conn.execute("SELECT column_name FROM information_schema.columns WHERE table_name='users';")
    print([row[0] for row in result])
