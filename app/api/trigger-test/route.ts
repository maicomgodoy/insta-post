import { NextResponse } from 'next/server'
import { tasks } from '@trigger.dev/sdk'
import type { exampleTask } from '@/trigger/example'

export const dynamic = 'force-dynamic'

/**
 * GET /api/trigger-test
 * Dispara a task de exemplo para validar a conexão com Trigger.dev.
 * Remova ou proteja em produção.
 */
export async function GET() {
  try {
    const handle = await tasks.trigger<typeof exampleTask>('example', {
      name: 'Insta Post',
    })
    return NextResponse.json(handle)
  } catch (error) {
    console.error('[trigger-test]', error)
    return NextResponse.json(
      {
        error: 'Falha ao disparar task',
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
