# Report Portal

This project consists of a **FastAPI backend** and a **React frontend** for uploading and viewing reports by category, date and site (personal/shared/admin).

📋 **For detailed technical specifications and architecture, see [SPECIFICATION.md](./SPECIFICATION.md)** — this document contains complete implementation details, database schemas, API endpoints, and deployment information suitable for recreating or extending the application.

## ⚡ Quick Start (One Command)

After [initial setup](#backend-setup) is complete, you can start both servers with a single command:

**Windows (PowerShell):**
```powershell
.\run.ps1
```

**Windows (Command Prompt / CMD):**
Double-click `run.bat` in the file explorer, OR from CMD/PowerShell run:
```cmd
.\run.bat
```

**Mac/Linux:**
```bash
chmod +x run.sh
./run.sh
```

This will open two new terminal windows—one for the backend, one for the frontend. The React app will automatically open at `http://localhost:3000`.

---

### Running the test suite

A small collection of unit/integration tests is provided under `backend/tests`.
To execute them install the requirements (including `pytest`), then run from
`backend/`:

```bash
venv\Scripts\activate   # or your virtualenv of choice
pytest
```

The tests use an in‑memory SQLite database and do not touch your real data.


1. **Install requirements**:
   ```bash
   cd backend
   python -m venv venv
   venv\Scripts\activate     # Windows
   pip install -r requirements.txt
   ```

2. **Database**

   The code will use whatever URL is in `DATABASE_URL`.  By default it
   falls back to a local SQLite file (`report_db.sqlite`) in the repository,
   so you don’t _need_ to install PostgreSQL for a quick standalone release.

   If you prefer Postgres (or another engine) set `DATABASE_URL` to something
   like:
   ```env
   DATABASE_URL=postgresql://admin:admin@localhost:5432/report_db
   ```

   To prepare Postgres manually:
   ```sql
   CREATE DATABASE report_db;
   CREATE USER admin WITH PASSWORD 'admin';
   GRANT ALL PRIVILEGES ON DATABASE report_db TO admin;
   ```

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

1. Navigate to `http://localhost:3000` and create an account or login with the admin account.  Accounts created through the UI are saved in the database (SQLite by default), so they will persist across restarts.
2. Select a site, view reports by category/date, and upload/delete if you have admin privileges.

*If you use PostgreSQL the same data persistence applies; simply point `DATABASE_URL` at your PG instance.*

## Notes

- The backend stores uploaded files under `backend/uploaded_reports` and serves them via `/uploaded_reports`.
- The database tables are created automatically on startup using SQLAlchemy's `create_all`.
- For production use, replace the hardcoded secret key and adjust CORS/origins appropriately.

---

This README was generated to help get the portal running; adjust as needed for your environment.

# List of test users
test_users = [
    {"email": "personal@test.com", "password": "personal123", "site_name": "personal", "allowed_sites": "personal"},
    {"email": "shared@test.com", "password": "shared123", "site_name": "shared", "allowed_sites": "shared"},
    {"email": "admin@test.com", "password": "admin123", "site_name": "admin", "allowed_sites": "admin"},
]