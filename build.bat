@echo off
title LOF Build

echo.
echo ========================================
echo    LOF Production Build
echo ========================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found!
    pause
    exit /b 1
)

if not exist "node_modules\" (
    echo [INFO] Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
)

if exist "dist\" (
    echo [INFO] Cleaning old build...
    rmdir /s /q dist
    echo.
)

echo [INFO] Building production version...
echo.
call npm run build

if %errorlevel% equ 0 (
    echo.
    echo ========================================
    echo  Build Success!
    echo ========================================
    echo.
    echo  Output: dist\
    echo.

    set /p preview="Preview build? (Y/N): "
    if /i "%preview%"=="Y" (
        echo.
        echo [INFO] Starting preview server...
        echo.
        call npm run preview
    )
) else (
    echo.
    echo [ERROR] Build failed
)

echo.
pause
