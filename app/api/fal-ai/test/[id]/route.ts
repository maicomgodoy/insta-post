import { NextRequest, NextResponse } from 'next/server'
import { validateApiAuth } from '@/src/middleware/api-auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/fal-ai/test/[id]
 * Busca o resultado de uma task FAL.AI pelo ID (run ID)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Validar autenticação
    const authResult = await validateApiAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const runId = params.id

    if (!runId) {
      return NextResponse.json(
        { error: 'Run ID is required' },
        { status: 400 }
      )
    }

    // Buscar resultado da run usando API HTTP do Trigger.dev
    // O SDK pode não ter runs.retrieve() disponível, então usamos a API diretamente
    const triggerSecretKey = process.env.TRIGGER_SECRET_KEY
    
    if (!triggerSecretKey) {
      return NextResponse.json(
        {
          error: 'TRIGGER_SECRET_KEY must be configured in environment variables',
        },
        { status: 500 }
      )
    }
    
    // Usar API do Trigger.dev para buscar a run
    const apiUrl = `https://api.trigger.dev/api/v3/runs/${runId}`
    
    let run: any = null
    try {
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${triggerSecretKey}`,
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        if (response.status === 404) {
          return NextResponse.json(
            { error: 'Run not found', runId },
            { status: 404 }
          )
        }
        
        const errorText = await response.text()
        console.error('[fal-ai-test-get] Trigger.dev API error:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          runId,
        })
        
        throw new Error(`Trigger.dev API error: ${response.status} - ${errorText}`)
      }
      
      run = await response.json()
    } catch (fetchError) {
      console.error('[fal-ai-test-get] Error fetching run from Trigger.dev API:', {
        runId,
        error: fetchError instanceof Error ? fetchError.message : String(fetchError),
        errorStack: fetchError instanceof Error ? fetchError.stack : undefined,
      })
      
      if (fetchError instanceof Error) {
        return NextResponse.json(
          {
            error: 'Falha ao buscar resultado da task',
            detail: fetchError.message,
            runId,
          },
          { status: 500 }
        )
      }
      
      throw fetchError
    }

    if (!run) {
      return NextResponse.json(
        { error: 'Run not found', runId },
        { status: 404 }
      )
    }

    // Retornar status e resultado (normalizar estrutura)
    return NextResponse.json({
      id: run.id || runId,
      status: run.status || run.state || 'UNKNOWN',
      output: run.output || null,
      error: run.error || null,
      createdAt: run.createdAt || run.startedAt || null,
      completedAt: run.completedAt || run.finishedAt || null,
      isSuccess: run.isSuccess !== undefined ? run.isSuccess : (run.status === 'COMPLETED' && !run.error),
      isFailed: run.isFailed !== undefined ? run.isFailed : (run.status === 'FAILED' || run.status === 'CRASHED'),
      isCompleted: run.isCompleted !== undefined ? run.isCompleted : (run.status === 'COMPLETED' || run.status === 'FAILED' || run.status === 'CRASHED'),
    })
  } catch (error) {
    console.error('[fal-ai-test-get] Unexpected error:', {
      error: error instanceof Error ? error.message : String(error),
      errorStack: error instanceof Error ? error.stack : undefined,
      runId: params?.id,
    })
    return NextResponse.json(
      {
        error: 'Falha ao buscar resultado da task',
        detail: error instanceof Error ? error.message : String(error),
        runId: params?.id,
      },
      { status: 500 }
    )
  }
}
