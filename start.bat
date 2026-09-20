@echo off
title AI Proctor Exam Portal Launcher
echo ===================================================
echo 🚀 Starting AI Proctor Exam Portal System...
echo ===================================================
echo.

cd /d "%~dp0"

echo [1/3] Checking Database and Seeding Default Accounts...
node seed.js

echo.
echo [2/3] Starting Backend Server (Port 5000)...
start "Backend Server" cmd /k "node server.js"

echo.
echo [3/3] Starting Frontend Server (Port 5173)...
cd frontend
start "Frontend Server" cmd /k "npm run dev"

timeout /t 3 >nul

echo.
echo ===================================================
echo ✅ System Started Successfully!
echo Opening browser at http://localhost:5173
echo ===================================================
echo.

start http://localhost:5173
