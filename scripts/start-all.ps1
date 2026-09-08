# PowerShell script to start all 3 EduPredict services concurrently at maximum speed

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  EDUPREDICT SYSTEM LAUNCHER (FastAPI ML + Node API + React)   " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

$Root = Split-Path -Parent $PSScriptRoot

# 1. Start FastAPI ML Service
Write-Host "`n[1/3] Starting FastAPI ML Microservice (Port 8000)..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$Root'; python -m uvicorn ml.app:app --host 127.0.0.1 --port 8000 --reload"

# 2. Start Express Backend
Write-Host "[2/3] Starting Express Backend API (Port 5000)..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$Root\backend'; node server.js"

# 3. Start React Frontend
Write-Host "[3/3] Starting Vite Frontend (Port 3000)..." -ForegroundColor Blue
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$Root\frontend'; npm.cmd run dev"

Write-Host "`nAll 3 services launched successfully!" -ForegroundColor Green
Write-Host "• Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "• Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "• ML Microservice: http://localhost:8000" -ForegroundColor White

Start-Sleep -Seconds 2
Start-Process "http://localhost:3000"

