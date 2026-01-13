# GUIA DE CONFIGURAÇÃO DO SUPABASE

Este documento detalha todas as configurações necessárias no Supabase (auto-hospedado) e no sistema para o projeto Insta Post.

---

## 📋 ÍNDICE

1. [Configurações no Supabase](#1-configurações-no-supabase)
2. [Configurações no Sistema](#2-configurações-no-sistema)
3. [Verificação da Conexão](#3-verificação-da-conexão)
4. [Troubleshooting](#4-troubleshooting)

---

## 1. CONFIGURAÇÕES NO SUPABASE

### 1.1. Acesso ao Painel do Supabase

1. Acesse o painel do seu Supabase auto-hospedado
2. Faça login com suas credenciais

### 1.2. Obter Credenciais de API

#### Passo 1: Acessar Settings > API

1. No menu lateral, clique em **Settings** (Configurações)
2. Selecione **API** no submenu

#### Passo 2: Copiar as Chaves Necessárias

Você precisará de **3 informações principais**:

**a) Project URL**
- Localização: Seção "Project URL"
- Formato: `https://seu-projeto.supabase.co`
- Uso: URL base do projeto Supabase
- Variável: `SUPABASE_URL`

**b) anon public key**
- Localização: Seção "Project API keys" > "anon" > "public"
- Formato: String longa começando com `eyJ...`
- Uso: Chave pública para acesso do frontend
- Variável: `SUPABASE_ANON_KEY`
- ⚠️ **Segurança**: Pode ser exposta no frontend, mas com políticas RLS adequadas

**c) service_role secret key**
- Localização: Seção "Project API keys" > "service_role" > "secret"
- Formato: String longa começando com `eyJ...`
- Uso: Chave administrativa para uso no backend
- Variável: `SUPABASE_SERVICE_ROLE_KEY`
- ⚠️ **ATENÇÃO CRÍTICA**: 
  - Esta chave tem privilégios administrativos
  - **NUNCA** exponha no frontend
  - Use apenas no backend
  - Mantenha segura e rotacione periodicamente
- 📝 **Nota para Supabase Auto-hospedado:**
  - Pode não estar visível na interface web
  - Pode precisar ser gerada via CLI ou arquivo de configuração
  - **Para começar, não é obrigatória** - você pode usar apenas a anon key no frontend
  - Será necessária quando implementarmos o backend com operações administrativas

### 1.3. Obter Connection String do PostgreSQL

#### Passo 1: Acessar Settings > Database

1. No menu lateral, clique em **Settings**
2. Selecione **Database** no submenu

#### Passo 2: Escolher Tipo de Conexão

O Supabase oferece diferentes tipos de conexão:

**a) Direct Connection (Porta 5432) - NÃO RECOMENDADO para aplicações web**
- Conexão direta ao PostgreSQL
- Pode causar problemas com muitas conexões simultâneas
- Limite de conexões do banco
- Formato: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres`

**b) Session Pooler (Porta 5432 com pooler) - RECOMENDADO ✅**
- Usa Supavisor em modo sessão
- Gerencia conexões melhor
- Melhor para Prisma e aplicações web
- Formato: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@[POOLER-HOST]:5432/postgres`
- Ou: `postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?pgbouncer=true`

**c) Transaction Pooler (Porta 6543) - Para Serverless**
- Usa Supavisor em modo transação
- Não suporta prepared statements (Prisma pode ter problemas)
- Melhor para funções serverless/short-lived

#### Passo 3: Copiar Connection String

1. Role até a seção **Connection string**
2. Selecione a aba **Connection pooling** (se disponível) ou **URI**
3. Para **Session Pooler**, procure pela opção "Session mode" ou "Connection pooling"
4. Copie a string de conexão
   - **RECOMENDADO**: Use Session Pooler (porta 5432 com pooler)
   - Substitua `[YOUR-PASSWORD]` pela senha real do banco
   - Substitua `[HOST]` pelo host do pooler (pode ser diferente do host direto)
5. Variável: `DATABASE_URL`

**Exemplo - Direct Connection (NÃO recomendado):**
```
postgresql://postgres:minhasenha123@db.abc123.supabase.co:5432/postgres
```

