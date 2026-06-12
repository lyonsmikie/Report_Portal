@echo off
REM Launch Report Portal - starts both backend and frontend servers
REM Windows batch script version

echo.
echo 🚀 Starting Report Portal...
echo.

REM Backend startup
echo 📡 Starting Backend (FastAPI)...
start "Report Portal - Backend" cmd /k "cd backend && venv\Scripts\activate && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

REM Wait a moment for backend to start
timeout /t 2 /nobreak

REM Frontend startup
echo ⚛️  Starting Frontend (React)...
start "Report Portal - Frontend" cmd /k "cd frontend && npm start"

echo.
echo ✅ Servers are starting!
echo    Backend:  http://0.0.0.0:8000
echo    Frontend: http://localhost:3000
echo.
echo 📖 Close either terminal window to stop its respective server.
echo.
