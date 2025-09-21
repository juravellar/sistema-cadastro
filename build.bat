@echo off
echo 🚀 Building sistema-cadastro...

REM Install root dependencies
echo 📦 Installing root dependencies...
npm install

REM Install backend dependencies
echo 📦 Installing backend dependencies...
cd backend
npm install --omit=dev
cd ..

REM Install frontend dependencies
echo 📦 Installing frontend dependencies...
cd frontend
npm install

REM Build frontend
echo 🔨 Building frontend...
npm run build

REM Copy built files to backend public directory
echo 📁 Copying built files...
xcopy /E /I dist ..\backend\public\

echo ✅ Build completed successfully!
pause
