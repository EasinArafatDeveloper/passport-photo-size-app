@echo off
echo ============================================
echo   PassportAI - Backend Setup
echo ============================================

cd /d "%~dp0"

echo [1/3] Creating Python virtual environment...
python -m venv venv

echo [2/3] Activating venv and installing dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt

echo [3/3] Starting FastAPI server...
python main.py

pause
