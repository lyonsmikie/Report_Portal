# Report Portal - Complete Technical Specification

## Executive Summary

**Report Portal** is a standalone web application that enables users to upload, organize, and view financial or analytical reports by category, date, and site. It features role-based access control (personal/shared/admin) with persistent user accounts and a local SQLite database by default. The application is designed to run on a single machine without external dependencies or to be deployed on a server with PostgreSQL for multi-user scenarios.

---

## Technology Stack

### Backend
- **Framework**: FastAPI (Python 3.x)
- **Database ORM**: SQLAlchemy
- **Database Options**: 
  - Default: SQLite (embedded, no setup required)
  - Production: PostgreSQL (or any SQLAlchemy-compatible database)
- **Authentication**: JWT (PyJWT), bcrypt password hashing (passlib)
- **CORS**: FastAPI CORSMiddleware
- **File Serving**: FastAPI StaticFiles
- **Environment Management**: python-dotenv
- **Database Migrations**: Alembic (optional)

### Frontend
- **Framework**: React 18+ (Create React App)
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS
- **State Management**: React hooks (useState, useEffect)

### Development & Deployment
- **Backend Package Manager**: pip
- **Frontend Package Manager**: npm
- **Launcher Scripts**: PowerShell (.ps1), Batch (.bat), Bash (.sh)

---

## Project Structure

```
Report_Portal/
├── backend/                          # FastAPI server (Python)
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI application & endpoints
│   │   ├── models.py                # SQLAlchemy models (User, Report)
│   │   ├── database.py              # DB connection & config
│   │   ├── auth.py                  # JWT & password hashing
│   │   ├── crud.py                  # Database query helpers
│   │   ├── login.py                 # Login utility function
│   │   ├── create_test_users.py     # Seed test user accounts
│   │   ├── create_admin.py          # Create default admin user
│   │   ├── check_db.py              # Utility to inspect DB schema
│   │   ├── check_users.py           # List all users
│   │   ├── cleanup_missing_reports.py # Remove orphaned DB entries
│   │   ├── reset_db.py              # Full DB reset
│   │   ├── reset_users_table.py     # Reset users table only
│   │   ├── utils.py                 # PDF/Excel report generation
│   │   └── __pycache__/
│   ├── tests/                        # Unit & integration tests
│   │   ├── conftest.py              # pytest fixtures (temp DB setup)
│   │   ├── test_auth.py             # Auth module tests
│   │   ├── test_crud.py             # CRUD operation tests
│   │   ├── test_main.py             # API endpoint tests
│   │   └── test_utils.py            # Utility function tests
│   ├── alembic/                      # Database migration scripts (optional)
│   ├── uploaded_reports/             # Store uploaded files (ignored in git)
│   ├── .env                          # Environment configuration (local, not in git)
│   ├── .env.example                  # Template for .env
│   ├── venv/                         # Python virtual environment
│   ├── requirements.txt              # Python dependencies
│   ├── test_pg.py                   # Test PostgreSQL connectivity
│   ├── insert_site.py               # Legacy data insertion
│   └── alembic.ini                  # Alembic configuration
├── frontend/                         # React application
│   ├── public/
│   │   ├── index.html               # HTML entry point
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── src/
│   │   ├── index.js                 # React DOM render
│   │   ├── App.js                   # Router & route definitions
│   │   ├── App.css                  # Global styles
│   │   ├── api.js                   # Axios client & API calls
│   │   ├── components/
│   │   │   ├── HeaderBar.jsx        # Navigation & logout
│   │   │   ├── LandingPage.jsx      # (Commented out)
│   │   │   └── ReportList.jsx       # (Commented out)
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx        # Login/signup form
│   │   │   ├── SitePages.jsx        # Site selection menu
│   │   │   ├── Dashboard.jsx        # Report category grid
│   │   │   ├── ReportDates.jsx      # Date picker for category
│   │   │   ├── ReportViewer.jsx     # View/download reports
│   │   │   └── UploadReport.jsx     # File upload form (admin)
│   │   ├── services/                # (For future organization)
│   │   └── setupTests.js
│   ├── .env.example                  # Frontend env template
│   ├── .gitignore
│   ├── package.json                  # React dependencies
│   ├── tailwind.config.js            # Tailwind CSS config
│   └── node_modules/                # npm packages
├── .gitignore                        # Root git ignore
├── README.md                         # User-facing documentation
├── run.ps1                           # PowerShell launcher
├── run.bat                           # Windows batch launcher
├── run.sh                            # Unix/Mac launcher
└── package.json                      # Root npm config

```

