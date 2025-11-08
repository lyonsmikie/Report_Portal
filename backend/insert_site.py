import psycopg2
from datetime import datetime

conn = psycopg2.connect(
    dbname="report_db",
    user="admin",
    password="admin",
    host="localhost",
    port="5432"
)

cur = conn.cursor()

cur.execute("INSERT INTO sites (name) VALUES (%s)", ("Site A",))
cur.execute(
    "INSERT INTO users (email, hashed_password, site_id) VALUES (%s, %s, %s)",
    ("test@example.com", "hashedpw", 1)
)
cur.execute(
    "INSERT INTO reports (site_id, file_name, file_type, date) VALUES (%s, %s, %s, %s)",
    (1, "report1.pdf", "pdf", datetime.now())
)

conn.commit()
cur.close()
conn.close()
