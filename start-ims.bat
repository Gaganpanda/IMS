@echo off

start /min cmd /c "cd /d C:\Users\hp\Desktop\IMS\backend && .\\mvnw spring-boot:run"

timeout /t 12 >nul

start /min cmd /c "cd /d C:\Users\hp\Desktop\IMS\frontend && npm run dev"

timeout /t 8 >nul

start http://localhost:3000

exit