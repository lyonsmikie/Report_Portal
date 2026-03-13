# Report Portal

This project consists of a **FastAPI backend** and a **React frontend** for uploading and viewing reports by category, date and site (personal/shared/admin).

## Backend Setup

1. **Install requirements**:
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate     # Windows
   pip install -r requirements.txt
   ```

2. **Database**

   - Install PostgreSQL.
   - Create database & user:
     ```sql
     CREATE DATABASE report_db;
     CREATE USER admin WITH PASSWORD 'admin';
     GRANT ALL PRIVILEGES ON DATABASE report_db TO admin;
     ```
   - Alternatively set `DATABASE_URL` env var to a different connection string.

3. **Configure environment variables**
   A `.env` file in the `backend` folder holds configuration that is loaded by `python-dotenv` at startup.  You can simply copy `backend/.env.example` into `.env` and then edit the settings.  At a minimum you need:
   ```env
   DATABASE_URL=postgresql://admin:admin@localhost:5432/report_db
   SECRET_KEY=some-secure-random-string
   ALLOW_ORIGINS=http://localhost:3000
   ```
   Other options such as `SQL_ECHO`, `ADMIN_EMAIL`/`ADMIN_PASSWORD`, etc. are documented in the example file.  Adjust the values for your environment (or set the corresponding environment variables directly).

4. **Create admin user**
   ```bash
   cd backend
   venv\Scripts\activate
   python create_admin.py
   ```
   You can override credentials with `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars.

5. **Run the app**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

## Frontend Setup

1. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

2. **Configure API URL**
   Set `REACT_APP_API_URL` in `.env` (create it in the frontend directory) if the backend is not at `http://localhost:8000`.

3. **Start the dev server**
   ```bash
   npm start
   ```

## Usage

1. Navigate to `http://localhost:3000` and create an account or login with the admin account.
2. Select a site, view reports by category/date, and upload/delete if you have admin privileges.

## Notes

- The backend stores uploaded files under `backend/uploaded_reports` and serves them via `/uploaded_reports`.
- The database tables are created automatically on startup using SQLAlchemy's `create_all`.
- For production use, replace the hardcoded secret key and adjust CORS/origins appropriately.

---

This README was generated to help get the portal running; adjust as needed for your environment.
