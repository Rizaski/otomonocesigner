Write-Host "Starting local web server on http://localhost:8000" -ForegroundColor Green
Write-Host ""
Write-Host "Open http://localhost:8000 in your browser" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
Set-Location $PSScriptRoot
python -m http.server 8000

