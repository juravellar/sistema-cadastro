# Como contribuir

Convenções do projeto. O CI verifica as que podem ser automatizadas.

## Ambiente

- Node.js 22.13 ou mais recente (`.nvmrc`). Com nvm: `nvm use`.
- `npm run install:all` instala raiz, backend e frontend.
- Para rodar o projeto, veja o [README](README.md).

## Fluxo de trabalho

1. Crie uma branch a partir da `main`: `feat/<assunto>`, `fix/<assunto>`, `refactor/<assunto>`, `docs/<assunto>` ou `chore/<assunto>`.
2. Faça commits pequenos, cada um com build e testes passando.
3. Abra um PR para a `main` e preencha o template. O merge só acontece com o CI verde.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/pt-br/), em português:

```
<tipo>(<escopo opcional>): <descrição no imperativo>

<corpo explicando o porquê, quando não for óbvio>
```

- Tipos: `feat`, `fix`, `refactor`, `test`, `docs`, `style`, `chore`, `ci`, `build`, `perf`.
- Mudança incompatível (API, schema, variável de ambiente): `!` depois do tipo e um parágrafo `BREAKING CHANGE:` no corpo.
- Commits só de formatação entram no `.git-blame-ignore-revs`. Para o `git blame` respeitar: `git config blame.ignoreRevsFile .git-blame-ignore-revs`.

## Código

- **Formatação**: Prettier (`npm run format`). Não discuta estilo em revisão; o Prettier decide.
- **Lint**: `npm run lint` precisa passar sem erros.
- **Comentários** explicam o porquê (uma restrição, um risco, uma decisão), nunca o que o código já diz.

### Backend

- `routes/` só traduz HTTP: lê a requisição, chama o serviço, responde e cuida da sessão.
- Regras de negócio ficam em `services/`. Erros de negócio são lançados com as classes de `lib/errors.js` (`ValidationError`, `ConflictError`, etc.), que carregam o status HTTP. O error handler de `app.js` monta a resposta.
- Com Express 5, handlers `async` não precisam de `try/catch`: erros chegam ao error handler sozinhos.
- Variáveis de ambiente são lidas só em `config.js`. Variável nova: adicione a `config.js` e ao `.env.example`. Se só o servidor HTTP usa a variável, coloque em `serverConfig()`, para que um valor errado não impeça `migrate` e `create-admin` de rodar.
- Mudança de schema: nova migration em `db/migrations/` (`NNN-descricao.js`), idempotente e com `down`. Nunca altere uma migration já publicada.
- Rotas seguem REST: recurso no plural (`/api/users/:id`) e a própria conta em `/api/me`.

### Frontend

- Chamadas HTTP passam pelo cliente `api` de `src/lib/api.js`. Componentes não montam URLs.
- Estado de autenticação vem do `useAuth()`; não chame a API de sessão diretamente.
- Mensagens de erro aparecem na tela (`alert` do Bootstrap), não em `window.alert`.

## Testes

- Funcionalidade nova ou bug corrigido vem com teste. Para bug, escreva o teste antes e confirme que ele falha.
- Backend: testes de integração em `backend/test/` (`node:test` + `supertest`, Postgres real).
- Frontend: Vitest + Testing Library em `*.test.jsx`, simulando a API com `src/test/mockApi.js`.
- Webhook: `test/webhook.test.js`.
- Como rodar: veja a seção Testes do [README](README.md#testes).
