#!/bin/bash
# EduPredict Quick Setup & Deployment Script
# Run this in external terminal (PowerShell, Git Bash, or Cmd) if VS Code terminal fails
# This script is NOT for VS Code integrated terminal

echo "==========================================="
echo "EduPredict - Quick Setup Guide"
echo "==========================================="
echo ""

# Check if running from project root
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
  echo "ERROR: Please run this script from the EduPredict project root directory"
  exit 1
fi

echo "Step 1: Verify Node.js and npm"
echo "==============================="
node --version
npm --version
echo ""

echo "Step 2: Install Backend Dependencies"
echo "====================================="
cd backend
echo "Running: npm install"
npm install
if [ $? -ne 0 ]; then
  echo "ERROR: Backend npm install failed"
  exit 1
fi
echo "✓ Backend dependencies installed"
cd ..
echo ""

echo "Step 3: Install Frontend Dependencies"
echo "======================================"
cd frontend
echo "Running: npm install"
npm install
if [ $? -ne 0 ]; then
  echo "ERROR: Frontend npm install failed"
  exit 1
fi
echo "✓ Frontend dependencies installed"
cd ..
echo ""

echo "Step 4: Check MySQL Connection"
echo "=============================="
echo "Checking if MySQL is running on localhost:3306"
# This is a simple check - may not work on all systems
if command -v mysql &> /dev/null; then
  mysql -u root -e "SELECT 1" 2>/dev/null
  if [ $? -eq 0 ]; then
    echo "✓ MySQL connection successful"
  else
    echo "⚠ MySQL connection failed - database may not be running"
    echo "  Start MySQL before running the app"
  fi
else
  echo "⚠ MySQL client not found - skipping connection check"
  echo "  Verify MySQL is running manually"
fi
echo ""

echo "Step 5: Database Initialization (OPTIONAL)"
echo "=========================================="
echo "To initialize database, run these commands separately:"
echo ""
echo "  # Create base schema:"
echo "  mysql -u root < database/schema.sql"
echo ""
echo "  # Add Phase 7 tables:"
echo "  mysql -u root EduPredict < database/schema-phase7.sql"
echo ""
echo "  # Seed roles:"
echo "  mysql -u root EduPredict < database/seed.sql"
echo ""

echo ""
echo "==========================================="
echo "Setup Complete!"
echo "==========================================="
echo ""
echo "To start the application:"
echo ""
echo "TERMINAL 1 - Backend API:"
echo "  cd backend"
echo "  node server.js"
echo ""
echo "TERMINAL 2 - Frontend Dev Server:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Then open: http://localhost:3000"
echo ""
echo "Default .env configuration:"
echo "  - Backend: http://localhost:5000"
echo "  - MySQL: localhost:3306, user=root, password=(empty)"
echo "  - Database: EduPredict"
echo ""
echo "==========================================="
