
@echo off
echo 🚀 Starting RFP Analyzer Backend Services...
echo ==================================================

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python 3.8 or higher.
    pause
    exit /b 1
)

REM Create virtual environment if it doesn't exist
if not exist "venv" (
    echo 📦 Creating Python virtual environment...
    python -m venv venv
)

REM Activate virtual environment
echo 🔧 Activating virtual environment...
call venv\Scripts\activate

REM Install Python dependencies
echo 📋 Installing Python dependencies...
pip install -r requirements.txt

REM Install Playwright browsers
echo 🎭 Installing Playwright browsers...
python -m playwright install firefox

REM Create screenshots directory
echo 📁 Creating screenshots directory...
if not exist "screenshots" mkdir screenshots

REM Start the Flask backend
echo 🌐 Starting Flask backend on port 8080...
echo 📝 Backend will be available at: http://localhost:8080
echo 🔗 Frontend should connect to this backend automatically
echo ==================================================

python app.py
pause
