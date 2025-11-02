@echo off
echo ========================================
echo Starting local web server...
echo ========================================
echo.
echo Server will be available at:
echo   http://localhost:8000
echo   http://127.0.0.1:8000
echo.
echo Open one of these URLs in your browser
echo Press Ctrl+C to stop the server
echo.
cd /d "%~dp0"
echo Current directory: %CD%
echo.
echo Starting server on port 8000...
python -m http.server 8000
pause

