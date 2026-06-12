#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Launch Report Portal - starts both backend and frontend servers.
.DESCRIPTION
    This script opens the backend (FastAPI) and frontend (React) in separate terminals.
    Requires Python venv and Node.js to be installed.
#>

$ErrorActionPreference = "Stop"

Write-Host "🚀 Starting Report Portal..." -ForegroundColor Green
Write-Host ""

# Get script directory - use $PSScriptRoot for reliable path resolution
$ScriptDir = $PSScriptRoot

# Backend startup
Write-Host "📡 Starting Backend (FastAPI)..." -ForegroundColor Cyan
$BackendCmd = "cd '$ScriptDir\backend'; .\venv\Scripts\activate; uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", $BackendCmd

# Wait a moment for backend to start
Start-Sleep -Seconds 2

# Frontend startup
Write-Host "⚛️  Starting Frontend (React)..." -ForegroundColor Cyan
$FrontendCmd = "cd '$ScriptDir\frontend'; npm start"
Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", $FrontendCmd

Write-Host ""
Write-Host "✅ Servers are starting!" -ForegroundColor Green
Write-Host "   Backend:  http://0.0.0.0:8000" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Yellow
Write-Host ""
Write-Host "📖 Close either terminal window to stop its respective server." -ForegroundColor Gray
