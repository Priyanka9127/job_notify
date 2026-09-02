@echo off
title Sarkari Job Notifier - FastAPI Backend
echo ==============================================
echo  Starting Sarkari Job Notifier Backend (Port 8000)
echo ==============================================
cd /d "%~dp0backend"
call venv\Scripts\activate.bat
python main.py
pause
