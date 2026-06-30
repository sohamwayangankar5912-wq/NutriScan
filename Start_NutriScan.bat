@echo off
title NutriScan AI Launcher
echo ===================================================
echo           Starting NutriScan AI Application
echo ===================================================
echo.

:: 1. Start FastAPI Backend in a new command window
echo [1/3] Starting FastAPI Backend on port 8000...
start "NutriScan Backend" cmd /k "cd backend && venv\Scripts\activate && uvicorn app.main:app --host 127.0.0.1 --port 8000"

:: 2. Start React/Vite Frontend in a new command window
echo [2/3] Starting Vite React Frontend on port 3000...
start "NutriScan Frontend" cmd /k "cd frontend && npm run dev"

:: 3. Wait for the servers to initialize, then launch the browser
echo [3/3] Waiting for servers to initialize...
timeout /t 4 /nobreak >nul

echo.
echo Opening http://localhost:3000 in your browser...
start http://localhost:3000

echo.
echo ===================================================
echo  NutriScan AI is now running! 
echo  Keep the Backend and Frontend command windows open.
echo ===================================================
echo.
pause
