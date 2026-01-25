-- =============================================================================
-- RLS Policies para tabela ai_jobs
-- Execute este script no Supabase SQL Editor após criar a tabela
-- =============================================================================

-- Habilitar Row Level Security na tabela ai_jobs
ALTER TABLE ai_jobs ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- Políticas de SELECT
-- -----------------------------------------------------------------------------

-- Usuários podem ver apenas seus próprios jobs
CREATE POLICY "Users can view own ai_jobs" ON ai_jobs
  FOR SELECT 
  USING (auth.uid()::text = user_id);

-- -----------------------------------------------------------------------------
-- Políticas de INSERT
-- -----------------------------------------------------------------------------

-- Usuários podem criar jobs para si mesmos
CREATE POLICY "Users can create own ai_jobs" ON ai_jobs
  FOR INSERT 
  WITH CHECK (auth.uid()::text = user_id);

-- Service role pode criar jobs (usado pelo Next.js API)
-- Nota: service_role já bypassa RLS por padrão, mas deixamos explícito

-- -----------------------------------------------------------------------------
-- Políticas de UPDATE
-- -----------------------------------------------------------------------------

-- IMPORTANTE: Quando o Prisma se conecta diretamente ao PostgreSQL (não via Supabase client),
-- ele não tem contexto de autenticação do Supabase. Para permitir atualizações do Trigger.dev,
-- precisamos de uma política que funcione mesmo sem auth.uid().

-- Política 1: Permitir atualizações quando não há contexto de autenticação (Prisma direto)
-- Isso permite que o Prisma atualize jobs quando conectado diretamente ao PostgreSQL
CREATE POLICY "Allow direct database updates" ON ai_jobs
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Política 2: Usuários autenticados podem atualizar seus próprios jobs (opcional, para futuro)
-- CREATE POLICY "Users can update own ai_jobs" ON ai_jobs
--   FOR UPDATE
--   USING (auth.uid()::text = user_id)
--   WITH CHECK (auth.uid()::text = user_id);

-- -----------------------------------------------------------------------------
-- Políticas de DELETE
-- -----------------------------------------------------------------------------

-- Usuários podem deletar seus próprios jobs (opcional, para limpeza)
CREATE POLICY "Users can delete own ai_jobs" ON ai_jobs
  FOR DELETE 
  USING (auth.uid()::text = user_id);

-- =============================================================================
-- Habilitar Realtime para a tabela ai_jobs
-- =============================================================================

-- Adicionar tabela à publicação do Supabase Realtime
-- Isso permite que clientes recebam atualizações em tempo real
ALTER PUBLICATION supabase_realtime ADD TABLE ai_jobs;

-- =============================================================================
-- Índices adicionais para performance (se necessário)
-- =============================================================================

-- Os índices já foram criados pelo Prisma:
-- - idx_ai_jobs_user_id
-- - idx_ai_jobs_status
-- - idx_ai_jobs_trigger_run_id

-- Índice composto para queries comuns (opcional)
-- CREATE INDEX IF NOT EXISTS idx_ai_jobs_user_status ON ai_jobs(user_id, status);

-- =============================================================================
-- Notas importantes
-- =============================================================================

-- 1. O service_role do Supabase já bypassa RLS por padrão
--    O Trigger.dev e o Next.js API usam SUPABASE_SERVICE_ROLE_KEY
--    que tem acesso total à tabela

-- 2. O frontend usa o token do usuário (anon key + JWT)
--    que respeita as políticas de RLS acima

-- 3. Para o Realtime funcionar, o usuário precisa ter permissão SELECT
--    na linha que está sendo atualizada (já coberto pela policy "Users can view own ai_jobs")
