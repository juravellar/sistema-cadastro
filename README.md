# Sistema de Cadastro

Um sistema de cadastro completo com **frontend em React (Vite)** e **backend em Node.js (Express)**, integrado a um banco de dados **PostgreSQL**.  
O projeto suporta autenticação de usuários e foi estruturado para rodar backend e frontend em paralelo.

---
## 🚀 Tecnologias Utilizadas

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