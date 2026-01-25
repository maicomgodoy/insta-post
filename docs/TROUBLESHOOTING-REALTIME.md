# Troubleshooting: Realtime não está recebendo atualizações

## Problema

O status do job fica como "PENDING" eternamente no frontend, mesmo que o Trigger.dev esteja processando.

## Possíveis Causas

### 1. Políticas RLS bloqueando atualizações do Prisma

Quando o Prisma se conecta diretamente ao PostgreSQL (via `DATABASE_URL`), ele não tem contexto de autenticação do Supabase. As políticas RLS que dependem de `auth.uid()` podem bloquear as atualizações.

**Solução:**
Execute o script `prisma/fix-ai-jobs-rls.sql` no Supabase SQL Editor:

```sql
-- Remover política antiga
DROP POLICY IF EXISTS "Service can update ai_jobs" ON ai_jobs;

-- Criar política que permite atualizações diretas
CREATE POLICY "Allow direct database updates" ON ai_jobs
  FOR UPDATE
  USING (true)
  WITH CHECK (true);
```

### 2. Tabela não está na publicação do Realtime

A tabela `ai_jobs` precisa estar na publicação `supabase_realtime` para que o Realtime funcione.

**Solução:**
Execute no Supabase SQL Editor:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE ai_jobs;
```

### 3. Verificar se o Trigger.dev está realmente atualizando

Verifique os logs do Trigger.dev para ver se há erros ao atualizar o job:

1. Acesse [cloud.trigger.dev](https://cloud.trigger.dev)
2. Vá para a run da task
3. Procure por logs com `updateJobStatus` ou `Failed to update job status`

**Se houver erros:**
- Verifique se `DATABASE_URL` está configurado no Trigger.dev Dashboard
- Verifique se a connection string está correta
- Verifique se o Prisma consegue se conectar ao banco

### 4. Verificar se o Realtime está habilitado no Supabase

1. Acesse o Supabase Dashboard
2. Vá em **Database** → **Replication**
3. Verifique se `ai_jobs` está na lista de tabelas replicadas

### 5. Verificar se o frontend está conectado corretamente

No console do navegador, você deve ver:
- `[useAiJobRealtime] Subscribing to channel: ai_job:...`
- `[useAiJobRealtime] Subscription status: SUBSCRIBED`
- `[useAiJobRealtime] Received update: ...`

**Se não estiver conectado:**
- Verifique se o token de autenticação está válido
- Verifique se a API `/api/supabase/realtime-config` está retornando as credenciais corretas

## Passos para Diagnóstico

1. **Verificar logs do Trigger.dev:**
   - Procure por `✅ Job status updated successfully` ou `❌ Failed to update job status`
   - Se houver erros, copie a mensagem completa

2. **Verificar no banco de dados:**
   ```sql
   SELECT id, status, progress, updated_at 
   FROM ai_jobs 
   WHERE id = 'seu-job-id'
   ORDER BY updated_at DESC;
   ```
   - Se o `status` e `updated_at` estão sendo atualizados, o problema é no Realtime
   - Se não estão sendo atualizados, o problema é no Trigger.dev/Prisma

3. **Verificar políticas RLS:**
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'ai_jobs';
   ```
   - Deve haver uma política de UPDATE com `USING (true)`

4. **Verificar publicação Realtime:**
   ```sql
   SELECT * FROM pg_publication_tables 
   WHERE pubname = 'supabase_realtime' 
   AND tablename = 'ai_jobs';
   ```
   - Deve retornar uma linha

## Solução Rápida

Execute o script completo `prisma/fix-ai-jobs-rls.sql` no Supabase SQL Editor. Ele:
1. Remove políticas antigas
2. Cria política que permite atualizações diretas
3. Adiciona a tabela à publicação do Realtime se necessário
4. Lista todas as políticas para verificação

## Após Corrigir

1. Teste criando um novo job
2. Verifique os logs do Trigger.dev para confirmar que está atualizando
3. Verifique o console do navegador para confirmar que está recebendo atualizações via Realtime
4. O status deve mudar de PENDING → STARTED → PROCESSING → COMPLETED
