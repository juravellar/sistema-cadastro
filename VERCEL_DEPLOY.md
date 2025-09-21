# Deploy na Vercel - Sistema de Cadastro

Este documento contém as instruções para fazer o deploy do sistema de cadastro na Vercel.

## Configurações Implementadas

### 1. Arquivo `vercel.json`

- Configuração para build do frontend React com Vite
- Configuração para API serverless do backend Express.js
- Rotas configuradas para servir o frontend e redirecionar API calls

### 2. Estrutura de API

- Criado `api/index.js` que exporta o app Express como função serverless
- Backend configurado para funcionar com a arquitetura serverless da Vercel

### 3. Scripts de Build

- Adicionados scripts `vercel-build` nos package.json
- Configuração otimizada para o processo de build da Vercel

## Variáveis de Ambiente Necessárias

Configure as seguintes variáveis de ambiente na Vercel:

### Banco de Dados

```
DB_HOST=seu-host-postgresql
DB_PORT=5432
DB_NAME=nome-do-banco
DB_USER=usuario
DB_PASSWORD=senha
```

### Aplicação

```
NODE_ENV=production
SESSION_SECRET=sua-chave-secreta-super-segura
FRONTEND_URL=https://seu-dominio.vercel.app
BACKEND_URL=https://seu-dominio.vercel.app
```

## Como Fazer o Deploy

### 1. Via CLI da Vercel

```bash
# Instalar Vercel CLI
npm i -g vercel

# Fazer login
vercel login

# Deploy
vercel

# Deploy para produção
vercel --prod
```

### 2. Via GitHub (Recomendado)

1. Conecte seu repositório GitHub à Vercel
2. Configure as variáveis de ambiente no dashboard da Vercel
3. Faça push para a branch main - o deploy será automático

## Configurações de Build

A Vercel detectará automaticamente:

- **Frontend**: Build do React com Vite
- **Backend**: Função serverless Node.js

## Limitações da Vercel

### Funções Serverless

- Timeout máximo de 30 segundos (configurado no vercel.json)
- Memória limitada
- Não mantém estado entre requests

### Banco de Dados

- Recomenda-se usar PostgreSQL gerenciado (Vercel Postgres, Supabase, etc.)
- Conexões de banco devem ser otimizadas para serverless

### Sessões

- Sessões em memória não funcionam em serverless
- Considere usar Redis ou banco de dados para sessões

## Otimizações Implementadas

1. **Build otimizado**: Frontend buildado como assets estáticos
2. **API serverless**: Backend como função serverless
3. **Rotas configuradas**: Redirecionamento correto de requests
4. **Ignorar arquivos**: .vercelignore configurado para otimizar upload

## Troubleshooting

### Erro de Build

- Verifique se todas as dependências estão no package.json
- Confirme se as variáveis de ambiente estão configuradas

### Erro de API

- Verifique se o banco de dados está acessível
- Confirme se as credenciais estão corretas

### Erro de CORS

- Verifique as URLs configuradas nas variáveis FRONTEND_URL e BACKEND_URL
