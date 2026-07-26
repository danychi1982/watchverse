@echo off
setlocal

set "PROFILE=%LOCALAPPDATA%\Watchverse\e2e-chrome-profile"
set "WATCHVERSE_URL=https://danychi1982.github.io/watchverse/#/home"
set "BROWSER="

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "BROWSER=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "BROWSER=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" set "BROWSER=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if not defined BROWSER if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" set "BROWSER=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"

if not defined BROWSER (
  echo Chrome o Edge non trovato nei percorsi standard.
  echo Installa o configura un browser supportato e riprova.
  pause
  exit /b 1
)

if not exist "%PROFILE%" mkdir "%PROFILE%"

start "Watchverse E2E" "%BROWSER%" --remote-debugging-port=9222 "--user-data-dir=%PROFILE%" --no-first-run --no-default-browser-check "%WATCHVERSE_URL%"

echo.
echo Browser E2E avviato con profilo separato.
echo Mantieni questa finestra del browser aperta durante i test.
echo Percorso progetto: %~dp0
echo Indirizzo Watchverse: %WATCHVERSE_URL%
echo Porta CDP: 9222
echo.
timeout /t 3 /nobreak >nul
endlocal
