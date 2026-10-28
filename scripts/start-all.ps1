# PowerShell script to start all 3 EduPredict services concurrently at maximum speed

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  EDUPREDICT SYSTEM LAUNCHER (FastAPI ML + Node API + React)   " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

$Root = Split-Path -Parent $PSScriptRoot

$PyCmd = "python"
if (Test-Path "$Root\.venv\Scripts\python.exe") {
    $PyCmd = "$Root\.venv\Scripts\python.exe"
}

# 1. Start FastAPI ML Service
Write-Host "`n[1/3] Starting FastAPI ML Microservice (Port 8000)..." -ForegroundColor Yellow
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$Root'; & '$PyCmd' -m uvicorn ml.app:app --host 127.0.0.1 --port 8000"

# 2. Start Express Backend
Write-Host "[2/3] Starting Express Backend API (Port 5000)..." -ForegroundColor Green
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$Root'; node backend\server.js"

# 3. Start React Frontend
Write-Host "[3/3] Starting Vite Frontend (Port 3000)..." -ForegroundColor Blue
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$Root'; npm.cmd --prefix frontend run dev"

Write-Host "`nAll 3 services launched successfully!" -ForegroundColor Green
Write-Host "• Frontend: http://127.0.0.1:3000" -ForegroundColor White
Write-Host "• Backend API: http://127.0.0.1:5000" -ForegroundColor White
Write-Host "• ML Microservice: http://127.0.0.1:8000" -ForegroundColor White

Start-Process "http://127.0.0.1:3000"

