# 🐳 Guia de Uso com Docker

## 🔧 Desenvolvimento

```bash
docker compose up --build
```

- PostgreSQL (exposto em `localhost:5433`)
- Backend em `http://localhost:3002`: aplica as migrations (`npm run migrate`) antes de iniciar
- Frontend (Vite) em `http://localhost:5173`, com proxy de `/api` para o backend (`VITE_API_TARGET`)

Crie o primeiro administrador:

```bash
docker compose exec -e ADMIN_EMAIL=voce@exemplo.com -e ADMIN_PASSWORD='senha-forte-aqui' backend npm run create-admin
```

## 🚀 Produção

1. Copie `.env.example` para `.env` e preencha ao menos `SESSION_SECRET`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` e `FRONTEND_URL`.
2. Suba os serviços:

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

- `postgres`: dados no volume `pgdata`
- `backend`: roda as migrations e depois inicia (`NODE_ENV=production`)
- `nginx`: builda o frontend e serve na porta 80, com proxy de `/api/` para o backend

O cookie de sessão é `Secure` em produção. Se o acesso não passar por HTTPS (TLS terminado antes do nginx), defina `COOKIE_SECURE=false` no `.env`.

Crie o primeiro administrador:

```bash
docker compose -f docker-compose.prod.yml exec -e ADMIN_EMAIL=voce@exemplo.com -e ADMIN_PASSWORD='senha-forte-aqui' backend npm run create-admin
```

## 🗄️ Banco de Dados

O schema é versionado em `backend/db/migrations` (Umzug). O backend **não** altera o schema no boot.

```bash
docker compose exec backend npm run migrate        # aplica pendentes
docker compose exec backend npm run migrate:down   # reverte a última
docker compose exec postgres psql -U postgres -d sistema_cadastro
docker compose exec -T postgres pg_dump -U postgres sistema_cadastro > backup.sql
```

## 📦 Dockerfiles

- `backend/Dockerfile`: imagem do backend (dev e prod; o compose de dev sobrescreve `NODE_ENV`)
- `frontend/Dockerfile.dev`: Vite dev server
- `nginx/Dockerfile`: build do frontend + nginx (contexto: raiz do repositório)
