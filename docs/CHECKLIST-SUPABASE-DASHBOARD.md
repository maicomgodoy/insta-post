# Checklist: O Que Verificar no Supabase Dashboard

Este documento lista **EXATAMENTE** o que você precisa verificar no Supabase Dashboard para o Realtime funcionar.

---

## 📍 PASSO 1: Settings → API → Realtime

### Como Acessar

1. Menu lateral: Clique em **Settings** (⚙️)
2. Submenu: Clique em **API**
3. Seção: Procure por **Realtime** ou **Realtime Settings**

### O Que Verificar

- [ ] **Realtime Enabled:** Toggle deve estar **ON** (verde/ativado)
- [ ] **Max Connections:** Deve ter um valor (ex: 100, 200, 500)
- [ ] **Max Channels:** Deve ter um valor (ex: 100, 200, 500)
- [ ] **Max Messages Per Second:** Deve ter um valor (ex: 100, 200)

### Se Não Estiver Habilitado

1. Ative o toggle **Realtime Enabled**
2. Clique em **Save** ou **Update**
3. Aguarde alguns segundos para propagação

**Nota:** Em Supabase auto-hospedado, isso pode estar em configurações do servidor (arquivo de config).

---

## 📍 PASSO 2: Database → Replication

### Como Acessar

1. Menu lateral: Clique em **Database** (🗄️)
2. Submenu: Clique em **Replication**
3. Lista: Procure por `ai_jobs` na lista de tabelas

### O Que Verificar

- [ ] Tabela `ai_jobs` **aparece na lista**
- [ ] Tabela `ai_jobs` tem **checkbox marcado** ou **toggle ativado**
- [ ] Status mostra como **Active** ou **Enabled**

### Se Não Estiver na Lista

**Opção 1: Via Dashboard**
- Se a tabela não aparecer, pode precisar adicionar manualmente via SQL

**Opção 2: Via SQL Editor (Recomendado)**
1. Vá em **SQL Editor**
2. Execute:
   ```sql
   ALTER PUBLICATION supabase_realtime ADD TABLE ai_jobs;
   ```
3. Volte em **Database → Replication** e verifique novamente

### Verificação SQL

Execute no **SQL Editor**:
```sql
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'ai_jobs';
```

**Resultado esperado:** Deve retornar **uma linha** com `tablename = 'ai_jobs'`

**Se não retornar nada:** Execute o comando `ALTER PUBLICATION` acima.

---

## 📍 PASSO 3: Database → Tables → ai_jobs → RLS

### Como Acessar

1. Menu lateral: Clique em **Database** (🗄️)
2. Submenu: Clique em **Tables**
3. Lista: Clique na tabela **ai_jobs**
4. Aba: Clique em **Policies** ou **RLS**

### O Que Verificar

- [ ] **Row Level Security:** Toggle deve estar **ON** (habilitado)

### Se RLS Não Estiver Habilitado

1. Ative o toggle **Row Level Security**
2. Clique em **Save**

### Verificação SQL

Execute no **SQL Editor**:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'ai_jobs';
```

**Resultado esperado:** `rowsecurity = true`

**Se `rowsecurity = false`:**
```sql
ALTER TABLE ai_jobs ENABLE ROW LEVEL SECURITY;
```

---

## 📍 PASSO 4: Database → Tables → ai_jobs → Policies

### Como Acessar

1. **Database** → **Tables** → **ai_jobs** → **Policies**

### O Que Verificar

Deve haver **4 políticas** (ou pelo menos 3):

1. **SELECT** - Para usuários verem seus próprios jobs
2. **UPDATE** - Para Trigger.dev atualizar (CRÍTICA)
3. **INSERT** - Para usuários criarem jobs
4. **DELETE** - Para usuários deletarem jobs (opcional)

### Verificação SQL

Execute no **SQL Editor**:
```sql
SELECT 
  policyname,
  cmd,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies
WHERE tablename = 'ai_jobs'
ORDER BY cmd, policyname;
```

### Políticas Necessárias

#### 1. Política SELECT (CRÍTICA para Realtime)

**Deve existir uma política com:**
- `cmd = 'SELECT'`
- `qual` contendo `auth.uid()::text = user_id`

**Se não existir ou estiver incorreta:**
```sql
DROP POLICY IF EXISTS "Users can view own ai_jobs" ON ai_jobs;

CREATE POLICY "Users can view own ai_jobs" ON ai_jobs
  FOR SELECT 
  USING (auth.uid()::text = user_id);
