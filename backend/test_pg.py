import psycopg2

conn = psycopg2.connect(
    dbname="report_db",
    user="admin",
    password="admin",
    host="localhost",
    port="5432"
)
print("Connected successfully")
conn.close()
