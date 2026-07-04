@echo off
chcp 65001 > nul
echo ===================================================
echo   高中物理学习规划生成器 - 启动服务器
echo ===================================================
echo.

REM 检查 node 是否可用
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未检测到 Node.js，请先安装 Node.js
    echo    下载地址: https://nodejs.org/
    pause
    exit /b 1
)

REM 检查依赖
if not exist "node_modules" (
    echo 📦 首次运行，正在安装依赖...
    call npm install
    if %errorlevel% neq 0 (
        echo ❌ 依赖安装失败
        pause
        exit /b 1
    )
)

echo 🚀 启动服务器...
echo.
echo    浏览器将自动打开 http://localhost:3000
echo    关闭此窗口即可停止服务器
echo.
echo ===================================================
echo.

start http://localhost:3000
node server.js

pause
