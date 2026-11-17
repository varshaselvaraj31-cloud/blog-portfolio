@echo off
title Blog Portfolio - Launch All
echo ======================================================================
echo           Starting Blog Portfolio Web Application
echo ======================================================================
echo   1. Backend API: http://localhost:5000 (MongoDB blogDB)
echo   2. Frontend UI: http://localhost:3000 (React + Firebase Auth)
echo ======================================================================
echo.
echo Launching Backend server in a new window...
start "Blog Portfolio - Backend Server" cmd /k "cd /d \"%~dp0blog-project-starter-backend\" && npm start"

echo Launching Frontend React App in a new window...
start "Blog Portfolio - Frontend React App" cmd /k "cd /d \"%~dp0blog-project-starter-frontend\" && npm start"

echo.
echo Both servers have been launched! You can close this window.
timeout /t 5
