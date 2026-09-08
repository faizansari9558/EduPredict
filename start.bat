@echo off
title EduPredict Fast Launcher
echo ================================================================
echo             LAUNCHING EDUPREDICT SERVICES FAST...
echo ================================================================

cd /d "%~dp0"

:: 1. Start FastAPI ML Microservice (Port 8000)
echo [1/3] Starting FastAPI ML Microservice (Port 8000)...
start "EduPredict ML Service (Port 8000)" cmd /k "python -m uvicorn ml.app:app --host 127.0.0.1 --port 8000 --reload"

:: 2. Start Express Backend (Port 5000)
echo [2/3] Starting Express Backend API (Port 5000)...
start "EduPredict Backend API (Port 5000)" cmd /k "cd backend && node server.js"

:: 3. Start React Vite Frontend (Port 3000)
echo [3/3] Starting Vite React Frontend (Port 3000)...
start "EduPredict Frontend (Port 3000)" cmd /k "cd frontend && npm.cmd run dev"

echo.
echo ================================================================
echo  All 3 services are running in separate windows!
echo  - Frontend:        http://localhost:3000
echo  - Backend API:     http://localhost:5000
echo  - ML Microservice: http://localhost:8000
echo ================================================================
echo.
timeout /t 3 >nul
start http://localhost:3000
