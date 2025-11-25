
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

3. Crie seu `.env`:

   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=sistema_cadastro
   DB_USER=seu_usuario
   DB_PASSWORD=sua_senha
   SESSION_SECRET=sua_chave_ultra_segura
   ```

4. Rode:

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
DB_HOST=
DB_PORT=
DB_NAME=
DB_USER=
DB_PASSWORD=
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

# Frontend
npm run build            # Build do frontend
npm run vercel-build     # Build especial para Vercel

# Utilidades
npm run install:all      # Instala backend + frontend
npm run clean            # Remove dependências e dist
```

---

#  Configuração Importante

* Todo tráfego `/api/*` no frontend é roteado automaticamente para o backend.
* O sistema utiliza **PostgreSQL** + **Sequelize**.
* O backend utiliza:

  * JWT para autenticação
  * Middlewares personalizados
  * Validação de sessão
* O frontend utiliza:

  * React + Vite
  * Axios para requisições

---

# Funcionalidades

* Cadastro de usuários
* Login e autenticação com JWT
* Rota protegidas
* Integração completa com PostgreSQL
* Interface moderna em React

---

# Segurança

* `.env` nunca é enviado para o cliente
* API não fica exposta em produção (somente via Nginx)
* Reverse proxy configurado corretamente
* Secrets protegidos
* Dockerfile sem node_modules ou lixo

---

# Licença

Licença **ISC**.

