@echo off
setlocal EnableExtensions
title Autopilot - build from source

REM ============================================================
REM  Autopilot - build the Docker images from source on THIS PC
REM  and run them, instead of pulling the published images.
REM
REM  Useful when the published :latest images are behind, or to
REM  run your own changes. Needs only Docker Desktop - the source
REM  is downloaded for you (curl + tar are built into Windows 10/11,
REM  so no git is required).
REM
REM  Re-run this file to rebuild from the latest source.
REM ============================================================

set "REPO_TARBALL=https://github.com/batazor/autopilot/archive/refs/heads/main.tar.gz"
set "COMPOSE_URL=https://batazor.github.io/autopilot-page/docker-compose.prod.yml"
set "DASHBOARD_URL=http://127.0.0.1:3000/overview"
REM Tag the locally-built images in the GitLab mirror namespace and export
REM WOS_REGISTRY so docker compose resolves to the SAME refs (pull policy
REM "missing" → it uses our local build and never pulls bot/web).
set "WOS_REGISTRY=registry.gitlab.com/batazor/autopilot"
set "BOT_IMAGE=%WOS_REGISTRY%/bot:latest"
set "WEB_IMAGE=%WOS_REGISTRY%/web:latest"
set "ROOT=%USERPROFILE%\autopilot"
set "SRC=%ROOT%\build-src"
set "CTX=%SRC%\autopilot-main"

echo.
echo ==========================================================
echo   Autopilot - build from source
echo ==========================================================
echo.
echo  This downloads the source and builds two Docker images on
echo  this PC. The first build can take 10-20 minutes and a few
echo  GB of disk. Keep Docker Desktop running.
echo.

REM --- 1. Docker present + running ---------------------------
where docker >nul 2>&1
if errorlevel 1 goto :no_docker

docker compose version >nul 2>&1
if errorlevel 1 goto :no_compose

docker info >nul 2>&1
if errorlevel 1 goto :no_engine

echo [OK] Docker is ready.
echo.

REM --- 2. Fresh source --------------------------------------
echo [..] Preparing a clean source folder ...
if exist "%SRC%" rmdir /s /q "%SRC%"
mkdir "%SRC%"
if errorlevel 1 goto :no_workspace

echo [..] Downloading source ...
curl -fsSL "%REPO_TARBALL%" -o "%SRC%\src.tar.gz"
if errorlevel 1 goto :no_source

echo [..] Extracting ...
tar -xzf "%SRC%\src.tar.gz" -C "%SRC%"
if errorlevel 1 goto :no_extract
del /q "%SRC%\src.tar.gz" >nul 2>&1

if not exist "%CTX%\Dockerfile.bot" goto :no_extract
echo [OK] Source ready: %CTX%
echo.

REM --- 3. Build the images ----------------------------------
echo [..] Building the bot image %BOT_IMAGE% ...
docker build -f "%CTX%\Dockerfile.bot" -t %BOT_IMAGE% "%CTX%"
if errorlevel 1 goto :no_build

echo.
echo [..] Building the web image %WEB_IMAGE% ...
docker build -f "%CTX%\Dockerfile.web" -t %WEB_IMAGE% "%CTX%"
if errorlevel 1 goto :no_build

echo.
echo [OK] Both images built.
echo.

REM --- 4. Run folder + compose file -------------------------
if not exist "%ROOT%" mkdir "%ROOT%"
echo [..] Downloading docker-compose.prod.yml ...
curl -fsSL "%COMPOSE_URL%" -o "%ROOT%\docker-compose.prod.yml"
if errorlevel 1 goto :no_download

REM --- 5. Start on the locally-built images ------------------
REM  The default pull policy is "missing": images that are
REM  already present (the bot/web we just built) are used as-is,
REM  and only absent images (redis) are pulled. So nothing
REM  overwrites the local build.
echo [..] Starting the stack with the local images ...
pushd "%ROOT%"
REM  Clear any previous (possibly unhealthy) containers first so ``up``
REM  recreates cleanly. No ``-v`` → named volumes (your data) are kept.
docker compose -f docker-compose.prod.yml down --remove-orphans
docker compose -f docker-compose.prod.yml up -d
set "RC=%ERRORLEVEL%"
popd
if not "%RC%"=="0" goto :no_start

echo.
echo [OK] Stack is up on locally-built images.
echo.

REM --- 6. Open the dashboard ---------------------------------
start "" "%DASHBOARD_URL%"

echo ==========================================================
echo   Done. Dashboard: %DASHBOARD_URL%
echo ==========================================================
echo.
echo  Reminder - two one-time settings this script cannot change:
echo   1. Docker Desktop, Settings, Resources, Network: tick
echo      "Enable host networking", then Apply and restart.
echo   2. BlueStacks, Settings, Advanced, Android Debug Bridge:
echo      set it to Enabled.
echo.
echo  To rebuild later from fresh source, just run this file again.
echo.
goto :done

:no_docker
echo [X] Docker was not found. Install Docker Desktop with WSL2, start it, then run this file again.
start "" https://docs.docker.com/desktop/install/windows-install/
goto :fail

:no_compose
echo [X] Docker Compose v2 was not found. Update Docker Desktop, then run this file again.
goto :fail

:no_engine
echo [X] Docker Desktop is installed but not running. Start it, then run this file again.
goto :fail

:no_workspace
echo [X] Could not prepare the source folder: %SRC%
goto :fail

:no_source
echo [X] Could not download the source. Check your internet connection and try again.
goto :fail

:no_extract
echo [X] Could not extract the source archive. tar is needed (Windows 10 1803+).
goto :fail

:no_build
echo [X] A Docker image build failed. See the error above.
goto :fail

:no_download
echo [X] Could not download docker-compose.prod.yml. Check your internet connection.
goto :fail

:no_start
echo [X] The stack did not start cleanly. See the error above, or run:
echo         docker compose -f "%ROOT%\docker-compose.prod.yml" logs
goto :fail

:fail
echo.
echo Build did not finish. Fix the issue above and run this file again.
echo.
pause
endlocal
exit /b 1

:done
pause
endlocal
exit /b 0
