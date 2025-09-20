# Configuração do Banco de Dados

## ✅ Criação Automática

Seu projeto **já está configurado** para criar o banco de dados automaticamente! O sistema irá:

- ✅ **Criar o banco de dados** se não existir
- ✅ **Criar todas as tabelas** automaticamente
- ✅ **Criar o usuário admin** padrão
- ✅ **Sincronizar mudanças** nos modelos

## 🚀 Como usar

### 1. Configuração Básica

Crie um arquivo `.env` na raiz do projeto com:

```env
# Configurações do Banco de Dados
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=0000
PGDATABASE=sistema-cadastro

# Configurações da Aplicação
NODE_ENV=development
SESSION_SECRET=seu-segredo-super-secreto-aqui
```

### 2. Iniciar a Aplicação

```bash
npm run dev
```

O banco será criado automaticamente na primeira execução!

### 3. Scripts Disponíveis

```bash
# Criar apenas o banco de dados (se não existir)
npm run create-db

# Inicializar banco completo (cria banco + tabelas + usuário admin)
npm run init-db

# Forçar recriação de todas as tabelas (CUIDADO: apaga dados!)
npm run init-db:force

# Alterar tabelas existentes (adiciona novas colunas)
npm run init-db:alter
```

## 🔧 Opções de Sincronização

### `sequelize.sync()` - Padrão

- Cria tabelas se não existirem
- **NÃO** apaga dados existentes
- **NÃO** modifica tabelas existentes

### `sequelize.sync({ force: true })` - Recriar

- **APAGA** todas as tabelas e dados
- Recria tudo do zero
- ⚠️ **Use apenas em desenvolvimento!**

### `sequelize.sync({ alter: true })` - Alterar

- Modifica tabelas existentes
- Adiciona novas colunas
- Remove colunas não utilizadas
- ⚠️ **Pode causar perda de dados!**

## 🎯 Usuário Admin Padrão

O sistema cria automaticamente um usuário admin:

- **Email:** admin@admin.com
- **Senha:** admin
- **Username:** admin

## 🐛 Solução de Problemas

### Erro de Conexão

```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solução:** Verifique se o PostgreSQL está rodando

### Erro de Autenticação

```
Error: password authentication failed
```

**Solução:** Verifique as credenciais no arquivo `.env`

### Erro de Banco Não Existe

```
Error: database "sistema-cadastro" does not exist
```

**Solução:** O sistema agora cria automaticamente! Mas se precisar criar manualmente:

```bash
npm run create-db
```

Ou via SQL:

```sql
CREATE DATABASE "sistema-cadastro";
```

## 📝 Notas Importantes

1. **Desenvolvimento:** Use `NODE_ENV=development` para alterações automáticas
2. **Produção:** Use `NODE_ENV=production` para maior segurança
3. **Backup:** Sempre faça backup antes de usar `--force` ou `--alter`
4. **SSL:** Configure SSL para conexões de produção
