#!/bin/bash
# Launch Report Portal - starts both backend and frontend servers
# Mac/Linux shell script version
#
# For Windows, use: run.ps1 or run.bat

set -e

echo ""
echo "🚀 Starting Report Portal..."
echo ""

# Backend startup
echo "📡 Starting Backend (FastAPI)..."
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Frontend startup
echo "⚛️  Starting Frontend (React)..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Servers are starting!"
echo "   Backend:  http://0.0.0.0:8000"
echo "   Frontend: http://localhost:3000"
echo ""
echo "📖 Press Ctrl+C to stop both servers."
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
