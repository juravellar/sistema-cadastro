#!/bin/bash

# Caminho base do projeto (ajuste se necessário)
PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

cd "$PROJECT_DIR"

echo "=============================================="
echo "🚀 Iniciando deploy do sistema-cadastro..."
echo "=============================================="

echo "📦 Atualizando dependências do projeto raiz..."
npm install

echo "📦 Atualizando dependências do backend..."
cd backend && npm install

cd "$PROJECT_DIR"
echo "📦 Atualizando dependências do frontend..."
cd frontend && npm install

echo "🔨 Buildando frontend..."
npm run build

cd "$PROJECT_DIR"
echo "🔄 Reiniciando backend com PM2..."

# Tenta reiniciar. Se não existir, cria.
pm2 restart sistema-cadastro-backend --update-env || \
pm2 start npm --name sistema-cadastro-backend -- run start --prefix backend

echo "💾 Salvando configuração do PM2..."
pm2 save

echo "=============================================="
echo "✅ Deploy finalizado com sucesso!"
echo "=============================================="
