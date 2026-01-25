import { NextRequest, NextResponse } from 'next/server'
import { tasks } from '@trigger.dev/sdk'
import { z } from 'zod'
import { validateBody, validationErrorResponse } from '@/src/middleware/api-validation'
import { validateApiAuth } from '@/src/middleware/api-auth'
import { aiJobService, type AiJobType } from '@/src/lib/services/ai-job-service'
import type { falAiGenerateTask } from '@/trigger/fal-ai'

export const dynamic = 'force-dynamic'

/**
 * Schema de validação para text-to-image
 */
const textToImageSchema = z.object({
  model: z.literal('nano-banana'),
  input: z.object({
    prompt: z.string().min(1, 'Prompt is required'),
    num_images: z.number().int().min(1).max(10).optional(),
    aspect_ratio: z.enum(['21:9', '16:9', '3:2', '4:3', '5:4', '1:1', '4:5', '3:4', '2:3', '9:16']).optional(),
    output_format: z.enum(['jpeg', 'png', 'webp']).optional(),
    sync_mode: z.boolean().optional(),
    limit_generations: z.boolean().optional(),
  }),
  metadata: z.record(z.unknown()).optional(),
})

/**
 * Schema de validação para image-to-image
 */
const imageToImageSchema = z.object({
  model: z.literal('nano-banana/edit'),
  input: z.object({
    prompt: z.string().min(1, 'Prompt is required'),
    image_urls: z.array(z.string().url('Invalid image URL')).min(1, 'At least one image URL is required'),
    aspect_ratio: z.enum(['21:9', '16:9', '3:2', '4:3', '5:4', '1:1', '4:5', '3:4', '2:3', '9:16', 'auto']).optional(),
    output_format: z.enum(['jpeg', 'png', 'webp']).optional(),
    sync_mode: z.boolean().optional(),
  }),
  metadata: z.record(z.unknown()).optional(),
})

/**
 * Schema unificado (union)
 */
const falAiTestSchema = z.discriminatedUnion('model', [
  textToImageSchema,
  imageToImageSchema,
])

/**
 * Mapeia o modelo para o tipo de job
 */
function getJobType(model: string): AiJobType {
  if (model === 'nano-banana') return 'image_generation'
  if (model === 'nano-banana/edit') return 'image_edit'
  return 'image_generation'
}

/**
 * POST /api/fal-ai/test
 * Dispara a task FAL.AI para gerar ou editar imagens.
 * 
 * Fluxo:
 * 1. Valida autenticação e body
 * 2. Cria job no Supabase (status: PENDING)
 * 3. Dispara task no Trigger.dev com jobId
 * 4. Retorna jobId para o frontend usar com Realtime
 */
export async function POST(request: NextRequest) {
  try {
    // Validar autenticação
    const authResult = await validateApiAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    const userId = authResult.user.id

    // Validar body
    const validation = await validateBody(request, falAiTestSchema)
    
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }

    const payload = validation.data

    // 1. Criar job no Supabase com status PENDING
    const job = await aiJobService.createJob({
      userId,
      jobType: getJobType(payload.model),
      model: payload.model,
      input: payload.input as Record<string, unknown>,
      metadata: {
        ...payload.metadata,
        source: 'api-test',
      },
    })

    console.log('[fal-ai-test] Job created:', { jobId: job.id, userId, model: payload.model })

    // 2. Disparar task no trigger.dev com o jobId
    const handle = await tasks.trigger<typeof falAiGenerateTask>(
      'fal-ai-generate',
      {
        ...payload,
        jobId: job.id, // Passar o jobId para o trigger
      }
    )

    console.log('[fal-ai-test] Task triggered:', { taskId: handle.id, jobId: job.id })

    // 3. Atualizar job com o triggerRunId
    await aiJobService.updateJobStatus(job.id, {
      status: 'PENDING',
      triggerRunId: handle.id,
    })

    return NextResponse.json({
      success: true,
      jobId: job.id,
      taskHandle: {
        id: handle.id,
      },
      message: 'Job created and task dispatched successfully',
    })
  } catch (error) {
    console.error('[fal-ai-test]', error)
    return NextResponse.json(
      {
        error: 'Falha ao disparar task FAL.AI',
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
