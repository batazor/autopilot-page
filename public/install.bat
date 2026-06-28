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

REM Pull the pre-built images from the GitLab Container Registry mirror
REM (published by .gitlab-ci.yml). docker compose reads WOS_REGISTRY from the
REM environment. To use the GitHub registry instead, set this to
REM ghcr.io/batazor/autopilot (or delete the line).
set "WOS_REGISTRY=registry.gitlab.com/batazor/autopilot"

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

REM --- 6. Clear any previous containers ----------------------
REM  A re-run over a container an earlier failed start left
REM  unhealthy makes ``up`` fast-fail ("dependency ... is
REM  unhealthy") without recreating it. ``down`` removes the old
REM  containers + network first. It does NOT pass ``-v``, so your
REM  named volumes (accounts, state, redis) are kept. On a first
REM  install there's nothing to remove and this is a no-op.
echo [..] Clearing any previous containers (your data is kept) ...
docker compose -f docker-compose.prod.yml down --remove-orphans

REM --- 7. Pull images and start ------------------------------
echo [..] Pulling images from the GitLab mirror and starting the stack. This may take a few minutes ...
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
set "LOGFILE=%WORKDIR%\autopilot-logs.txt"
echo [..] Collecting diagnostics into: %LOGFILE%
> "%LOGFILE%" echo Autopilot diagnostics - %DATE% %TIME%
>> "%LOGFILE%" echo ===== docker version =====
docker version >> "%LOGFILE%" 2>&1
>> "%LOGFILE%" echo ===== docker compose ps =====
docker compose -f "%WORKDIR%\docker-compose.prod.yml" ps -a >> "%LOGFILE%" 2>&1
>> "%LOGFILE%" echo ===== autopilot-api health =====
docker inspect --format "{{json .State.Health}}" autopilot-api >> "%LOGFILE%" 2>&1
>> "%LOGFILE%" echo ===== autopilot-api logs =====
docker logs --tail 300 autopilot-api >> "%LOGFILE%" 2>&1
>> "%LOGFILE%" echo ===== all service logs =====
docker compose -f "%WORKDIR%\docker-compose.prod.yml" logs --no-color --tail 300 >> "%LOGFILE%" 2>&1
echo [OK] Diagnostics saved. Please share this file for help:
echo      %LOGFILE%
start "" notepad "%LOGFILE%"
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
