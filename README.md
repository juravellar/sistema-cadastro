# Sistema de Cadastro

Cadastro e autenticação de usuários com **frontend em React (Vite)**, **backend em Node.js (Express)** e banco **PostgreSQL**. Usuários comuns se cadastram e gerenciam a própria conta (dados e senha); administradores gerenciam os usuários por um painel.

O projeto foi feito para **clonar e rodar localmente**: com Docker, basta um comando. Publicar num servidor é opcional (veja o fim deste README).

---

## Estrutura do projeto

```
sistema-cadastro/
├── backend/                    # API Express (todas as rotas sob /api)
│   ├── app.js                  # createApp(): middlewares, sessão, rotas, error handler
│   ├── config.js               # variáveis de ambiente, com defaults e validação
│   ├── bin/www                 # sobe o servidor HTTP (porta 3002)
│   ├── routes/                 # HTTP: auth.js, me.js, users.js, index.js
│   ├── services/               # regras de negócio (user-service.js)
│   ├── middlewares/auth.js     # requireAuth / requireAdmin
│   ├── models/                 # Sequelize (User)
│   ├── lib/                    # errors.js, validation.js, session.js
│   ├── db/migrate.js           # executor de migrations (Umzug)
│   ├── db/migrations/          # schema versionado
│   ├── scripts/                # create-database.js, create-admin.js
│   ├── test/                   # testes de integração (node:test + supertest)
│   └── ecosystem.config.js     # PM2 (opcional, só para publicar)
├── frontend/                   # SPA React (Vite + Bootstrap)
│   └── src/                    # páginas, componentes, contexto de auth, cliente de API (lib/api.js), testes
├── webhook-server.js           # webhook de deploy (opcional, só para publicar)
├── webhook-ecosystem.config.js # PM2 do webhook (opcional)
├── scripts/deploy-aapanel.sh   # deploy num servidor aaPanel (opcional)
├── test/                       # testes do webhook
├── nginx/                      # imagem nginx do compose de produção
├── nginx-config/               # nginx de um servidor de produção (opcional)
├── docker-compose.yml          # desenvolvimento
├── docker-compose.prod.yml     # produção com Docker
├── .github/                    # CI, template de PR, Dependabot
├── CONTRIBUTING.md             # convenções do projeto
└── .env.example                # todas as variáveis de ambiente
```

---

## Como rodar (com Docker)

Requisito: [Docker](https://docs.docker.com/get-docker/) com o Compose.

```bash
git clone https://github.com/juravellar/sistema-cadastro.git
cd sistema-cadastro
docker compose up --build
```

O backend aplica as migrations antes de iniciar. Quando aparecer `🚀 Backend ouvindo na porta 3002`, crie o primeiro administrador em outro terminal:

```bash
docker compose exec -e ADMIN_EMAIL=voce@exemplo.com -e ADMIN_PASSWORD='senha-forte-aqui' backend npm run create-admin
```

- Frontend: http://localhost:5173
- API: http://localhost:3002/api
- Postgres: `localhost:5433` (usuário e senha `postgres`)

As imagens copiam o código no build, então não há hot reload: depois de alterar o código, rode `docker compose up --build` de novo. Para hot reload, use a execução sem Docker.

Produção com Docker (`docker-compose.prod.yml`) está descrita em [DOCKER.md](DOCKER.md).

---

## Rodando sem Docker

Requisitos: Node.js 22.13+ (veja o `.nvmrc`) e um PostgreSQL acessível.

```bash
npm run install:all
```

Crie `backend/.env` a partir do [.env.example](.env.example). Em desenvolvimento, o mínimo é:

```env
NODE_ENV=development
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=sua_senha
PGDATABASE=sistema_cadastro
```

Prepare o banco e crie o primeiro administrador:

```bash
cd backend
npm run migrate
ADMIN_EMAIL=voce@exemplo.com ADMIN_PASSWORD='senha-forte-aqui' npm run create-admin
cd ..
```

Suba backend (nodemon) e frontend (Vite) juntos, com hot reload:

```bash
npm run dev
```

O Vite encaminha `/api` para `http://localhost:3002`. Para outro endereço, defina `VITE_API_TARGET`.

---

## Testes

```bash
# Postgres descartável para os testes do backend
docker run -d --rm --name sc-test-pg -e POSTGRES_PASSWORD=postgres -p 55432:5432 postgres:16

npm test                      # webhook + backend
cd frontend && npm test       # Vitest + Testing Library
cd frontend && npm run lint   # ESLint
```

Os testes do backend usam o banco `sistema_cadastro_test` em `localhost:55432`. Para usar outro servidor, defina `TEST_PGHOST`, `TEST_PGPORT`, `TEST_PGUSER`, `TEST_PGPASSWORD` e `TEST_PGDATABASE`.

O CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) roda testes, lint, build e `npm audit` (bloqueia high/critical) em cada PR.

