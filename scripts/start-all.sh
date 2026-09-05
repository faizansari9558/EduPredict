#!/bin/bash
# Bash script to start all 3 EduPredict services

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." >/dev/null 2>&1 && pwd )"

echo "================================================================"
echo "  EDUPREDICT SYSTEM LAUNCHER (FastAPI ML + Node API + React)   "
echo "================================================================"

# 1. Start FastAPI ML Service
echo "[1/3] Starting FastAPI ML Microservice (Port 8000)..."
cd "$DIR" && python -m uvicorn ml.app:app --host 127.0.0.1 --port 8000 &

# 2. Start Express Backend
echo "[2/3] Starting Express Backend API (Port 5000)..."
cd "$DIR/backend" && node server.js &

# 3. Start React Frontend
echo "[3/3] Starting Vite Frontend (Port 3000)..."
cd "$DIR/frontend" && npm run dev &

echo ""
echo "All 3 services running in background."
echo "• Frontend: http://localhost:3000"
echo "• Backend API: http://localhost:5000"
echo "• ML Microservice: http://localhost:8000"

wait
