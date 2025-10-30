@echo off
echo ========================================
echo    ANURANAN MOBILE ACCESS - QUICK START
echo ========================================
echo.
echo Your Computer IP: 192.168.0.183
echo.
echo Access from mobile: http://192.168.0.183:3000
echo.
echo ========================================
echo.

echo STEP 1: Setting up firewall rules...
echo Please run PowerShell as Administrator and execute:
echo.
echo    cd c:\VSCODE\anuranan_emp
echo    .\setup-firewall.ps1
echo.
echo Press any key when firewall is configured...
pause >nul

echo.
echo STEP 2: Starting Backend Server...
echo.
start "Backend Server" cmd /k "cd /d c:\VSCODE\anuranan_emp\backend && npm run dev"

timeout /t 5 /nobreak >nul

echo STEP 3: Starting Frontend Server...
echo.
start "Frontend Server" cmd /k "cd /d c:\VSCODE\anuranan_emp\frontend && npm run dev"

echo.
echo ========================================
echo    SERVERS STARTED!
echo ========================================
echo.
echo Backend:  Check "Backend Server" window
echo Frontend: Check "Frontend Server" window
echo.
echo On your mobile device (same WiFi):
echo 1. Open browser
echo 2. Go to: http://192.168.0.183:3000
echo.
echo Press any key to exit this window...
pause >nul
