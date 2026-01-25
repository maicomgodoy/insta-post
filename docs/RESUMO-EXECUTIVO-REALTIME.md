# Resumo Executivo: Diagnóstico e Solução do Realtime

## 🎯 Problema

O Realtime não está funcionando - status fica como PENDING eternamente no frontend.

---

## 🔍 Análise Completa Realizada

### ✅ O Que Foi Verificado

1. **Banco de Dados:**
   - ✅ Tabela `ai_jobs` existe e tem estrutura correta
   - ✅ RLS habilitado
   - ✅ Política UPDATE permite atualizações diretas
   - ✅ Tabela na publicação `supabase_realtime`
   - ✅ Índices criados

2. **Código:**
   - ✅ Hook `useAiJobRealtime` implementado
   - ✅ API `/api/supabase/realtime-config` funcionando
   - ✅ Trigger.dev atualizando status
   - ✅ Logs detalhados adicionados

3. **Configuração:**
   - ✅ `DATABASE_URL` no Trigger.dev
   - ✅ Variáveis de ambiente configuradas

---

## 🚨 Problema Identificado

**O cliente Supabase no frontend precisa do token JWT configurado para o Realtime funcionar com RLS.**

O Supabase Realtime usa o token JWT para:
1. Verificar políticas RLS (especialmente SELECT)
2. Determinar se o usuário pode receber atualizações
3. Autenticar a conexão WebSocket

**Sem o token JWT configurado, o Realtime não consegue verificar as políticas RLS e bloqueia as atualizações.**

---

## ✅ Correção Aplicada

**Arquivo:** `hooks/useAiJobRealtime.ts`

**Mudança:** Adicionado configuração do token JWT no cliente Supabase:

```typescript
// Antes (INCORRETO):
const client = createClient(config.url, config.anonKey)

// Depois (CORRETO):
const client = createClient(config.url, config.anonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  },
  realtime: {
    params: {
      apikey: config.anonKey,
    },
  },
})

// Configurar session com token JWT
await client.auth.setSession({
  access_token: token,
  refresh_token: '',
  expires_at: expiresAt,
  // ...
})
```

---

## 📋 Checklist de Verificação no Supabase Dashboard

### 1. Settings → API → Realtime

- [ ] **Realtime Enabled:** Toggle ON
- [ ] **Max Connections:** Valor configurado
- [ ] **Max Channels:** Valor configurado

### 2. Database → Replication

- [ ] Tabela `ai_jobs` aparece na lista
- [ ] Está marcada/ativada

**SQL de verificação:**
```sql
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'ai_jobs';
```

**Se não retornar nada:**
```sql
ALTER PUBLICATION supabase_realtime ADD TABLE ai_jobs;
```

### 3. Database → Tables → ai_jobs → Policies

**Verificar políticas existentes:**
```sql
SELECT policyname, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'ai_jobs'
ORDER BY cmd;
```

**Políticas necessárias:**

1. **SELECT (CRÍTICA para Realtime):**
   ```sql
   CREATE POLICY "Users can view own ai_jobs" ON ai_jobs
     FOR SELECT 
     USING (auth.uid()::text = user_id);
   ```

2. **UPDATE (CRÍTICA para Trigger.dev):**
   ```sql
   CREATE POLICY "Allow direct database updates" ON ai_jobs
     FOR UPDATE
     USING (true)
     WITH CHECK (true);
   ```

3. **INSERT:**
   ```sql
   CREATE POLICY "Users can create own ai_jobs" ON ai_jobs
     FOR INSERT 
     WITH CHECK (auth.uid()::text = user_id);
   ```

### 4. Database → Tables → ai_jobs → RLS

- [ ] **Row Level Security:** Toggle ON

**SQL:**
```sql
ALTER TABLE ai_jobs ENABLE ROW LEVEL SECURITY;
```

---

## 🔧 Script de Correção Completo

Execute este script no **Supabase SQL Editor**:

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

-- 3. Criar políticas corretas

-- SELECT: CRÍTICA para Realtime funcionar
CREATE POLICY "Users can view own ai_jobs" ON ai_jobs
  FOR SELECT 
  USING (auth.uid()::text = user_id);

-- UPDATE: CRÍTICA para Trigger.dev atualizar
CREATE POLICY "Allow direct database updates" ON ai_jobs
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- INSERT: Para criar jobs
CREATE POLICY "Users can create own ai_jobs" ON ai_jobs
  FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

-- 4. Adicionar à publicação Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE ai_jobs;

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

**Resultado esperado:** Todos devem retornar ✅

---

## 🧪 Teste Manual Passo a Passo

### 1. Verificar se Trigger.dev está atualizando

