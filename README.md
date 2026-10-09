
---
# Sistema de Cadastro

Um sistema completo com **frontend em React (Vite)** e **backend em Node.js (Express)** integrado a um banco **PostgreSQL**.  
O projeto está totalmente preparado para **desenvolvimento**, **produção**, **Docker Dev**, **Docker Prod**, e **deploy em Vercel**.

---

# Estrutura do Projeto

```

sistema-cadastro/
├── backend/                 # API Node.js / Express
│   ├── app.js
│   ├── routes/
│   ├── models/
│   ├── middlewares/
│   ├── bin/www
│   └── package.json
│
├── frontend/                # Aplicação React (Vite)
│   ├── src/
│   ├── index.html
│   └── package.json
│
├── docker/                  # Arquitetura Docker (dev + prod)
│   ├── api/
│   ├── frontend/
│   └── nginx/
│
├── docker-compose.yml       # Compose de desenvolvimento
├── docker-compose.prod.yml  # Compose de produção
├── .env                     # Variáveis de ambiente
└── README.md

````

---

# **Execução com Docker (Recomendado)**

## Ambiente de Produção

```bash
docker compose -f docker-compose.prod.yml up --build -d
````

Acesse:

* **Frontend** → [http://localhost](http://localhost)
* **API (via Nginx)** → [http://localhost/api](http://localhost/api)
* **Nginx Reverse Proxy** → porta 80

---

## Ambiente de Desenvolvimento

```bash
docker compose up --build
```

Acesse:

* **Frontend** → [http://localhost:5173](http://localhost:5173)
* **API** → [http://localhost:3000](http://localhost:3000)

---

# Arquitetura Docker Utilizada

A estrutura Docker foi organizada para garantir:

✔ Builds otimizados
✔ Isolamento completo de frontend, backend e nginx
✔ Reverse proxy seguro em produção
✔ Hot reload no desenvolvimento
✔ Nenhum secret exposto

Para detalhes completos, consulte a pasta:
`/docker/`

---

# Execução Sem Docker

## Backend (Express.js)

1. Entre na pasta:

   ```bash
   cd backend
   ```

2. Instale dependências:

   ```bash
   npm install
   ```

3. Crie seu `.env` (veja `.env.example`):

   ```env
   PGHOST=localhost
   PGPORT=5432
   PGDATABASE=sistema_cadastro
   PGUSER=seu_usuario
   PGPASSWORD=sua_senha
   SESSION_SECRET=sua_chave_ultra_segura
   ```

4. Aplique as migrations e crie o primeiro administrador:

   ```bash
   npm run migrate
   ADMIN_EMAIL=voce@exemplo.com ADMIN_PASSWORD='senha-forte-aqui' npm run create-admin
   ```

5. Rode:

   ```bash
   npm run dev
   ```

API → [http://localhost:3002](http://localhost:3002)

---

## Frontend (React + Vite)

1. Entre na pasta:

   ```bash
   cd frontend
   ```

2. Instale:

   ```bash
   npm install
   ```

3. Rode:

   ```bash
   npm run dev
   ```

Frontend → [http://localhost:5173](http://localhost:5173)

---

# Deploy no Vercel

A Vercel fará deploy automático somente do **frontend**, então você tem duas opções:

### ✔ **OPÇÃO 1 — Backend no Render / Railway / VPS**

E o frontend na Vercel consumindo a API externa.

Configure:

```
VITE_API_URL=https://url-da-api
```

---

### ✔ **OPÇÃO 2 — Mono-Repo com API funcionando em Serverless**

Adicione no Vercel:

```
NODE_ENV=production
PGHOST=
PGPORT=
PGDATABASE=
PGUSER=
PGPASSWORD=
SESSION_SECRET=
```

---

# Scripts Disponíveis

```bash
# Dev
npm run dev              # Backend + Frontend juntos
npm run dev:backend      # Só backend
npm run dev:frontend     # Só frontend

# Produção
npm start                # Backend em modo produção

# Backend (dentro de backend/)
npm run migrate          # Aplica migrations pendentes
npm run migrate:down     # Reverte a última migration
npm run create-admin     # Cria/promove admin (ADMIN_EMAIL, ADMIN_PASSWORD)
npm test                 # Testes de integração (Postgres em localhost:55432, ou TEST_PG*)

# Frontend (dentro de frontend/)
npm run lint             # ESLint
npm run build            # Build de produção

# Utilidades
npm run install:all      # Instala raiz + backend + frontend
npm run clean            # Remove dependências e dist
```

Para rodar os testes do backend localmente:

```bash
docker run -d --rm --name sc-test-pg -e POSTGRES_PASSWORD=postgres -p 55432:5432 postgres:16
cd backend && npm test
```

---

#  Configuração Importante

* Todo tráfego `/api/*` é roteado para o backend, que monta todas as rotas sob `/api`.
* **PostgreSQL** + **Sequelize**, com schema versionado por migrations (`backend/db/migrations`).
* Autenticação por **sessão** (cookie `httpOnly`), com sessões persistidas no Postgres (`connect-pg-simple`).
* Autorização por papel (`role`: `user` | `admin`). O cadastro público sempre cria `user`. Admins só são criados via `npm run create-admin`.

---

# Funcionalidades

* Cadastro de usuários
* Login e autenticação por sessão
* Rotas protegidas e painel administrativo (listar, editar e excluir usuários)
* Integração completa com PostgreSQL
* Interface em React

---

# Segurança

* `SESSION_SECRET` obrigatório em produção (o servidor não inicia sem ele)
* Rate limit em `/api/login` e `/api/signup`
* ID de sessão regenerado no login
* Mensagem de erro de login genérica (não revela se o e-mail existe)
* Validação de entrada no backend (senha de 8 a 72 bytes)
* Webhook de deploy exige `WEBHOOK_SECRET` e valida a assinatura HMAC do GitHub

---

# Licença

Licença **ISC**.

