# Sistema de Cadastro

Um sistema de cadastro completo com **frontend em React (Vite)** e **backend em Node.js (Express)**, integrado a um banco de dados **PostgreSQL**.  
O projeto suporta autenticação de usuários e foi estruturado para rodar backend e frontend em paralelo.

<<<<<<< HEAD
## Estrutura do Projeto

```
sistema-cadastro/
├── backend/                 # Servidor Express.js
│   ├── app.js              # Arquivo principal do servidor
│   ├── bin/                # Scripts de inicialização
│   ├── middlewares/        # Middlewares de autenticação
│   ├── models/             # Modelos do banco de dados
│   ├── routes/             # Rotas da API
│   ├── scripts/            # Scripts de configuração do banco
│   ├── views/              # Templates EJS
│   ├── public/             # Arquivos estáticos
│   └── package.json        # Dependências do backend
├── frontend/               # Aplicação React
│   ├── src/                # Código fonte React
│   ├── index.html          # HTML principal
│   ├── package.json        # Dependências do frontend
│   └── vite.config.js      # Configuração do Vite
└── README.md               # Este arquivo
```

## Como executar

### Backend (Express.js)

1. Navegue para a pasta backend:

   ```bash
   cd backend
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure as variáveis de ambiente (crie um arquivo `.env`):

   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=sistema_cadastro
   DB_USER=seu_usuario
   DB_PASSWORD=sua_senha
   SESSION_SECRET=seu_segredo_sessao
   ```

4. Execute o servidor:
   ```bash
   npm run dev
   ```

O backend estará disponível em `http://localhost:3000`

### Frontend (React)

1. Navegue para a pasta frontend:

   ```bash
   cd frontend
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Execute o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

O frontend estará disponível em `http://localhost:5173`

## 🚀 Deploy no Vercel

### Configuração Automática

1. **Conecte seu repositório GitHub ao Vercel**
2. **Configure as variáveis de ambiente no Vercel:**

   ```
   NODE_ENV=production
   DB_HOST=seu_host_postgresql
   DB_PORT=5432
   DB_NAME=sistema_cadastro
   DB_USER=seu_usuario
   DB_PASSWORD=sua_senha
   SESSION_SECRET=seu_segredo_sessao
   ```

3. **Deploy automático** - O Vercel detectará automaticamente:
   - **Frontend**: Build do React na pasta `frontend/`
   - **Backend**: API Node.js na pasta `backend/`

### Configuração Manual

Se precisar configurar manualmente no Vercel:

- **Framework Preset**: Vite
- **Root Directory**: `./`
- **Build Command**: `npm run vercel-build`
- **Output Directory**: `frontend/dist`
- **Install Command**: `npm run install:all`

## 📚 Comandos Disponíveis

Execute na raiz do projeto:

```bash
# Desenvolvimento
npm run dev              # Executa backend e frontend simultaneamente
npm run dev:backend      # Executa apenas o backend
npm run dev:frontend     # Executa apenas o frontend

# Build e Deploy
npm run build            # Build do frontend para produção
npm run vercel-build     # Build específico para Vercel
npm run install:all      # Instala todas as dependências

# Produção
npm start                # Executa o backend em modo produção
```

## Configuração

- O frontend está configurado para fazer proxy das requisições `/api/*` para o backend em `http://localhost:3000`
- Certifique-se de que o backend esteja rodando antes de iniciar o frontend
- O sistema usa PostgreSQL como banco de dados

## Tecnologias
=======
---
## 🚀 Tecnologias Utilizadas
>>>>>>> react-node.js

### Backend
- [Node.js](https://nodejs.org/)  
- [Express](https://expressjs.com/)  
- [Sequelize](https://sequelize.org/) (ORM para PostgreSQL)  
- [JWT](https://jwt.io/) para autenticação  
- Middlewares de autenticação

### Frontend
- [React](https://reactjs.org/)  
- [Vite](https://vitejs.dev/) (build e dev server)  
- [Axios](https://axios-http.com/) para chamadas à API  

### Outros
- [PostgreSQL](https://www.postgresql.org/) como banco de dados  
- [Concurrently](https://www.npmjs.com/package/concurrently) para rodar backend e frontend juntos  
- [Rimraf](https://www.npmjs.com/package/rimraf) para limpeza de dependências e builds

---

## 📂 Estrutura do Projeto

```

sistema-cadastro/
├── backend/          # Código do servidor Express
│   ├── app.js        # Ponto de entrada do backend
│   ├── models/       # Modelos Sequelize (ex.: User)
│   ├── middlewares/  # Middlewares de autenticação
│   └── bin/www       # Inicialização do servidor
│
├── frontend/         # Aplicação React
│   ├── index.html    # HTML base
│   ├── src/          # Código React
│   └── vite.config.js
│
├── .env              # Variáveis de ambiente
├── package.json      # Scripts para backend + frontend
└── README.md

````

---

## ⚙️ Configuração do Ambiente

### 1. Clonar o repositório
```bash
git clone https://github.com/seu-usuario/sistema-cadastro.git
cd sistema-cadastro
````

### 2. Configurar variáveis de ambiente

Crie o arquivo `.env` na raiz do projeto com, por exemplo:

```env
# Configurações do servidor
PORT=3000

# Banco de dados
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sistema_cadastro
DB_USER=seu_usuario
DB_PASSWORD=sua_senha

# JWT
JWT_SECRET=uma_chave_segura_aqui
```
Você pode usar `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` para **gerar uma chave aleatória e segura em hexadecimal**, ideal para **tokens, senhas fortes ou secrets** em aplicações.

### 3. Instalar dependências

```bash
npm run install:all
```

---

## ▶️ Como Rodar

### Ambiente de desenvolvimento

```bash
npm run dev
```

> Isso vai iniciar **backend** e **frontend** juntos.

### Rodar apenas o backend

```bash
npm run dev:backend
```

### Rodar apenas o frontend

```bash
npm run dev:frontend
```

### Build do frontend

```bash
npm run build
```

### Produção (backend)

```bash
npm start
```

---

## 🧹 Limpeza

Para remover `node_modules` e pastas `dist`:

```bash
npm run clean
```

---

## ✨ Funcionalidades

* Cadastro e login de usuários
* Autenticação com JWT
* Proteção de rotas com middlewares
* Integração com banco PostgreSQL
* Frontend em React para interação com o usuário

---

## 📜 Licença

Este projeto está licenciado sob a licença **ISC**.