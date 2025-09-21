# Sistema de Cadastro - Frontend React

Este é o frontend do Sistema de Cadastro convertido de EJS para React usando Vite.

## Estrutura do Projeto

```
src/
├── pages/           # Componentes de página
│   ├── Index.jsx    # Página inicial com login/signup em abas
│   ├── Login.jsx    # Página de login
│   ├── SignUp.jsx   # Página de cadastro
│   ├── Home.jsx     # Página home do usuário
│   ├── HomeAdmin.jsx # Página home do administrador
│   └── ErrorPage.jsx # Página de erro
├── components/      # Componentes reutilizáveis (vazio por enquanto)
├── App.jsx         # Componente principal com rotas
├── main.jsx        # Ponto de entrada da aplicação
├── index.css       # Estilos globais (convertidos do CSS original)
└── App.css         # Estilos específicos do App
```

## Conversão Realizada

### Views EJS → Componentes React

- `views/index.ejs` → `pages/Index.jsx` (combinando login e signup em abas)
- `views/partials/login-form.ejs` → `pages/Login.jsx`
- `views/partials/signup-form.ejs` → `pages/SignUp.jsx`
- `views/home.ejs` → `pages/Home.jsx`
- `views/home-admin.ejs` → `pages/HomeAdmin.jsx`
- `views/error.ejs` → `pages/ErrorPage.jsx`

### Rotas Configuradas

- `/` → Index (login/signup em abas)
- `/login` → Login
- `/signup` → SignUp
- `/home` → Home
- `/admin` → HomeAdmin
- `/error` → ErrorPage
- `*` → ErrorPage (404)

### Integração com Backend

- **Proxy configurado** no `vite.config.js` para redirecionar requisições para `http://localhost:3000`
- **APIs utilizadas:**
  - `POST /api/login` - Login
  - `POST /api/signup` - Cadastro
  - `GET /api/user/profile` - Perfil do usuário
  - `GET /api/users` - Lista de usuários (admin)
  - `PUT /api/user/id/:id` - Editar usuário (admin)
  - `DELETE /api/user/id/:id` - Excluir usuário (admin)
  - `POST /logout` - Logout

### Estilos

- **Bootstrap 5.3.8** incluído via CDN
- **Estilos customizados** convertidos do `public/stylesheets/style.css` para `index.css`
- **Design responsivo** mantido com as mesmas classes CSS

## Como Executar

1. **Instalar dependências:**

   ```bash
   npm install
   ```

2. **Executar em modo desenvolvimento:**

   ```bash
   npm run dev
   ```

3. **Acessar:** `http://localhost:5173`

## Funcionalidades Implementadas

### Autenticação

- ✅ Login com email/senha
- ✅ Cadastro com validação de senha
- ✅ Logout
- ✅ Redirecionamento automático após login

### Interface do Usuário

- ✅ Página inicial com abas (login/signup)
- ✅ Página home do usuário
- ✅ Página home do administrador
- ✅ Listagem de usuários (admin)
- ✅ Edição de usuários (admin)
- ✅ Exclusão de usuários (admin)
- ✅ Página de erro personalizada

### Validações

- ✅ Validação de email
- ✅ Validação de senha (mínimo 6 caracteres)
- ✅ Confirmação de senha
- ✅ Campos obrigatórios

### Estados de Loading

- ✅ Indicadores de carregamento durante requisições
- ✅ Desabilitação de formulários durante envio
- ✅ Tratamento de erros com mensagens

## Dependências

- `react` - Framework principal
- `react-router-dom` - Roteamento
- `bootstrap` - Framework CSS
- `vite` - Bundler e servidor de desenvolvimento

## Próximos Passos

1. **Testar integração** com o backend Express
2. **Implementar autenticação** com tokens JWT (se necessário)
3. **Adicionar componentes reutilizáveis** na pasta `components/`
4. **Implementar testes** unitários e de integração
5. **Otimizar performance** com lazy loading e code splitting
