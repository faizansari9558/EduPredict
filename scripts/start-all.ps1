Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "  EDUPREDICT SYSTEM LAUNCHER (FastAPI ML + Node API + React)   " -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan

$Root = Split-Path -Parent $PSScriptRoot
$Services = @(
    @{ Name = 'ML service'; Port = 8000; Health = 'http://127.0.0.1:8000/docs' },
    @{ Name = 'Backend API'; Port = 5000; Health = 'http://127.0.0.1:5000/api' },
    @{ Name = 'Frontend'; Port = 3000; Health = 'http://127.0.0.1:3000/' }
)

foreach ($service in $Services) {
    $listener = Get-NetTCPConnection -LocalPort $service.Port -State Listen -ErrorAction SilentlyContinue
    if ($listener) {
        Write-Host "$($service.Name) is already listening on port $($service.Port); keeping the existing process." -ForegroundColor Yellow
    }
}

$PyCmd = "python"
if (Test-Path "$Root\.venv\Scripts\python.exe") {
    $PyCmd = "$Root\.venv\Scripts\python.exe"
}

if (-not (Get-NetTCPConnection -LocalPort 8000 -State Listen -ErrorAction SilentlyContinue)) {
    Write-Host "`nStarting FastAPI ML Microservice (Port 8000)..." -ForegroundColor Yellow
    Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "Set-Location '$Root'; & '$PyCmd' -m uvicorn ml.app:app --host 127.0.0.1 --port 8000"
}
if (-not (Get-NetTCPConnection -LocalPort 5000 -State Listen -ErrorAction SilentlyContinue)) {
    Write-Host "Starting Express Backend API (Port 5000)..." -ForegroundColor Green
    Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "Set-Location '$Root'; node backend\server.js"
}
if (-not (Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue)) {
    Write-Host "Starting Stitch Frontend (Port 3000)..." -ForegroundColor Blue
    Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "Set-Location '$Root'; npm.cmd --prefix stitch run dev"
}

Start-Sleep -Seconds 2
foreach ($service in $Services) {
    try {
        $response = Invoke-WebRequest -Uri $service.Health -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 400) {
            Write-Host "$($service.Name): ready ($($service.Health))" -ForegroundColor Green
        } else {
            Write-Host "$($service.Name): returned HTTP $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "$($service.Name): not ready - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "• Frontend: http://127.0.0.1:3000" -ForegroundColor White
Write-Host "• Backend API: http://127.0.0.1:5000" -ForegroundColor White
Write-Host "• ML Microservice: http://127.0.0.1:8000" -ForegroundColor White

Start-Process "http://127.0.0.1:3000"
