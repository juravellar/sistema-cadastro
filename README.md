# Sistema de Cadastro

Sistema completo de cadastro com frontend React e backend Express.js.

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

## Configuração

- O frontend está configurado para fazer proxy das requisições `/api/*` para o backend em `http://localhost:3000`
- Certifique-se de que o backend esteja rodando antes de iniciar o frontend
- O sistema usa PostgreSQL como banco de dados

## Tecnologias

### Backend

- Node.js
- Express.js
- Sequelize (ORM)
- PostgreSQL
- EJS (templates)
- Express-session
- Bcrypt

### Frontend

- React 18
- Vite
- JavaScript
