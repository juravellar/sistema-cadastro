#!/bin/bash

echo "🚀 Building sistema-cadastro..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install --omit=dev
cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Copy built files to backend public directory
echo "📁 Copying built files..."
cp -r dist/* ../backend/public/

echo "✅ Build completed successfully!"
