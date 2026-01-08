@echo off
REM Script để stop tất cả Docker containers

echo ==========================================
echo 🛑 Stopping All Services
echo ==========================================

docker compose down

echo.
echo ✅ All services stopped and removed!
echo.

pause