---

## Database Schema

### `users` Table
| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | Integer | PRIMARY KEY | Unique user identifier |
| `email` | String | UNIQUE, NOT NULL | Login username |
| `hashed_password` | String | NOT NULL | bcrypt-hashed password |
| `site_name` | String | NOT NULL | Primary site assignment (personal/shared/admin) |
| `allowed_sites` | String | NOT NULL, default="shared" | Comma-separated list of accessible sites |

### `reports` Table
| Column | Type | Constraints | Purpose |
|--------|------|-------------|---------|
| `id` | Integer | PRIMARY KEY | Unique report identifier |
| `site_name` | String | NOT NULL | Which site this report belongs to |
| `category` | String | NOT NULL | Report category (MACD/RSI/Stochastic/Other1/Other2) |
| `file_name` | String | NOT NULL | Filename on disk (e.g. "MACD_12032026.pdf") |
| `file_type` | String | NOT NULL | File extension (pdf/xlsx/etc.) |
| `date` | DateTime | NOT NULL | Report date (user-specified or current time) |

---

## Authentication & Authorization

### JWT Flow
1. User submits email/password via `/login` or `/create-account`
2. Backend validates credentials and generates JWT token (via PyJWT)
3. Frontend stores token in `localStorage` as `'token'`
4. All subsequent requests include `Authorization: Bearer <token>` header
5. FastAPI `get_current_user()` dependency validates token and retrieves user

### Password Security
- Passwords are hashed using bcrypt (passlib)
- Stored in database as hashed values only
- Never transmitted or logged in plaintext

### Site-Based Access Control
- Three site levels: `personal`, `shared`, `admin`
- Admin users can upload/delete reports; others can only view
- Users see only reports from sites in their `allowed_sites` list + global "admin" reports
- Admin site is always included for admin users across all reports

---

## API Endpoints

### Authentication

**POST /login**
- Body: `{ "email": "...", "password": "..." }`
- Response: `{ "access_token": "...", "token_type": "bearer", "user": { "id", "email", "site_name", "allowed_sites" } }`
- Returns JWT token; user auto-logs in

**POST /create-account**
- Body: `{ "email": "...", "password": "...", "site_name": "shared", "allowed_sites": ["shared"] }`
- Response: `{ "message": "...", "access_token": "...", "token_type": "bearer", "allowed_sites": [...] }`
- Creates new user account with optional site assignment; returns allowed_sites as array (split from comma-separated DB field)
- User is auto-logged in after creation

### Site Management

**GET /sites**
- Response: `[{ "name": "personal" }, { "name": "shared" }]`
- Returns hard-coded list of *selectable* sites for users
- Note: "admin" is not returned here; it's assigned to user accounts via the backend and appears in `allowed_sites`
- Frontend filters visible sites based on user's `allowed_sites` stored in localStorage

**GET /report-categories**
- Response: `["MACD", "RSI", "Stochastic", "Other1", "Other2"]`
- Returns fixed list of report categories

### Report Retrieval

**GET /reports**
- Query params: `site_name` (required)
- Response: Array of report objects matching site (includes "admin" reports)
- Example: `/reports?site_name=personal` returns reports where `site_name IN ("personal", "admin")`

**GET /reports/{site_name}/{category}**
- Returns all reports matching site + category (case-insensitive)

**GET /reports/{site_name}/{category}/{date}**
- Query params: `date` in format `YYYY-MM-DD`
- Returns reports matching all three filters on a specific calendar date

**GET /report-dates/{site_name}/{category}**
- Returns array of unique dates (as strings "YYYY-MM-DD") for a category
- Automatically removes DB entries whose files are missing from disk

**GET /report-file/{report_id}**
- Returns `{ "file_name": "...", "file_path": "..." }`
- Used internally for direct file access

### Report Management

**POST /upload-report**
- Content-Type: `multipart/form-data`
- Fields: 
  - `site_name` (string, required)
  - `category` (string, required)
  - `date` (string, optional, "YYYY-MM-DD" format; defaults to current date)
  - `file` (file, required)
  - `override` (boolean, optional) - delete existing report if present
  - `save_as_new` (boolean, optional) - append iteration number if exists
