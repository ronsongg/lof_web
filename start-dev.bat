@echo off
title LOF Dev Server

echo.
echo ========================================
echo    LOF Development Server
echo ========================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found!
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo [INFO] Node.js version:
node -v
echo.

if not exist "node_modules\" (
    echo [INFO] Installing dependencies...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo.
        echo [ERROR] Failed to install dependencies
        echo Please try manually: npm install
        pause
        exit /b 1
    )
    echo.
    echo [SUCCESS] Dependencies installed!
    echo.
)

echo [INFO] Starting development server...
echo.
echo ----------------------------------------
echo  URL: http://localhost:5173
echo  Press Ctrl+C to stop
echo ----------------------------------------
echo.

npm run dev

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Server failed to start
    pause
)
