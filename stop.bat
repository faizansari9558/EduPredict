@echo off
title EduPredict Service Stopper
echo ================================================================
echo             STOPPING ALL EDUPREDICT SERVICES...
echo ================================================================

echo Stopping processes on Port 3000 (Legacy Vite)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul

echo Stopping processes on Port 3001 (Stitch Vite)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":3001" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul

echo Stopping processes on Port 5000 (Backend API)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":5000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul

echo Stopping processes on Port 8000 (FastAPI ML)...
for /f "tokens=5" %%a in ('netstat -aon ^| find ":8000" ^| find "LISTENING"') do taskkill /F /PID %%a 2>nul

echo.
echo All EduPredict services stopped successfully.
pause