- Response: `{ "message": "...", "report": { "id", "file_name", "site_name", "category", "date" } }`
- **Note**: Currently no backend authentication check; admin status enforced on frontend only. Should be backend-enforced in production.
- Creates file on disk and DB entry
- If report exists for same site/category/date:
  - If `override=true`: delete old, save new
  - If `save_as_new=true`: rename new to `{category}_{date}_{2,3,4...}.{ext}`
  - Otherwise: return 400 error

**DELETE /delete-report/{report_id}**
- Requires admin authentication (`user.site_name == "admin"`)
- Deletes file from disk and DB entry
- Response: `{ "detail": "Report deleted successfully" }`

### File Serving

**GET /uploaded_reports/{filename}**
- Static file serving via FastAPI `StaticFiles` mount
- Returns the report file for download/viewing
- PDFs render inline in browser; other types prompt download

---

## Frontend Pages & Components

### Components

**HeaderBar.jsx**
- Props: `backLinks` (array of nav links), `showLogout` (boolean)
- Displays left-side navigation buttons and right-side logout button
- Used on all pages after login

**LoginPage.jsx**
- Two-mode form: login vs. create account
- Stores token + allowed_sites in localStorage
- Navigates to `/sites` on success

### Pages

**LoginPage.jsx** (route: `/`)
- Entry point; login or create account form

**SitePages.jsx** (route: `/sites`)
- Displays cards for all three sites: personal, shared, and admin
- Actual visible sites are filtered based on user's `allowed_sites` array (stored in localStorage after login)
- Only shows sites the user has been granted access to
- Clicking site navigates to `/{site_name}/dashboard`
- Example: Regular user with `allowed_sites=["shared"]` only sees "Shared" card
- Example: Admin user with `allowed_sites=["admin","shared","personal"]` sees all three cards

**Dashboard.jsx** (route: `/{site_name}/dashboard`)
- Grid of category cards (MACD, RSI, Stochastic, Other1, Other2)
- Admin users also see "Upload Report" card
- Clicking category goes to `/{site_name}/dashboard/reports/{category}/dates`

**ReportDates.jsx** (route: `/{site_name}/dashboard/reports/{category}/dates`)
- Fetches unique dates for site + category from `/report-dates/{site_name}/{category}`
- Displays clickable date cards (formatted as DD/MM/YYYY)
- Clicking date navigates to `/{site_name}/dashboard/reports/{category}/{date}/view`

**ReportViewer.jsx** (route: `/{site_name}/dashboard/reports/{category}/{date}/view`)
- Fetches reports for site + category + date
- Displays report filename, file preview (PDFs in iframe), or download link
- Admin users see delete button for each report

**UploadReport.jsx** (route: `/{site_name}/dashboard/upload`, admin-only)
- Form with category dropdown, date picker, file input
- Checks if report exists before upload
- If exists: prompts user to override, save as new, or cancel
- Posts to `/upload-report` with multipart form data

---

## File Upload & Storage

### Upload Directory
- Default location: `backend/uploaded_reports/`
- Configurable via `UPLOAD_FOLDER` variable
- Ignored in `.gitignore` (files not committed to repo)

### File Naming Convention
- Format: `{category}_{ddmmyyyy}.{extension}`
  - Example: `MACD_13062026.pdf`
- If duplicate exists and `save_as_new=true`: `{category}_{ddmmyyyy}_{iteration}.{extension}`
  - Example: `MACD_13062026_2.pdf`, `MACD_13062026_3.pdf`

### File Serving
- FastAPI mounts `uploaded_reports` folder as static files
- Frontend accesses via `http://localhost:8000/uploaded_reports/{filename}`
- PDFs render in `<iframe>` for preview; other types download

---

## Configuration & Environment Variables

### Backend `.env` File (in `backend/`)

| Variable | Default | Purpose |
|----------|---------|---------|
| `DATABASE_URL` | `sqlite:///path/to/report_db.sqlite` | Database connection string |
| `SECRET_KEY` | `"your-secret-key"` | JWT signing key (should be long random string in production) |
| `ALGORITHM` | `"HS256"` | JWT algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | JWT token lifetime |
| `ALLOW_ORIGINS` | `"http://localhost:3000"` | CORS whitelist (comma-separated) |
| `SQL_ECHO` | `"true"` | Log SQL queries to console |
| `ADMIN_EMAIL` | `"admin@example.com"` | Default admin email (used by `create_admin.py`) |
| `ADMIN_PASSWORD` | `"secret"` | Default admin password |

