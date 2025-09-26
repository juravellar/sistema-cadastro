#!/bin/bash

# Caminho base do projeto (ajuste se necessário)
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cd "$PROJECT_DIR"

echo "Atualizando dependências do projeto raiz..."
npm install

echo "Atualizando dependências do backend..."
cd backend && npm install

cd "$PROJECT_DIR"
echo "Atualizando dependências do frontend..."
cd frontend && npm install

echo "Buildando frontend..."
npm run build

cd "$PROJECT_DIR"
echo "Reiniciando backend com PM2..."
npm run pm2:restart

echo "Deploy finalizado com sucesso!"