---

## Publicar num servidor (opcional)

Não é necessário para usar o projeto localmente. Os arquivos abaixo ficam no repositório para quem quiser publicar; sem esse uso, eles não interferem em nada.

### Exemplo: aaPanel + PM2

O servidor serve o build do frontend pelo nginx, roda o backend no PM2 (porta 3002) e recebe pushes do GitHub pelo webhook (porta 3003).

#### Primeira instalação

1. Clone o repositório no servidor e crie `backend/.env` com, no mínimo, `NODE_ENV=production`, `SESSION_SECRET` e as variáveis `PG*` (veja o [.env.example](.env.example)). O backend só inicia sem `SESSION_SECRET` com `NODE_ENV=development` ou `test`; em qualquer outro caso, inclusive sem `NODE_ENV`, ele é obrigatório. Para gerar um segredo:
   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
   ```
2. Rode o deploy e crie o primeiro administrador:
   ```bash
   npm run deploy:aapanel
   cd backend && ADMIN_EMAIL=voce@exemplo.com ADMIN_PASSWORD='senha-forte-aqui' npm run create-admin
   ```
3. Instale as configs de [nginx-config/](nginx-config/) no nginx do servidor e recarregue. `/api/` vai para o backend (3002) e `/webhook/` para o webhook (3003).

#### Deploy automático pelo webhook

1. Inicie o webhook com o segredo no ambiente. Ele não lê `.env`, e o segredo não deve ir para o arquivo do PM2:
   ```bash
   WEBHOOK_SECRET='segredo-forte' npm run webhook:start
   pm2 save
   ```
2. No GitHub, em **Settings → Webhooks**, use a URL `https://deploy.chatflows.com.br/webhook/deploy`, o content type `application/json`, o mesmo segredo e o evento **push**.

Cada push na `main` roda [scripts/deploy-aapanel.sh](scripts/deploy-aapanel.sh): `git pull`, `npm ci`, migrations, build do frontend e restart do backend no PM2. O webhook responde na hora (202) e o deploy continua em background; se chegar outro push durante um deploy, ele responde 409. O resultado aparece em `npm run webhook:logs`.

Para deploy manual, rode `npm run deploy:aapanel` no servidor.

---

## Scripts

| Onde     | Comando                                          | O que faz                                               |
| -------- | ------------------------------------------------ | ------------------------------------------------------- |
| raiz     | `npm run dev`                                    | Backend (nodemon) + frontend (Vite)                     |
| raiz     | `npm run install:all`                            | Instala dependências da raiz, backend e frontend        |
| raiz     | `npm test`                                       | Testes do webhook + backend                             |
| raiz     | `npm run lint`                                   | ESLint em backend, webhook e frontend                   |
| raiz     | `npm run format` / `format:check`                | Formata / verifica a formatação (Prettier)              |
| raiz     | `npm run deploy:aapanel`                         | Deploy no servidor                                      |
| raiz     | `npm run pm2:start` / `pm2:restart` / `pm2:logs` | Backend no PM2                                          |
| raiz     | `npm run webhook:start` / `webhook:logs`         | Webhook no PM2                                          |
| backend  | `npm run migrate` / `migrate:down`               | Aplica migrations pendentes / reverte a última          |
| backend  | `npm run create-admin`                           | Cria ou promove admin (`ADMIN_EMAIL`, `ADMIN_PASSWORD`) |
| frontend | `npm run build`                                  | Build de produção em `frontend/dist`                    |

---

## API

