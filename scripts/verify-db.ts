/**
 * Script para verificar se o banco de dados está corretamente atualizado
 * Verifica:
 * - Se a tabela ai_jobs existe e tem a estrutura correta
 * - Se as políticas RLS estão aplicadas
 * - Se a tabela está na publicação do Realtime
 * - Se os índices existem
 * 
 * Uso: pnpm tsx scripts/verify-db.ts
 */

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface VerificationResult {
  check: string
  status: '✅' | '❌' | '⚠️'
  message: string
  details?: string
}

async function verifyDatabase(): Promise<void> {
  const results: VerificationResult[] = []

  console.log('🔍 Verificando banco de dados...\n')

  try {
    // 1. Verificar se a tabela ai_jobs existe
    try {
      const tableExists = await prisma.$queryRaw<Array<{ exists: boolean }>>`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'ai_jobs'
        ) as exists;
      `
      
      if (tableExists[0]?.exists) {
        results.push({
          check: 'Tabela ai_jobs existe',
          status: '✅',
          message: 'Tabela encontrada no banco de dados',
        })
      } else {
        results.push({
          check: 'Tabela ai_jobs existe',
          status: '❌',
          message: 'Tabela não encontrada. Execute: pnpm db:push',
        })
      }
    } catch (error) {
      results.push({
        check: 'Tabela ai_jobs existe',
        status: '❌',
        message: `Erro ao verificar: ${error instanceof Error ? error.message : String(error)}`,
      })
    }

    // 2. Verificar estrutura da tabela (colunas principais)
    try {
      const columns = await prisma.$queryRaw<Array<{ column_name: string; data_type: string }>>`
        SELECT column_name, data_type
        FROM information_schema.columns
        WHERE table_schema = 'public' 
        AND table_name = 'ai_jobs'
        ORDER BY ordinal_position;
      `

      const requiredColumns = [
        'id',
        'user_id',
        'trigger_run_id',
        'job_type',
        'model',
        'status',
        'progress',
        'progress_message',
        'input',
        'output',
        'error',
        'metadata',
        'started_at',
        'completed_at',
        'created_at',
        'updated_at',
      ]

      const existingColumns = columns.map((c) => c.column_name)
      const missingColumns = requiredColumns.filter((col) => !existingColumns.includes(col))

      if (missingColumns.length === 0) {
        results.push({
          check: 'Estrutura da tabela',
          status: '✅',
          message: `Todas as ${requiredColumns.length} colunas necessárias estão presentes`,
          details: `Colunas encontradas: ${existingColumns.length}`,
        })
      } else {
        results.push({
          check: 'Estrutura da tabela',
          status: '❌',
          message: `Colunas faltando: ${missingColumns.join(', ')}`,
          details: `Execute: pnpm db:push para sincronizar o schema`,
        })
      }
    } catch (error) {
      results.push({
        check: 'Estrutura da tabela',
        status: '❌',
        message: `Erro ao verificar: ${error instanceof Error ? error.message : String(error)}`,
      })
    }

    // 3. Verificar se RLS está habilitado
    try {
      const rlsEnabled = await prisma.$queryRaw<Array<{ rowsecurity: boolean }>>`
        SELECT rowsecurity
        FROM pg_tables
        WHERE schemaname = 'public' 
        AND tablename = 'ai_jobs';
      `

      if (rlsEnabled[0]?.rowsecurity) {
        results.push({
          check: 'RLS habilitado',
          status: '✅',
          message: 'Row Level Security está habilitado na tabela',
        })
      } else {
        results.push({
          check: 'RLS habilitado',
          status: '⚠️',
          message: 'RLS não está habilitado. Execute o script prisma/ai-jobs-rls.sql',
        })
      }
    } catch (error) {
      results.push({
        check: 'RLS habilitado',
        status: '❌',
        message: `Erro ao verificar: ${error instanceof Error ? error.message : String(error)}`,
      })
    }

    // 4. Verificar políticas RLS
    try {
      const policies = await prisma.$queryRaw<Array<{ policyname: string; cmd: string }>>`
        SELECT policyname, cmd
        FROM pg_policies
        WHERE schemaname = 'public' 
        AND tablename = 'ai_jobs'
        ORDER BY policyname;
      `

      const requiredPolicies = {
        SELECT: 'Users can view own ai_jobs',
        INSERT: 'Users can create own ai_jobs',
        UPDATE: 'Allow direct database updates',
        DELETE: 'Users can delete own ai_jobs',
      }

      const existingPolicies = policies.map((p) => ({ name: p.policyname, cmd: p.cmd }))
      const updatePolicy = existingPolicies.find(
        (p) => p.cmd === 'UPDATE' && p.name.includes('update')
      )

      if (updatePolicy) {
        results.push({
          check: 'Política RLS de UPDATE',
          status: '✅',
          message: `Política encontrada: ${updatePolicy.name}`,
          details: `Total de políticas: ${policies.length}`,
        })
      } else {
        results.push({
          check: 'Política RLS de UPDATE',
          status: '❌',
          message: 'Política de UPDATE não encontrada. Execute: prisma/fix-ai-jobs-rls.sql',
          details: `Políticas encontradas: ${policies.map((p) => p.policyname).join(', ') || 'nenhuma'}`,
        })
      }
    } catch (error) {
      results.push({
        check: 'Políticas RLS',
        status: '❌',
        message: `Erro ao verificar: ${error instanceof Error ? error.message : String(error)}`,
      })
    }

    // 5. Verificar se está na publicação do Realtime
    try {
      const inRealtime = await prisma.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename
        FROM pg_publication_tables
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'ai_jobs';
      `

      if (inRealtime.length > 0) {
        results.push({
          check: 'Publicação Realtime',
          status: '✅',
          message: 'Tabela está na publicação supabase_realtime',
        })
      } else {
        results.push({
          check: 'Publicação Realtime',
          status: '❌',
          message: 'Tabela não está na publicação. Execute: ALTER PUBLICATION supabase_realtime ADD TABLE ai_jobs;',
        })
      }
    } catch (error) {
      results.push({
        check: 'Publicação Realtime',
        status: '❌',
        message: `Erro ao verificar: ${error instanceof Error ? error.message : String(error)}`,
      })
    }

    // 6. Verificar índices
    try {
      const indexes = await prisma.$queryRaw<Array<{ indexname: string; indexdef: string }>>`
        SELECT indexname, indexdef
        FROM pg_indexes
        WHERE schemaname = 'public' 
        AND tablename = 'ai_jobs'
        AND indexname NOT LIKE '%_pkey';
      `

      // Prisma cria índices com nomes automáticos, então verificamos pelas colunas
      const indexDefs = indexes.map((i) => i.indexdef.toLowerCase())
      const hasUserIdIndex = indexDefs.some((def) => def.includes('user_id'))
      const hasStatusIndex = indexDefs.some((def) => def.includes('status'))
      const hasTriggerRunIdIndex = indexDefs.some((def) => def.includes('trigger_run_id'))

      const allIndexesPresent = hasUserIdIndex && hasStatusIndex && hasTriggerRunIdIndex

      if (allIndexesPresent) {
        results.push({
          check: 'Índices',
          status: '✅',
          message: `Todos os 3 índices necessários estão presentes`,
          details: `Índices encontrados: ${indexes.length} (user_id, status, trigger_run_id)`,
        })
      } else {
        const missing: string[] = []
        if (!hasUserIdIndex) missing.push('user_id')
        if (!hasStatusIndex) missing.push('status')
        if (!hasTriggerRunIdIndex) missing.push('trigger_run_id')
        
        results.push({
          check: 'Índices',
          status: '⚠️',
          message: `Índices faltando para: ${missing.join(', ')}`,
          details: `Índices encontrados: ${indexes.length}. Execute: pnpm db:push para criar os índices`,
        })
      }
    } catch (error) {
      results.push({
        check: 'Índices',
        status: '❌',
        message: `Erro ao verificar: ${error instanceof Error ? error.message : String(error)}`,
      })
    }

    // 7. Testar conexão e query básica
    try {
      const testQuery = await prisma.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM ai_jobs;
      `
      results.push({
        check: 'Conexão e query',
        status: '✅',
        message: `Conexão funcionando. Total de jobs: ${testQuery[0]?.count || 0}`,
      })
    } catch (error) {
      results.push({
        check: 'Conexão e query',
        status: '❌',
        message: `Erro ao executar query: ${error instanceof Error ? error.message : String(error)}`,
      })
    }
  } catch (error) {
    console.error('❌ Erro geral:', error)
  } finally {
    await prisma.$disconnect()
  }

  // Exibir resultados
  console.log('\n📊 Resultados da Verificação:\n')
  results.forEach((result) => {
    console.log(`${result.status} ${result.check}`)
    console.log(`   ${result.message}`)
    if (result.details) {
      console.log(`   (${result.details})`)
    }
    console.log()
  })

  // Resumo
  const successCount = results.filter((r) => r.status === '✅').length
  const warningCount = results.filter((r) => r.status === '⚠️').length
  const errorCount = results.filter((r) => r.status === '❌').length

  console.log('\n📈 Resumo:')
  console.log(`   ✅ Sucesso: ${successCount}/${results.length}`)
  console.log(`   ⚠️  Avisos: ${warningCount}`)
  console.log(`   ❌ Erros: ${errorCount}`)

  if (errorCount > 0) {
    console.log('\n💡 Próximos passos:')
    console.log('   1. Execute: pnpm db:push (para sincronizar schema)')
    console.log('   2. Execute o script: prisma/fix-ai-jobs-rls.sql (no Supabase SQL Editor)')
    console.log('   3. Execute novamente este script para verificar')
    process.exit(1)
  } else if (warningCount > 0) {
    console.log('\n💡 Alguns avisos foram encontrados, mas não são críticos.')
    process.exit(0)
  } else {
    console.log('\n🎉 Banco de dados está corretamente configurado!')
    process.exit(0)
  }
}

verifyDatabase().catch((error) => {
  console.error('Erro fatal:', error)
  process.exit(1)
})