**Exemplo - Session Pooler (RECOMENDADO):**
```
postgresql://postgres.abc123:minhasenha123@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

**Nota para Supabase Auto-hospedado:**
- Se você não tiver acesso ao pooler, você pode precisar:
  1. Habilitar PgBouncer no seu Supabase auto-hospedado
  2. Ou usar a conexão direta temporariamente (com limitações)
  3. Ou configurar um pooler externo (como PgBouncer)

⚠️ **IMPORTANTE**: Para Prisma, use Session Pooler (não Transaction Pooler), pois o Prisma precisa de prepared statements.

### 1.4. Configurar Autenticação (Auth)

#### Passo 1: Acessar Authentication > Settings

1. No menu lateral, clique em **Authentication**
2. Selecione **Settings** no submenu

#### Passo 2: Configurar Site URL

1. Em **Site URL**, configure a URL do seu frontend:
   - Desenvolvimento: `http://localhost:3000`
   - Produção: `https://seudominio.com`

#### Passo 3: Configurar Redirect URLs

1. Em **Redirect URLs**, adicione as URLs permitidas:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/callback?provider=instagram`
   - `https://seudominio.com/auth/callback`
   - `https://seudominio.com/auth/callback?provider=instagram`

#### Passo 4: Habilitar Providers (Opcional para MVP)

Para autenticação por email/senha (padrão):
- Já está habilitado por padrão
- Não precisa de configuração adicional

Para autenticação via Instagram (futuro):
- Será configurado quando implementarmos OAuth do Instagram
- Por enquanto, pode deixar desabilitado

### 1.5. Configurar Row Level Security (RLS)

⚠️ **IMPORTANTE**: As políticas RLS serão configuradas após a criação do schema do banco de dados.

**Por enquanto:**
1. Acesse **Authentication** > **Policies** (ou **Database** > **Tables** > selecione tabela > **Policies**)
2. As políticas serão criadas automaticamente quando executarmos as migrações do Prisma
3. Não é necessário configurar manualmente agora

**Nota**: Após criar as tabelas, voltaremos aqui para configurar as políticas de segurança.

### 1.6. Configurar Storage (Opcional - para futuro)

Se você planeja usar o Storage do Supabase (alternativa ao Cloudflare R2):

1. Acesse **Storage** no menu lateral
2. Crie um bucket chamado `images` (ou outro nome)
3. Configure políticas de acesso conforme necessário

**Nota**: Por enquanto, estamos usando Cloudflare R2, então esta etapa é opcional.

---

## 2. CONFIGURAÇÕES NO SISTEMA

### 2.1. Criar Arquivo .env.local

1. No diretório raiz do projeto, copie o arquivo `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

2. Abra o arquivo `.env.local` em um editor de texto

### 2.2. Preencher Variáveis do Supabase

Preencha as seguintes variáveis com os valores obtidos no Supabase:

```env
# URL do projeto Supabase
SUPABASE_URL=https://seu-projeto.supabase.co

# Chave pública (anon key)
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Chave de serviço (service role key)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# URL de conexão PostgreSQL (para Prisma)
DATABASE_URL=postgresql://postgres:senha@host:5432/postgres
```

### 2.3. Verificar Outras Variáveis

Certifique-se de que as outras variáveis estão configuradas (ou deixe vazias por enquanto se ainda não tiver as credenciais):

- `API_URL`: URL do backend (padrão: `http://localhost:3001`)
- `NEXT_PUBLIC_APP_URL`: URL do frontend (padrão: `http://localhost:3000`)
- `NODE_ENV`: Ambiente (desenvolvimento: `development`)

### 2.4. Estrutura do Arquivo .env.local

O arquivo `.env.local` deve ter esta estrutura mínima para começar:

```env
# Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role
# URL de conexão PostgreSQL (RECOMENDADO: Session Pooler)
# Session Pooler: postgresql://postgres.[PROJECT-REF]:senha@pooler-host:5432/postgres
# Direct Connection: postgresql://postgres:senha@host:5432/postgres (não recomendado)
DATABASE_URL=postgresql://postgres:senha@host:5432/postgres

# Aplicação
API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
PORT=3001
```

