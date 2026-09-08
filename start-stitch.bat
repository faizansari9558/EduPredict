@echo off
title EduPredict (Google Stitch UI) Fast Launcher
echo ================================================================
echo     LAUNCHING EDUPREDICT SERVICES WITH GOOGLE STITCH UI...
echo ================================================================

cd /d "%~dp0"

:: 1. Start FastAPI ML Microservice (Port 8000)
echo [1/3] Starting FastAPI ML Microservice (Port 8000)...
start "EduPredict ML Service (Port 8000)" cmd /k "python -m uvicorn ml.app:app --host 127.0.0.1 --port 8000 --reload"

:: 2. Start Express Backend (Port 5000)
echo [2/3] Starting Express Backend API (Port 5000)...
start "EduPredict Backend API (Port 5000)" cmd /k "cd backend && node server.js"

:: 3. Start Google Stitch React Vite Frontend (Port 3001)
echo [3/3] Starting Google Stitch Frontend (Port 3001)...
start "EduPredict Stitch UI (Port 3001)" cmd /k "cd stitch && npm.cmd run dev"

echo.
echo ================================================================
echo  All 3 services are running in separate windows!
echo  - Stitch Frontend:   http://localhost:3001
echo  - Backend API:       http://localhost:5000
echo  - ML Microservice:   http://localhost:8000
echo ================================================================
echo.
timeout /t 3 >nul
start http://localhost:3001