### Frontend `.env` File (in `frontend/`)

| Variable | Default | Purpose |
|----------|---------|---------|
| `REACT_APP_API_URL` | `"http://localhost:8000"` | Backend API base URL |

---

## User Workflows

### 1. First-Time Setup (Standalone)
1. User clones/downloads repo
2. Runs `./run.ps1` (Windows) or `./run.sh` (Mac/Linux)
3. Backend and frontend start automatically
4. User navigates to `http://localhost:3000`
5. User creates account (email + password)
6. User is logged in and sees site selection

### 2. Create Account Workflow
1. Click "Create Account" on login page
2. Enter email and password
3. Submit form
4. Backend creates hashed password, stores in SQLite
5. Backend returns JWT token
6. Frontend stores token in localStorage
7. Frontend redirects to site selection (`/sites`)
8. New user can now use the portal

### 3. Login Workflow
1. Enter existing email and password
2. Backend validates credentials
3. Backend issues JWT token
4. Frontend stores token
5. User redirected to site selection

### 4. View Reports Workflow
1. Select a site (personal/shared/admin)
2. Select a category (MACD/RSI/Stochastic/Other1/Other2)
3. System fetches and displays available dates
4. Select a date
5. System displays all reports for that date
6. Click report to preview (PDFs) or download

### 5. Upload Report Workflow (Admin Only)
1. Select "Upload Report" from dashboard
2. Choose category, date, and file
3. Click submit
4. Backend checks if report already exists for that category/date
   - If yes: prompt user to override, save as new, or cancel
   - If no: proceed with upload
5. Backend saves file to disk and creates DB entry
6. Frontend displays success message

### 6. Delete Report Workflow (Admin Only)
1. Navigate to report date
2. Click delete button on report
3. Browser confirms deletion
4. Backend removes file from disk and DB entry
5. Report disappears from list

---

## Helper Scripts & Utilities

### Backend Scripts

**`create_admin.py`**
- Creates a default admin user (or override via `ADMIN_EMAIL`/`ADMIN_PASSWORD` env vars)
- Checks if user exists first (no duplicates)
- Should be run after initial setup: `python create_admin.py`

**`create_test_users.py`**
- Seed database with test users:
  - `personal@test.com` / `personal123` (personal site)
  - `shared@test.com` / `shared123` (shared site)
  - `admin@test.com` / `admin123` (admin site)
- Run: `python create_test_users.py`

**`check_db.py`**
- Lists all columns in the `users` table
- Useful for schema inspection
- Run: `python check_db.py`

**`check_users.py`**
- Lists all users in database with email, site, and hashed password preview
- Run: `python check_users.py`

**`reset_users_table.py`**
- Drops and recreates `users` table (wipes all user data)
- Preserves other tables
- Run: `python reset_users_table.py`

**`reset_db.py`**
- Full database reset (drops all tables and recreates them)
- Wipes all users and reports
- Run: `python reset_db.py`

**`cleanup_missing_reports.py`**
- Finds DB entries for files that are missing from disk
- Deletes those orphaned DB entries
- Run: `python cleanup_missing_reports.py`

**`test_pg.py`**
- Tests PostgreSQL connectivity (for development/debugging)
- Requires `psycopg2` installed

**`insert_site.py`**
- Legacy script for manual data insertion (not actively used)

### Testing

**`backend/tests/`**
- Pytest-based unit and integration tests
- Run with: `pytest` (from `backend/` directory)
- Uses temporary SQLite DB for isolation
- Covers auth, CRUD operations, API endpoints, utilities

---

## Launcher Scripts

### Windows (PowerShell)
**`run.ps1`**
- Opens two new PowerShell windows
- One for backend (port 8000), one for frontend (port 3000)
- Run: `.\run.ps1`

### Windows (Batch)
**`run.bat`**
- Opens two new CMD windows
- Same as PowerShell version
- Run: `.\run.bat` or double-click

