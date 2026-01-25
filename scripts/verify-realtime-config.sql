-- =============================================================================
-- Script de Verificação Completa do Realtime
-- Execute este script no Supabase SQL Editor
-- =============================================================================

\echo '============================================================================='
\echo 'VERIFICAÇÃO COMPLETA DO REALTIME - ai_jobs'
\echo '============================================================================='
\echo ''

-- 1. Verificar se RLS está habilitado
\echo '1. Verificando RLS...'
SELECT 
  'RLS Status' as check_type,
  CASE 
    WHEN rowsecurity THEN '✅ Habilitado'
    ELSE '❌ Desabilitado - Execute: ALTER TABLE ai_jobs ENABLE ROW LEVEL SECURITY;'
  END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'ai_jobs';

\echo ''

-- 2. Verificar políticas RLS
\echo '2. Verificando Políticas RLS...'
SELECT 
  cmd as policy_type,
  policyname,
  CASE 
    WHEN cmd = 'SELECT' AND qual LIKE '%auth.uid()%' THEN '✅ SELECT OK'
    WHEN cmd = 'UPDATE' AND (qual = 'true' OR qual IS NULL) THEN '✅ UPDATE OK'
    WHEN cmd = 'INSERT' AND with_check LIKE '%auth.uid()%' THEN '✅ INSERT OK'
    WHEN cmd = 'DELETE' AND qual LIKE '%auth.uid()%' THEN '✅ DELETE OK'
    ELSE '⚠️ Verificar política'
  END as status,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies
WHERE tablename = 'ai_jobs'
ORDER BY cmd, policyname;

\echo ''

-- 3. Verificar publicação Realtime
\echo '3. Verificando Publicação Realtime...'
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND tablename = 'ai_jobs'
    ) THEN '✅ Tabela está na publicação supabase_realtime'
    ELSE '❌ Tabela NÃO está na publicação - Execute: ALTER PUBLICATION supabase_realtime ADD TABLE ai_jobs;'
  END as status;

\echo ''

-- 4. Verificar estrutura da tabela
\echo '4. Verificando Estrutura da Tabela...'
SELECT 
  COUNT(*) as column_count,
  CASE 
    WHEN COUNT(*) >= 16 THEN '✅ Estrutura OK (16+ colunas)'
    ELSE '⚠️ Faltando colunas - Execute: pnpm db:push'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'ai_jobs';

\echo ''

-- 5. Verificar índices
\echo '5. Verificando Índices...'
SELECT 
  COUNT(*) as index_count,
  CASE 
    WHEN COUNT(*) >= 3 THEN '✅ Índices OK (3+ índices)'
    ELSE '⚠️ Faltando índices - Execute: pnpm db:push'
  END as status
FROM pg_indexes
WHERE schemaname = 'public' 
AND tablename = 'ai_jobs'
AND indexname NOT LIKE '%_pkey';

\echo ''

-- 6. Verificar se há jobs de teste
\echo '6. Verificando Jobs Existentes...'
SELECT 
  COUNT(*) as total_jobs,
  COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending,
  COUNT(CASE WHEN status = 'STARTED' THEN 1 END) as started,
  COUNT(CASE WHEN status = 'PROCESSING' THEN 1 END) as processing,
  COUNT(CASE WHEN status = 'COMPLETED' THEN 1 END) as completed,
  COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed
FROM ai_jobs;

\echo ''

-- 7. Verificar última atualização
\echo '7. Verificando Última Atualização...'
SELECT 
  id,
  status,
  progress,
  updated_at,
  CASE 
    WHEN updated_at > NOW() - INTERVAL '5 minutes' THEN '✅ Atualizado recentemente'
    WHEN updated_at > NOW() - INTERVAL '1 hour' THEN '⚠️ Atualizado há mais de 5 minutos'
    ELSE '❌ Não atualizado há mais de 1 hora'
  END as update_status
FROM ai_jobs
ORDER BY updated_at DESC
LIMIT 5;

\echo ''
\echo '============================================================================='
\echo 'RESUMO'
\echo '============================================================================='
\echo ''
\echo 'Se algum item estiver com ❌ ou ⚠️, execute as correções sugeridas.'
\echo ''
\echo 'Para corrigir tudo de uma vez, execute: prisma/fix-ai-jobs-rls.sql'
\echo ''