---

## 3. VERIFICAÇÃO DA CONEXÃO

### 3.1. Testar Conexão com Supabase (Frontend)

Após configurar, você pode testar a conexão criando um arquivo de teste (temporário):

```typescript
// test-supabase.ts (temporário, depois deletar)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Teste simples
async function testConnection() {
  const { data, error } = await supabase.from('_test').select('*').limit(1)
  console.log('Connection test:', { data, error })
}

testConnection()
```

### 3.2. Testar Conexão com PostgreSQL (Prisma)

Após configurar o Prisma (próxima fase), você pode testar:

```bash
# Gerar cliente Prisma
npm run db:generate

# Testar conexão
npx prisma db pull
```

Se a conexão estiver correta, o Prisma conseguirá ler o schema do banco.

---

## 4. TROUBLESHOOTING

### Problema: "Invalid API key"

**Solução:**
- Verifique se copiou a chave completa (sem cortes)
- Certifique-se de que está usando a chave correta (anon vs service_role)
- Verifique se não há espaços extras no início/fim da chave

### Problema: "Connection refused" ou "Cannot connect to database"

**Solução:**
- Verifique se o Supabase está rodando e acessível
- Confirme que a URL de conexão está correta
- Verifique se a senha do banco está correta na connection string
- Confirme que o host e porta estão corretos
- **Para Supabase Auto-hospedado**: Se estiver usando direct connection e tiver problemas, tente usar Session Pooler (PgBouncer) se disponível

### Problema: "Too many connections" ou problemas de conexão

**Solução:**
- Use **Session Pooler** ao invés de Direct Connection
- Session Pooler gerencia melhor as conexões simultâneas
- No painel do Supabase, procure pela connection string com "Connection Pooling" ou "Session Mode"
- Formato típico: `postgresql://postgres.[PROJECT-REF]:senha@pooler-host:5432/postgres`

### Problema: "Invalid redirect URL"

**Solução:**
- Verifique se a URL de redirect está configurada no Supabase
- Certifique-se de que a URL no código corresponde à configurada no Supabase
- Para desenvolvimento, use `http://localhost:3000`

### Problema: "RLS policy violation"

**Solução:**
- Isso é esperado até configurarmos as políticas RLS
- Por enquanto, podemos desabilitar temporariamente o RLS para testes (não recomendado em produção)
- As políticas serão configuradas na Fase 2.3 do TODO

---

## 5. PRÓXIMOS PASSOS

Após configurar o Supabase:

1. ✅ **Marcar como concluído** na TODO list: "Criar conta Supabase (auto-hospedado) e configurar"
2. ⏭️ **Próxima etapa**: Configurar Prisma para conectar com o Supabase PostgreSQL
3. ⏭️ **Depois**: Criar schema do banco de dados

---

## 📝 CHECKLIST DE CONFIGURAÇÃO

Use este checklist para garantir que tudo está configurado:

- [ ] Supabase instalado e rodando
- [ ] Project URL copiado e configurado em `.env.local`
- [ ] anon public key copiada e configurada
- [ ] service_role secret key copiada e configurada
- [ ] Connection string do PostgreSQL copiada e configurada
- [ ] Site URL configurado no Supabase Auth
- [ ] Redirect URLs configuradas no Supabase Auth
- [ ] Arquivo `.env.local` criado e preenchido
- [ ] Conexão testada e funcionando
- [ ] Tarefa marcada como concluída na TODO list

---

## 🔒 SEGURANÇA

**IMPORTANTE - Boas Práticas:**

1. **NUNCA** commite o arquivo `.env.local` no Git
2. **NUNCA** exponha a `SUPABASE_SERVICE_ROLE_KEY` no frontend
3. Use a `SUPABASE_ANON_KEY` no frontend (com RLS adequado)
4. Use a `SUPABASE_SERVICE_ROLE_KEY` apenas no backend
5. Rotacione as chaves periodicamente
6. Use diferentes projetos Supabase para desenvolvimento e produção

---

**Última atualização**: Criado para guiar a configuração inicial do Supabase no projeto Insta Post.
