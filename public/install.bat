@echo off
setlocal EnableExtensions
title Autopilot - install / update

REM ============================================================
REM  Autopilot one-click installer for Windows.
REM
REM  It checks Docker, downloads docker-compose.prod.yml into
REM  %USERPROFILE%\autopilot, pulls the images and starts the
REM  stack, then opens the dashboard.
REM
REM  Re-run this file any time to UPDATE to the latest release
REM  (it refreshes the compose file and pulls newer images).
REM
REM  Nothing else is installed on Windows - the bot container
REM  ships its own adb and connects to BlueStacks for you.
REM ============================================================

set "COMPOSE_URL=https://batazor.github.io/autopilot-page/docker-compose.prod.yml"
set "DASHBOARD_URL=http://127.0.0.1:3000/overview"
set "WORKDIR=%USERPROFILE%\autopilot"

echo.
echo ==========================================================
echo   Autopilot - install / update
echo ==========================================================
echo.

REM --- 1. Docker present? ------------------------------------
where docker >nul 2>&1
if errorlevel 1 goto :no_docker

REM --- 2. Compose v2 present? --------------------------------
docker compose version >nul 2>&1
if errorlevel 1 goto :no_compose

REM --- 3. Docker engine running? -----------------------------
docker info >nul 2>&1
if errorlevel 1 goto :no_engine

echo [OK] Docker is ready.
echo.

REM --- 4. Workspace ------------------------------------------
if not exist "%WORKDIR%" mkdir "%WORKDIR%"
cd /d "%WORKDIR%"
echo [..] Working folder: %WORKDIR%
echo.

REM --- 5. Download the compose file --------------------------
echo [..] Downloading docker-compose.prod.yml ...
curl -fsSL "%COMPOSE_URL%" -o docker-compose.prod.yml
if errorlevel 1 goto :no_download
echo [OK] Compose file saved.
echo.

REM --- 6. Pull images and start ------------------------------
echo [..] Pulling images and starting the stack. This may take a few minutes ...
docker compose -f docker-compose.prod.yml up -d --pull always
if errorlevel 1 goto :no_start
echo.
echo [OK] Stack is up.
echo.

REM --- 7. Open the dashboard ---------------------------------
echo [..] Opening the dashboard: %DASHBOARD_URL%
start "" "%DASHBOARD_URL%"

echo.
echo ==========================================================
echo   Done. The dashboard is at %DASHBOARD_URL%
echo ==========================================================
echo.
echo  Two one-time settings this script cannot change for you:
echo.
echo   1. Docker Desktop, Settings, Resources, Network:
echo      tick "Enable host networking", then Apply and restart.
echo      Without it the bot cannot see your emulator.
echo.
echo   2. BlueStacks, Settings, Advanced, Android Debug Bridge:
echo      set it to Enabled.
echo.
echo  If the dashboard shows no device, fix those two, then press
echo  "Rescan" on the Devices (ADB) page.
echo.
echo  To update later, just run this file again.
echo.
goto :done

:no_docker
echo [X] Docker was not found on this PC.
echo     Install Docker Desktop with WSL2, start it, then run this file again.
echo     Opening the download page ...
start "" https://docs.docker.com/desktop/install/windows-install/
goto :fail

:no_compose
echo [X] Docker Compose v2 was not found.
echo     Update Docker Desktop to a recent version, then run this file again.
goto :fail

:no_engine
echo [X] Docker Desktop is installed but not running.
echo     Start Docker Desktop, wait until it reports "running", then run this file again.
goto :fail

:no_download
echo [X] Could not download the compose file.
echo     Check your internet connection and run this file again.
goto :fail

:no_start
echo.
echo [X] The stack did not start cleanly. See the error above.
echo     To inspect logs, run:
echo         docker compose -f "%WORKDIR%\docker-compose.prod.yml" logs
goto :fail

:fail
echo.
echo Installation did not finish. Fix the issue above and run this file again.
echo.
pause
endlocal
exit /b 1

:done
pause
endlocal
exit /b 0
