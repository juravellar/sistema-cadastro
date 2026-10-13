#!/bin/bash
set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

echo "🚀 Iniciando deploy do sistema-cadastro..."

git pull --ff-only

echo "📦 Instalando dependências do backend..."
npm ci --omit=dev
npm ci --omit=dev --prefix backend

echo "🗄️  Aplicando migrations..."
npm run migrate --prefix backend

echo "📦 Buildando frontend..."
npm ci --prefix frontend
npm run build --prefix frontend

echo "🔄 Reiniciando backend com PM2..."
if pm2 describe sistema-cadastro-backend >/dev/null 2>&1; then
  pm2 restart sistema-cadastro-backend --update-env
else
  (cd backend && pm2 start ecosystem.config.js --env production)
fi
pm2 save

echo "✅ Deploy finalizado"