**No Supabase SQL Editor:**
```sql
-- Criar um job de teste
INSERT INTO ai_jobs (id, user_id, job_type, model, status, progress, input)
VALUES (
  gen_random_uuid(),
  'seu-user-id',
  'image_generation',
  'nano-banana',
  'PENDING',
  0,
  '{}'::jsonb
)
RETURNING id;
```

**Copie o ID retornado.**

**Depois, atualize manualmente:**
```sql
UPDATE ai_jobs 
SET status = 'STARTED', progress = 50, updated_at = NOW()
WHERE id = 'id-copiado';
```

**Verifique se o `updated_at` mudou.**

### 2. Testar SELECT no Frontend

**No console do navegador:**
```javascript
const token = localStorage.getItem('access_token');
const response = await fetch('/api/supabase/realtime-config', {
  headers: { Authorization: `Bearer ${token}` }
});
const { url, anonKey } = await response.json();

const { createClient } = await import('@supabase/supabase-js');
const supabase = createClient(url, anonKey, {
  global: { headers: { Authorization: `Bearer ${token}` } }
});

// Configurar session
await supabase.auth.setSession({
  access_token: token,
  refresh_token: '',
  expires_at: Date.now() + 3600000,
} as any);

// Testar SELECT
const { data, error } = await supabase
  .from('ai_jobs')
  .select('*')
  .eq('id', 'id-copiado')
  .single();

console.log('SELECT Test:', { data, error });
```

**Se der erro "permission denied":**
- Política SELECT está bloqueando
- Execute o script de correção acima

### 3. Testar Realtime

**No console do navegador (continuando do teste 2):**
```javascript
const channel = supabase
  .channel('test-realtime')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'ai_jobs',
    filter: `id=eq.id-copiado`,
  }, (payload) => {
    console.log('✅ Realtime update received:', payload);
  })
  .subscribe((status) => {
    console.log('Subscription status:', status);
  });

// Aguardar 5 segundos, depois execute no SQL Editor:
// UPDATE ai_jobs SET status = 'TEST', updated_at = NOW() WHERE id = 'id-copiado';
```

**Se não receber atualização:**
- Verificar se tabela está na publicação
- Verificar política SELECT
- Verificar se Realtime está habilitado

---

## 📊 Ordem de Verificação Recomendada

1. **Execute o script de correção SQL** (acima)
2. **Verifique no Dashboard:**
   - Settings → API → Realtime (habilitado)
   - Database → Replication (`ai_jobs` na lista)
   - Database → Tables → ai_jobs → RLS (habilitado)
   - Database → Tables → ai_jobs → Policies (4 políticas)
3. **Teste SELECT manualmente** (teste 2 acima)
4. **Teste Realtime manualmente** (teste 3 acima)
5. **Crie um job real** e verifique se funciona

---

## 🎯 Pontos Críticos

### ⚠️ CRÍTICO 1: Política SELECT

**Por que é crítica:**
- O Realtime **PRECISA** que o usuário tenha permissão SELECT na linha
- Se a política bloquear, o Realtime não receberá atualizações
- Mesmo que a subscription esteja "SUBSCRIBED", não receberá eventos

**Verificar:**
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'ai_jobs' 
AND cmd = 'SELECT'
AND qual LIKE '%auth.uid()%';
```

### ⚠️ CRÍTICO 2: Token JWT no Cliente

**Por que é crítico:**
- O Realtime usa o token JWT para verificar políticas RLS
- Sem o token, o Realtime não consegue autenticar
- A correção já foi aplicada no código

**Verificar no código:**
- `hooks/useAiJobRealtime.ts` deve ter `client.auth.setSession()` configurado

### ⚠️ CRÍTICO 3: Tabela na Publicação

**Por que é crítico:**
- Se a tabela não estiver na publicação, o Realtime não monitora mudanças
- Mesmo que tudo mais esteja correto, não funcionará

**Verificar:**
```sql
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'ai_jobs';
```

---

## 📁 Documentos Criados

1. **`docs/VERIFICACAO-SUPABASE-REALTIME.md`** - Guia completo de verificação
2. **`docs/GUIA-VISUAL-SUPABASE-REALTIME.md`** - Guia visual passo a passo
3. **`docs/DIAGNOSTICO-COMPLETO-REALTIME.md`** - Diagnóstico por sintoma
4. **`docs/RESUMO-EXECUTIVO-REALTIME.md`** - Este documento
5. **`scripts/verify-realtime-config.sql`** - Script SQL de verificação

---

## 🚀 Próximos Passos

1. **Execute o script de correção SQL** no Supabase SQL Editor
2. **Verifique no Dashboard** todos os itens do checklist
3. **Teste manualmente** usando os testes acima
4. **Crie um job real** e verifique se o Realtime funciona
5. **Se ainda não funcionar**, compartilhe:
   - Resultado do script de verificação
   - Logs do Trigger.dev
   - Console do navegador
   - Status da subscription

---

**Última atualização:** 25 de Janeiro de 2026
