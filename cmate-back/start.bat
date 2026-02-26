@echo off
REM CodeMate AI Backend Startup Script for Windows

echo === CodeMate AI Backend ===
echo.

REM Check Python
python3 --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Python3 not found. Please install Python 3.11+
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('python3 --version') do (
    echo [OK] %%i
)

REM Create virtual environment if not exists
if not exist "venv" (
    echo Creating virtual environment...
    python3 -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat
echo [OK] Virtual environment activated

REM Install dependencies
echo Installing dependencies...
pip install --upgrade pip
pip install -r requirements.txt

REM Install Playwright
echo Ensuring Playwright browsers are installed...
playwright install chromium

echo.
echo [OK] Setup complete. Starting server...
echo Server will be available at: ws://localhost:8080
echo.

python main.py
pause
