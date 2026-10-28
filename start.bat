@echo off
title EduPredict Fast Launcher
echo ================================================================
echo             LAUNCHING EDUPREDICT SERVICES FAST...
echo ================================================================

cd /d "%~dp0"

:: 1. Detect Python executable
set "PY_CMD=python"
if exist ".venv\Scripts\python.exe" (
    set "PY_CMD=.venv\Scripts\python.exe"
)

:: 2. Start FastAPI ML Microservice (Port 8000)
echo [1/3] Starting FastAPI ML Microservice (Port 8000)...
start "EduPredict ML Service (Port 8000)" cmd /k "%PY_CMD% -m uvicorn ml.app:app --host 127.0.0.1 --port 8000"

:: 3. Start Express Backend API (Port 5000)
echo [2/3] Starting Express Backend API (Port 5000)...
start "EduPredict Backend API (Port 5000)" cmd /k "node backend\server.js"

:: 4. Start Vite React Frontend (Port 3000)
echo [3/3] Starting Vite React Frontend (Port 3000)...
start "EduPredict Frontend (Port 3000)" cmd /k "npm.cmd --prefix stitch run dev"

echo.
echo ================================================================
echo  All 3 services are running in separate windows!
echo  - Frontend:        http://127.0.0.1:3000
echo  - Backend API:     http://127.0.0.1:5000
echo  - ML Microservice: http://127.0.0.1:8000
echo ================================================================
echo.
start http://127.0.0.1:3000