### Mac/Linux (Bash)
**`run.sh`**
- Starts backend and frontend in background processes
- Both attach to same terminal
- Run: `chmod +x run.sh && ./run.sh`
- Press Ctrl+C to stop both

---

## Deployment Options

### 1. Standalone (Local Machine)
- Use default SQLite database
- Run `./run.ps1` or equivalent
- No external dependencies
- Single-user only
- Database file persists at `backend/report_db.sqlite`

### 2. Network Deployment (Multi-User)
- Set `DATABASE_URL` to PostgreSQL instance
- Update `ALLOW_ORIGINS` to include client IPs/domains
- Update `REACT_APP_API_URL` frontend to backend server IP
- Deploy backend to server (Linux, Docker, etc.)
- Deploy frontend to server or use static hosting
- Run both processes continuously (systemd, supervisor, etc.)

### 3. Docker Container (Optional)
- Not currently included but straightforward to add
- Backend: `FROM python:3.x` + pip install
- Frontend: Build React (`npm run build`) + serve static files from backend

### 4. Executable Packaging (Optional)
- PyInstaller for backend executable
- Electron or similar for frontend
- Bundles Python/Node runtime for easy distribution

---

## Development & Testing

### Backend Tests
- Location: `backend/tests/`
- Framework: pytest
- Covers:
  - `test_auth.py`: Password hashing, JWT encoding/decoding
  - `test_crud.py`: Database queries
  - `test_main.py`: API endpoints, login flow
  - `test_utils.py`: PDF/Excel generation (mocked)
- Run: `pytest` or `pytest -v` for verbose output

### Running Full App in Development
1. Backend: `uvicorn app.main:app --reload`
2. Frontend: `npm start`
3. Backend auto-reloads on code changes
4. Frontend hot-reloads via React

---

## Key Features

✅ **Authentication** - JWT-based login with bcrypt password hashing
✅ **Role-Based Access** - Personal/Shared/Admin site levels
✅ **Report Organization** - Filter by site, category, and date
✅ **File Upload** - Support for PDF, Excel, and other formats
✅ **Report Preview** - In-browser PDF viewer
✅ **Report Deletion** - Admin-only removal with disk cleanup
✅ **Duplicate Handling** - Override or save-as-new for existing reports
✅ **Persistent Storage** - SQLite by default; Postgres-ready
✅ **Environment-Driven Config** - .env file for all settings
✅ **CORS Support** - Configurable for different deployment origins
✅ **Responsive UI** - Tailwind CSS for mobile/desktop
✅ **Unit Tests** - pytest coverage for backend
✅ **Standalone Launchers** - One-click start scripts for multiple OS

---

## Known Limitations & Future Enhancements

- **Security**: `/upload-report` endpoint lacks backend authentication check (enforced on frontend only - should be backend-enforced)
- **Delete endpoint**: Only checks `user.site_name == "admin"` (correct) but upload doesn't match
- Single-server deployment (no clustering/load balancing)
- No end-to-end report encryption
- No audit logging/access history
- No report versioning (can be added via migrations)
- Frontend tests incomplete (CRA default tests exist)
- Alembic migrations optional (could be required for production)
- No containerization (Docker config could be added)
- No bulk operations (batch upload/delete)
- No advanced search or filtering beyond category/date

---

## Support & Debugging

### Common Issues
1. **Backend won't start**: Check Python version, venv activated, requirements installed
2. **Frontend won't connect**: Check `REACT_APP_API_URL` and CORS `ALLOW_ORIGINS`
3. **Database locked**: Stop all processes and delete `report_db.sqlite` to reset
4. **Port already in use**: Change port in launcher script or kill existing process
5. **Missing dependencies**: Run `pip install -r requirements.txt` and `npm install`

### Logs & Debugging
- Backend: Check stdout in terminal (SQL_ECHO=true for detailed queries)
- Frontend: Browser console (F12) for errors
- Database: Use `check_users.py` or `check_db.py` for inspection

---

## Summary of Installation & Launch

```bash
# One-time setup
cd backend
python -m venv venv
.\venv\Scripts\activate     # Windows
pip install -r requirements.txt
python create_admin.py

cd ../frontend
npm install

# Every time you want to run
cd ..
.\run.ps1   # or run.bat or ./run.sh
```

Then open browser to `http://localhost:3000` and login with `admin@example.com` / `secret`.

