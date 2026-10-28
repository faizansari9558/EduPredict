# EduPredict Quick Setup & Deployment Script (PowerShell)
# Run this in external PowerShell if VS Code terminal fails
# This script is NOT for VS Code integrated terminal

Write-Host "==========================================" -ForegroundColor Green
Write-Host "EduPredict - Quick Setup Guide" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

# Check if running from project root
if (-not (Test-Path "backend") -or -not (Test-Path "frontend")) {
  Write-Host "ERROR: Please run this script from the EduPredict project root directory" -ForegroundColor Red
  exit 1
}

Write-Host "Step 1: Verify Node.js and npm" -ForegroundColor Yellow
Write-Host "===============================" -ForegroundColor Yellow
node --version
npm.cmd --version
Write-Host ""

Write-Host "Step 2: Install Backend Dependencies" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow
Set-Location backend
Write-Host "Running: npm.cmd install"
npm.cmd install
if ($LASTEXITCODE -ne 0) {
  Write-Host "ERROR: Backend npm install failed" -ForegroundColor Red
  exit 1
}
Write-Host "✓ Backend dependencies installed" -ForegroundColor Green
Set-Location ..
Write-Host ""

Write-Host "Step 3: Install Frontend Dependencies" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow
Set-Location frontend
Write-Host "Running: npm.cmd install"
npm.cmd install
if ($LASTEXITCODE -ne 0) {
  Write-Host "ERROR: Frontend npm install failed" -ForegroundColor Red
  exit 1
}
Write-Host "✓ Frontend dependencies installed" -ForegroundColor Green
Set-Location ..
Write-Host ""

Write-Host "Step 4: Check MySQL Connection" -ForegroundColor Yellow
Write-Host "==============================" -ForegroundColor Yellow
Write-Host "To verify MySQL, run this command:"
Write-Host "  mysql -u root -e 'SELECT 1;'" -ForegroundColor Cyan
Write-Host ""

Write-Host "Step 5: Database Initialization (OPTIONAL)" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "To initialize database, run these commands in PowerShell/CMD:" -ForegroundColor White
Write-Host ""
Write-Host "  # Create base schema:" -ForegroundColor Cyan
Write-Host "  mysql -u root < database/schema.sql" -ForegroundColor Cyan
Write-Host ""
Write-Host "  # Add Phase 7 tables:" -ForegroundColor Cyan
Write-Host "  mysql -u root EduPredict < database/schema-phase7.sql" -ForegroundColor Cyan
Write-Host ""
Write-Host "  # Seed roles:" -ForegroundColor Cyan
Write-Host "  mysql -u root EduPredict < database/seed.sql" -ForegroundColor Cyan
Write-Host ""

Write-Host ""
Write-Host "==========================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
Write-Host ""

Write-Host "To start the application:" -ForegroundColor Yellow
Write-Host ""
Write-Host "TERMINAL 1 - Backend API:" -ForegroundColor Cyan
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  node server.js" -ForegroundColor White
Write-Host ""
Write-Host "TERMINAL 2 - Frontend Dev Server:" -ForegroundColor Cyan
Write-Host "  cd frontend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Then open: http://localhost:3000" -ForegroundColor Green
Write-Host ""

Write-Host "Default Configuration:" -ForegroundColor Yellow
Write-Host "  - Backend API: http://localhost:5000" -ForegroundColor White
Write-Host "  - Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "  - MySQL: localhost:3306, user=root, password=(empty)" -ForegroundColor White
Write-Host "  - Database: EduPredict" -ForegroundColor White
Write-Host ""

Write-Host "Test Endpoints:" -ForegroundColor Yellow
Write-Host "  - Health: curl http://localhost:5000/api/health" -ForegroundColor White
Write-Host "  - Home: curl http://localhost:3000/" -ForegroundColor White
Write-Host ""

Write-Host "==========================================" -ForegroundColor Green
Write-Host "⚠️  NOTE: Do NOT run this in VS Code terminal" -ForegroundColor Red
Write-Host "   Use external PowerShell or Command Prompt" -ForegroundColor Red
Write-Host "==========================================" -ForegroundColor Green
