# 🐳 Guia de Uso com Docker

Este guia explica como executar o sistema completo usando apenas Docker.

## 📋 Pré-requisitos

- Docker instalado
- Docker Compose instalado

## 🚀 Modo Produção

Para rodar o sistema em modo produção (com build otimizado):

```bash
docker-compose up -d
```

Isso irá:
- ✅ Iniciar o PostgreSQL
- ✅ Iniciar o pgAdmin (opcional, para gerenciar o banco)
- ✅ Buildar e iniciar o backend
- ✅ Buildar e iniciar o frontend (com nginx)

### Acessos:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3002
- **pgAdmin**: http://localhost:5050
  - Email: `admin@admin.com`
  - Senha: `admin`

## 🔧 Modo Desenvolvimento

Para rodar em modo desenvolvimento (com hot-reload):

```bash
docker-compose -f docker-compose.dev.yml up
```

Isso irá:
- ✅ Iniciar o PostgreSQL
- ✅ Iniciar o pgAdmin
- ✅ Iniciar o backend com nodemon (hot-reload)
- ✅ Iniciar o frontend com Vite (hot-reload)

### Acessos:

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3002
- **pgAdmin**: http://localhost:5050

## 📝 Comandos Úteis

### Ver logs dos containers:

```bash
# Todos os serviços
docker-compose logs -f

# Apenas backend
docker-compose logs -f backend

# Apenas frontend
docker-compose logs -f frontend
```

### Parar os containers:

```bash
docker-compose down
```

### Parar e remover volumes (limpar banco de dados):

```bash
docker-compose down -v
```

### Rebuild dos containers (após mudanças no código):

```bash
# Produção
docker-compose up -d --build

# Desenvolvimento
docker-compose -f docker-compose.dev.yml up --build
```

### Executar comandos dentro de um container:

```bash
# Backend
docker-compose exec backend sh

# Frontend
docker-compose exec frontend sh
```

## 🔐 Variáveis de Ambiente

As variáveis de ambiente podem ser configuradas através de um arquivo `.env` na raiz do projeto ou diretamente no `docker-compose.yml`.

### Variáveis importantes:

- `SESSION_SECRET`: Segredo para sessões (altere em produção!)
- `PGPASSWORD`: Senha do PostgreSQL
- `PGADMIN_DEFAULT_PASSWORD`: Senha do pgAdmin

## 🗄️ Banco de Dados

O PostgreSQL é iniciado automaticamente e os dados são persistidos em um volume Docker chamado `pgdata_sistema_cadastro`.

### Conectar ao banco via linha de comando:

```bash
docker-compose exec postgres psql -U postgres -d sistema-cadastro
```

### Backup do banco:

```bash
docker-compose exec postgres pg_dump -U postgres sistema-cadastro > backup.sql
```

### Restaurar backup:

```bash
docker-compose exec -T postgres psql -U postgres sistema-cadastro < backup.sql
```

## 🐛 Troubleshooting

### Container não inicia:

```bash
# Ver logs de erro
docker-compose logs [nome-do-servico]

# Verificar status
docker-compose ps
```

### Porta já em uso:

Altere as portas no `docker-compose.yml` se necessário.

### Rebuild completo:

```bash
# Remove containers, volumes e imagens
docker-compose down -v --rmi all

# Rebuild tudo
docker-compose up -d --build
```

## 📦 Estrutura dos Dockerfiles

- `backend/Dockerfile`: Produção (otimizado)
- `backend/Dockerfile.dev`: Desenvolvimento (com nodemon)
- `frontend/Dockerfile`: Produção (build + nginx)
- `frontend/Dockerfile.dev`: Desenvolvimento (Vite dev server)