```

**Por que é crítica:** O Realtime só funciona se o usuário tiver permissão SELECT na linha. Se a política bloquear, o Realtime não receberá atualizações.

#### 2. Política UPDATE (CRÍTICA para Trigger.dev)

**Deve existir uma política com:**
- `cmd = 'UPDATE'`
- `qual = 'true'` (sem restrições)
- `with_check = 'true'` (sem restrições)

**Se não existir ou estiver incorreta:**
```sql
DROP POLICY IF EXISTS "Service can update ai_jobs" ON ai_jobs;
DROP POLICY IF EXISTS "Allow direct database updates" ON ai_jobs;

CREATE POLICY "Allow direct database updates" ON ai_jobs
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
```

**Por que é crítica:** O Trigger.dev precisa atualizar jobs sem contexto de autenticação. Se a política bloquear, as atualizações falharão.

#### 3. Política INSERT

**Deve existir uma política com:**
- `cmd = 'INSERT'`
- `with_check` contendo `auth.uid()::text = user_id`

**Se não existir:**
```sql
CREATE POLICY "Users can create own ai_jobs" ON ai_jobs
  FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);
```

#### 4. Política DELETE (Opcional)

**Se não existir:**
```sql
CREATE POLICY "Users can delete own ai_jobs" ON ai_jobs
  FOR DELETE 
  USING (auth.uid()::text = user_id);
```

---

## 📍 PASSO 5: Database → Tables → ai_jobs → Columns

### Como Acessar

1. **Database** → **Tables** → **ai_jobs** → **Columns**

### O Que Verificar

- [ ] Deve ter **16 colunas** principais (ver lista completa abaixo)

### Colunas Necessárias

1. `id` (uuid, primary key)
2. `user_id` (text/uuid)
3. `trigger_run_id` (text, nullable)
4. `job_type` (text)
5. `model` (text)
6. `status` (text)
7. `progress` (integer, nullable)
8. `progress_message` (text, nullable)
9. `input` (jsonb)
10. `output` (jsonb, nullable)
11. `error` (jsonb, nullable)
12. `metadata` (jsonb, nullable)
13. `started_at` (timestamp, nullable)
14. `completed_at` (timestamp, nullable)
15. `created_at` (timestamp)
16. `updated_at` (timestamp)

### Se Faltarem Colunas

Execute:
```bash
pnpm db:push
```

---

## 📍 PASSO 6: Database → Tables → ai_jobs → Indexes

### Como Acessar

1. **Database** → **Tables** → **ai_jobs** → **Indexes**

### O Que Verificar

- [ ] Deve haver **3 índices** (além do primary key):
  - Índice em `user_id`
  - Índice em `status`
  - Índice em `trigger_run_id`

### Se Faltarem Índices

Execute:
```bash
pnpm db:push
```

---

## 🔧 Script de Verificação Rápida

Execute este script no **Supabase SQL Editor** para verificar tudo de uma vez:

```sql
-- Verificação rápida de tudo
SELECT 
  '1. RLS Habilitado' as check_item,
  CASE WHEN rowsecurity THEN '✅' ELSE '❌' END as status
FROM pg_tables WHERE tablename = 'ai_jobs'
UNION ALL
SELECT 
  '2. Realtime Publication' as check_item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND tablename = 'ai_jobs'
    ) THEN '✅' 
    ELSE '❌' 
  END as status
UNION ALL
SELECT 
  '3. Política SELECT' as check_item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'ai_jobs' 
      AND cmd = 'SELECT'
      AND qual LIKE '%auth.uid()%'
    ) THEN '✅' 
    ELSE '❌' 
  END as status
UNION ALL
SELECT 
  '4. Política UPDATE' as check_item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'ai_jobs' 
      AND cmd = 'UPDATE'
      AND qual = 'true'
    ) THEN '✅' 
    ELSE '❌' 
  END as status
UNION ALL
SELECT 
  '5. Política INSERT' as check_item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'ai_jobs' 
      AND cmd = 'INSERT'
      AND with_check LIKE '%auth.uid()%'
    ) THEN '✅' 
    ELSE '❌' 
  END as status
UNION ALL
SELECT 
  '6. Estrutura da Tabela' as check_item,
  CASE 
    WHEN (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'ai_jobs') >= 16 
    THEN '✅' 
    ELSE '❌' 
  END as status
UNION ALL
SELECT 
  '7. Índices' as check_item,
  CASE 
    WHEN (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'ai_jobs' AND indexname NOT LIKE '%_pkey') >= 3 
    THEN '✅' 
    ELSE '❌' 
  END as status;