Todas as rotas ficam sob `/api` e respondem JSON no formato `{ success, message?, ... }`. Erros usam o status HTTP adequado (400 validação, 401 sem sessão, 403 sem permissão, 404, 409 conflito, 429 rate limit).

| Método e rota                             | Acesso  | O que faz                                                 |
| ----------------------------------------- | ------- | --------------------------------------------------------- |
| `POST /api/auth/signup`                   | público | Cria conta com perfil `user` e abre sessão                |
| `POST /api/auth/login`                    | público | Abre sessão                                               |
| `POST /api/auth/logout`                   | público | Encerra a sessão                                          |
| `GET /api/me`                             | logado  | Dados da própria conta                                    |
| `PATCH /api/me`                           | logado  | Altera nome e e-mail                                      |
| `PUT /api/me/password`                    | logado  | Troca a senha (exige a atual) e encerra as outras sessões |
| `GET /api/users?limit&offset`             | admin   | Lista paginada (padrão 50, máximo 100)                    |
| `POST /api/users`                         | admin   | Cria usuário com perfil `user` ou `admin`                 |
| `GET /api/users/:id`                      | admin   | Detalhes de um usuário                                    |
| `PUT /api/users/:id`                      | admin   | Altera nome, e-mail, senha e perfil                       |
| `DELETE /api/users/:id`                   | admin   | Exclui usuário                                            |
| `GET /api/health`, `/api/health/detailed` | público | Saúde do app e do banco                                   |

Login, cadastro e troca de senha têm rate limit compartilhado (10 tentativas a cada 15 minutos por IP).

As rotas anteriores à padronização REST (`/api/login`, `/api/user/profile`, `/api/user/id/:id` etc.) respondem **410** com "O sistema foi atualizado. Recarregue a página.", para avisar quem estiver com o frontend antigo aberto.

---

## Como funciona

- **Camadas**: rotas traduzem HTTP e cuidam da sessão; `services/` concentra as regras de negócio e lança erros tipados (`lib/errors.js`), que o error handler converte no status HTTP. nginx e Vite encaminham `/api/*` para o backend.
- **Banco**: PostgreSQL + Sequelize, com schema versionado em `backend/db/migrations`. O backend não altera o schema ao iniciar; isso é feito por `npm run migrate`.
- **Autenticação por sessão**: cookie `httpOnly`, `Secure` em produção, com as sessões guardadas no Postgres (`connect-pg-simple`). O ID da sessão é regenerado no login. Se o acesso não passar por HTTPS, defina `COOKIE_SECURE=false`.
- **Perfis**: `user` ou `admin`. O cadastro público sempre cria `user`. O primeiro admin vem do `create-admin`; depois disso, admins criam usuários e alteram perfis pelo painel. O admin não altera o próprio perfil nem exclui a própria conta, e o sistema nunca fica sem administrador.
- **Conta do usuário**: na home, o usuário vê o próprio perfil, edita nome e e-mail e troca a senha informando a atual.
- **Acesso sempre atual**: o usuário da sessão é relido do banco a cada requisição. Rebaixar ou excluir alguém tira o acesso na hora.
- **Troca de senha encerra as outras sessões**, seja pelo próprio usuário ou pelo admin: sessões abertas antes da troca (`users.passwordChangedAt`) deixam de valer, e só a sessão de quem trocou continua ativa.
- **E-mails** são guardados em minúsculas, sem espaços nas pontas. A migration `004-normalize-emails` aborta, sem alterar nada, se houver contas que só diferem na caixa; exclua ou altere as extras e rode `npm run migrate` de novo.

## Segurança

- `SESSION_SECRET` obrigatório fora de `NODE_ENV=development`/`test` (inclusive sem `NODE_ENV`), e `WEBHOOK_SECRET` obrigatório para o webhook iniciar
- Sem `NODE_ENV=development`, o error handler nunca devolve stack trace e o cookie de sessão é `Secure` por padrão
- Rate limit em login, cadastro e troca de senha
- Mensagem de erro de login genérica, que não revela se o e-mail existe
- Validação de entrada no backend (senha de 8 a 72 bytes)
- Webhook valida a assinatura HMAC do GitHub sobre o corpo bruto da requisição

---

## Licença

ISC.
