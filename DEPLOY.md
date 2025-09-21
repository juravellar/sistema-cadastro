# Guia de Deploy - Sistema de Cadastro

## 🚀 Deploy Rápido

### Railway (Recomendado)

1. Conecte seu repositório GitHub ao Railway
2. Configure as variáveis de ambiente no painel
3. Deploy automático!

### Render

1. Conecte seu repositório GitHub ao Render
2. Use o arquivo `render.yaml` já configurado
3. Deploy automático!

## 📋 Variáveis de Ambiente Necessárias

### Obrigatórias

```bash
NODE_ENV=production
SESSION_SECRET=um_segredo_muito_longo_e_aleatorio_para_producao
```

### Banco de Dados (fornecidas automaticamente pelo Railway/Render)

```bash
DB_HOST=postgresql://postgres:senha@host:port/database
DB_PORT=5432
DB_NAME=sistema_cadastro
DB_USER=postgres
DB_PASSWORD=senha_gerada_automaticamente
```

### Opcionais (para CORS em produção)

```bash
FRONTEND_URL=https://seu-frontend.com
BACKEND_URL=https://seu-backend.com
```

## 🐳 Docker

### Build local

```bash
docker build -t sistema-cadastro .
docker run -p 3000:3000 -e SESSION_SECRET=seu_segredo sistema-cadastro
```

### Com variáveis de ambiente

```bash
docker run -p 3000:3000 \
  -e NODE_ENV=production \
  -e SESSION_SECRET=seu_segredo \
  -e DB_HOST=localhost \
  -e DB_PORT=5432 \
  -e DB_NAME=sistema_cadastro \
  -e DB_USER=postgres \
  -e DB_PASSWORD=sua_senha \
  sistema-cadastro
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Instalar todas as dependências
npm run install:all

# Build com Docker
docker build -t sistema-cadastro .
```

## 📁 Estrutura do Deploy

- **Frontend**: Buildado e servido pelo backend
- **Backend**: Express.js com API REST
- **Banco**: PostgreSQL
- **Sessões**: Express-session com cookies seguros

## 🔍 Healthcheck

O sistema possui múltiplos endpoints de healthcheck:

- **`/status`** - Endpoint básico (sempre responde, recomendado para healthcheck)
- **`/api`** - Endpoint da API (sempre responde)
- **`/api/health`** - Endpoint simples da API (sempre responde)
- **`/api/health/detailed`** - Endpoint completo (testa conexão com banco)

### Configuração de Healthcheck

**Railway:**

- Path: `/status`
- Timeout: 300s

**Render:**

- Path: `/status`
- Timeout: padrão

## ⚠️ Notas Importantes

1. **Não inclua arquivos .env** no repositório
2. **Use variáveis de ambiente** fornecidas pela plataforma
3. **SESSION_SECRET** deve ser único e seguro
4. **CORS** está configurado para produção
5. **Cookies** são seguros em HTTPS
6. **Banco de dados** é inicializado de forma assíncrona
7. **Aplicação inicia** mesmo se o banco não estiver disponível