```

**Resultado esperado:** Todos devem retornar ✅

---

## 🔧 Script de Correção Completo

Se algum item estiver com ❌, execute este script:

```sql
-- =============================================================================
-- CORREÇÃO COMPLETA DO REALTIME
-- Execute no Supabase SQL Editor
-- =============================================================================

-- 1. Habilitar RLS
ALTER TABLE ai_jobs ENABLE ROW LEVEL SECURITY;

-- 2. Remover políticas antigas
DROP POLICY IF EXISTS "Service can update ai_jobs" ON ai_jobs;
DROP POLICY IF EXISTS "Allow direct database updates" ON ai_jobs;
DROP POLICY IF EXISTS "Users can view own ai_jobs" ON ai_jobs;
DROP POLICY IF EXISTS "Users can create own ai_jobs" ON ai_jobs;
DROP POLICY IF EXISTS "Users can delete own ai_jobs" ON ai_jobs;

-- 3. Criar políticas corretas

-- SELECT: CRÍTICA para Realtime
CREATE POLICY "Users can view own ai_jobs" ON ai_jobs
  FOR SELECT 
  USING (auth.uid()::text = user_id);

-- UPDATE: CRÍTICA para Trigger.dev
CREATE POLICY "Allow direct database updates" ON ai_jobs
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- INSERT: Para criar jobs
CREATE POLICY "Users can create own ai_jobs" ON ai_jobs
  FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

-- DELETE: Para limpeza (opcional)
CREATE POLICY "Users can delete own ai_jobs" ON ai_jobs
  FOR DELETE 
  USING (auth.uid()::text = user_id);

-- 4. Adicionar à publicação Realtime
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND tablename = 'ai_jobs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE ai_jobs;
    RAISE NOTICE '✅ Tabela ai_jobs adicionada à publicação';
  ELSE
    RAISE NOTICE '✅ Tabela ai_jobs já está na publicação';
  END IF;
END $$;

-- 5. Verificar resultado
SELECT 
  'RLS' as check_type,
  CASE WHEN rowsecurity THEN '✅' ELSE '❌' END as status
FROM pg_tables WHERE tablename = 'ai_jobs'
UNION ALL
SELECT 
  'Realtime Publication' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND tablename = 'ai_jobs'
    ) THEN '✅' 
    ELSE '❌' 
  END as status
UNION ALL
SELECT 
  'SELECT Policy' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'ai_jobs' 
      AND cmd = 'SELECT'
      AND qual LIKE '%auth.uid()%'
    ) THEN '✅' 
    ELSE '❌' 
  END as status
UNION ALL
SELECT 
  'UPDATE Policy' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'ai_jobs' 
      AND cmd = 'UPDATE'
      AND qual = 'true'
    ) THEN '✅' 
    ELSE '❌' 
  END as status;
```

---

## ✅ Checklist Final

Antes de testar, confirme **TODOS** os itens:

### No Supabase Dashboard

- [ ] **Settings → API → Realtime:** Habilitado
- [ ] **Database → Replication:** `ai_jobs` na lista e ativada
- [ ] **Database → Tables → ai_jobs → RLS:** Habilitado
- [ ] **Database → Tables → ai_jobs → Policies:**
  - [ ] Política SELECT existe e permite `auth.uid() = user_id`
  - [ ] Política UPDATE existe e permite `USING (true)`
  - [ ] Política INSERT existe e permite `auth.uid() = user_id`

### No Código

- [ ] `.env` tem `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Trigger.dev Dashboard tem `DATABASE_URL` configurado
- [ ] Código atualizado com token JWT no cliente Supabase

### Testes

- [ ] Script de verificação SQL mostra tudo ✅
- [ ] Console do navegador mostra "SUBSCRIBED"
- [ ] Logs do Trigger.dev mostram "✅ Job status updated successfully"

---

## 🎯 Ordem de Execução Recomendada

1. **Execute o script de correção SQL** (acima) no Supabase SQL Editor
2. **Verifique no Dashboard** todos os itens do checklist
3. **Execute o script de verificação SQL** para confirmar
4. **Teste criando um novo job**
5. **Verifique logs do Trigger.dev**
6. **Verifique console do navegador**

---

## 📞 Se Ainda Não Funcionar

Compartilhe:

1. **Resultado do script de verificação SQL** (todos os checks)
2. **Logs do Trigger.dev** (especialmente erros de atualização)
3. **Console do navegador** (status da subscription e erros)
4. **Screenshot do Dashboard** (Settings → API → Realtime)

---

**Última atualização:** 25 de Janeiro de 2026
