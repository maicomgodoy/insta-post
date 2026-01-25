import { logger, task } from '@trigger.dev/sdk'
import { createFalAiService } from '@/lib/services/fal-ai-service'
import { aiJobService } from '@/lib/services/ai-job-service'
import type {
  FalAiTaskPayload,
  FalAiTaskResult,
  FalAiTextToImageInput,
  FalAiImageToImageInput,
} from '@/lib/services/fal-ai-types'

/**
 * Função helper para atualizar status do job no Supabase
 * Falhas são logadas mas não interrompem o fluxo
 */
async function updateJobStatus(
  jobId: string | undefined,
  status: 'STARTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED',
  data?: {
    progress?: number
    progressMessage?: string
    output?: Record<string, unknown>
    error?: { message: string; code?: string }
    triggerRunId?: string
  }
): Promise<void> {
  if (!jobId) {
    logger.warn('⚠️ updateJobStatus: jobId is undefined, skipping update')
    return
  }

  logger.info('🔄 updateJobStatus: Attempting to update', {
    jobId,
    status,
    hasProgress: data?.progress !== undefined,
    hasMessage: !!data?.progressMessage,
    hasOutput: !!data?.output,
    hasError: !!data?.error,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + '...',
  })

  try {
    const updatedJob = await aiJobService.updateJobStatus(jobId, {
      status,
      ...data,
    })
    
    logger.info(`✅ Job status updated successfully: ${status}`, { 
      jobId, 
      progress: data?.progress,
      updatedStatus: updatedJob.status,
      updatedAt: updatedJob.updatedAt,
    })
  } catch (error) {
    // Não falhar a task se não conseguir atualizar o job
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack : undefined
    
    logger.error('❌ Failed to update job status', {
      jobId,
      status,
      error: errorMessage,
      stack: errorStack,
      errorType: error?.constructor?.name,
    })
    
    // Re-throw para que possamos ver o erro completo nos logs do Trigger.dev
    throw new Error(`Failed to update job status: ${errorMessage}`, { cause: error })
  }
}

/**
 * Task para gerar ou editar imagens usando FAL.AI
 * 
 * Suporta:
 * - Text-to-image: modelo 'nano-banana'
 * - Image-to-image: modelo 'nano-banana/edit'
 * 
 * Disparar: tasks.trigger("fal-ai-generate", payload)
 * 
 * Se jobId for fornecido, atualiza o status em tempo real no Supabase
 * para que o frontend receba via Realtime.
 */
export const falAiGenerateTask = task({
  id: 'fal-ai-generate',
  run: async (payload: FalAiTaskPayload): Promise<FalAiTaskResult> => {
    const startTime = Date.now()
    const requestId = crypto.randomUUID()
    const { jobId } = payload

    // Verificar se DATABASE_URL está configurado (necessário para atualizar jobs)
    if (!process.env.DATABASE_URL) {
      const errorMsg = 'DATABASE_URL environment variable is not set in Trigger.dev. Please configure it in Project Settings → Environment Variables → Dev'
      logger.error('❌ FAL.AI Task: Missing DATABASE_URL', {
        requestId,
        jobId,
        error: errorMsg,
      })
      throw new Error(errorMsg)
    }

    logger.info('✅ FAL.AI Task: DATABASE_URL configured', {
      requestId,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 30) + '...',
    })

    // Etapa 1: Log de início e atualizar status para STARTED
    logger.info('🚀 FAL.AI Task: Iniciando geração de imagem', {
      requestId,
      jobId,
      model: payload.model,
      metadata: payload.metadata,
      inputKeys: Object.keys(payload.input),
      promptPreview: 'prompt' in payload.input 
        ? payload.input.prompt.substring(0, 100) + '...'
        : undefined,
    })

    // Atualizar job para STARTED
    await updateJobStatus(jobId, 'STARTED', {
      progress: 10,
      progressMessage: 'Iniciando processamento...',
    })

    try {
      // Etapa 2: Validação de entrada
      logger.info('✅ FAL.AI Task: Validando entrada', {
        requestId,
        model: payload.model,
      })

      // Atualizar progresso - validando
      await updateJobStatus(jobId, 'PROCESSING', {
        progress: 20,
        progressMessage: 'Validando entrada...',
      })

      if (!payload.model || !payload.input) {
        throw new Error('Model and input are required')
      }

      if (payload.model === 'nano-banana') {
        const input = payload.input as FalAiTextToImageInput
        if (!input.prompt || input.prompt.trim().length === 0) {
          throw new Error('Prompt is required for text-to-image')
        }
        logger.info('✅ FAL.AI Task: Entrada validada (text-to-image)', {
          requestId,
          promptLength: input.prompt.length,
          numImages: input.num_images ?? 1,
          aspectRatio: input.aspect_ratio ?? '1:1',
        })
      } else if (payload.model === 'nano-banana/edit') {
        const input = payload.input as FalAiImageToImageInput
        if (!input.prompt || input.prompt.trim().length === 0) {
          throw new Error('Prompt is required for image-to-image')
        }
        if (!input.image_urls || input.image_urls.length === 0) {
          throw new Error('image_urls is required for image-to-image')
        }
        logger.info('✅ FAL.AI Task: Entrada validada (image-to-image)', {
          requestId,
          promptLength: input.prompt.length,
          imageUrlsCount: input.image_urls.length,
          aspectRatio: input.aspect_ratio ?? 'auto',
        })
      } else {
        throw new Error(`Unsupported model: ${payload.model}`)
      }

      // Etapa 3: Preparação da requisição
      logger.info('🔧 FAL.AI Task: Preparando requisição', {
        requestId,
        model: payload.model,
        serviceMethod: payload.model === 'nano-banana' ? 'generateImage' : 'editImage',
      })

      // Atualizar progresso - preparando
      await updateJobStatus(jobId, 'PROCESSING', {
        progress: 30,
        progressMessage: 'Preparando requisição para FAL.AI...',
      })

      // Etapa 4: Chamada à API FAL.AI
      logger.info('🌐 FAL.AI Task: Chamando API FAL.AI', {
        requestId,
        model: payload.model,
      })

      // Atualizar progresso - chamando API
      await updateJobStatus(jobId, 'PROCESSING', {
        progress: 40,
        progressMessage: 'Enviando para FAL.AI...',
      })

      // Verificar se FAL_API_KEY ou FAL_KEY está disponível antes de criar o service
      const falApiKey = process.env.FAL_API_KEY || process.env.FAL_KEY
      if (!falApiKey) {
        throw new Error('FAL_API_KEY or FAL_KEY environment variable is not set in Trigger.dev. Please configure it in Project Settings → Environment Variables → Dev')
      }

      logger.info('🔑 FAL.AI Task: Chave API configurada', {
        requestId,
        apiKeyLength: falApiKey.length,
        apiKeyPrefix: falApiKey.substring(0, 10) + '...',
        apiKeySuffix: '...' + falApiKey.substring(falApiKey.length - 4),
        source: process.env.FAL_API_KEY ? 'FAL_API_KEY' : 'FAL_KEY',
        hasSpaces: falApiKey.includes(' '),
        hasNewlines: falApiKey.includes('\n') || falApiKey.includes('\r'),
        // Verificar se começa com padrão esperado (geralmente chaves FAL começam com algo específico)
        startsWith: falApiKey.substring(0, 5),
      })

      // O FalAiService já importa e configura o cliente @fal-ai/client
      // Não precisamos fazer import dinâmico aqui, o service cuida de tudo
      logger.info('🔐 FAL.AI Task: Chave API verificada, criando service', {
        requestId,
        apiKeyLength: falApiKey.length,
        source: process.env.FAL_API_KEY ? 'FAL_API_KEY' : 'FAL_KEY',
      })

      // Criar instância do service dentro da task para garantir que FAL_API_KEY está disponível
      const falAiService = createFalAiService()

      // Atualizar progresso - em fila do FAL.AI
      await updateJobStatus(jobId, 'PROCESSING', {
        progress: 50,
        progressMessage: 'Aguardando processamento do FAL.AI...',
      })

      let response
      if (payload.model === 'nano-banana') {
        const input = payload.input as FalAiTextToImageInput
        logger.info('🎨 FAL.AI Task: Chamando generateImage (text-to-image)', {
          requestId,
          promptLength: input.prompt.length,
          numImages: input.num_images ?? 1,
        })
        response = await falAiService.generateImage(input)
      } else {
        const input = payload.input as FalAiImageToImageInput
        if (input.image_urls.length === 0) {
          throw new Error('At least one image URL is required')
        }
        logger.info('🖼️ FAL.AI Task: Chamando editImage (image-to-image)', {
          requestId,
          promptLength: input.prompt.length,
          imageUrl: input.image_urls[0].substring(0, 100) + '...',
        })
        response = await falAiService.editImage(
          input.image_urls[0],
          input.prompt,
          {
            aspect_ratio: input.aspect_ratio,
            output_format: input.output_format,
            sync_mode: input.sync_mode,
          }
        )
      }

      // Atualizar progresso - processando resposta
      await updateJobStatus(jobId, 'PROCESSING', {
        progress: 80,
        progressMessage: 'Processando resultado...',
      })
      
      logger.info('📥 FAL.AI Task: Resposta recebida do service', {
        requestId,
        imagesCount: response.images.length,
        hasDescription: !!response.description,
      })

      // Etapa 5: Processamento da resposta
      logger.info('📦 FAL.AI Task: Processando resposta', {
        requestId,
        model: payload.model,
        imagesCount: response.images.length,
        description: response.description,
        imageUrls: response.images.map((img, idx) => ({
          index: idx + 1,
          url: img.url?.substring(0, 80) + '...',
          fileName: img.file_name,
          size: img.file_size,
          dimensions: img.width && img.height ? `${img.width}x${img.height}` : 'N/A',
        })),
      })

      const duration = Date.now() - startTime

      // Etapa 6: Resultado final
      logger.info('🎉 FAL.AI Task: Concluída com sucesso!', {
        requestId,
        model: payload.model,
        imagesCount: response.images.length,
        duration,
        durationSeconds: Math.round(duration / 1000),
      })

      const result: FalAiTaskResult = {
        success: true,
        data: response,
        metadata: {
          model: payload.model,
          requestId,
          duration,
        },
      }

      // Atualizar job para COMPLETED com o resultado
      await updateJobStatus(jobId, 'COMPLETED', {
        progress: 100,
        progressMessage: 'Concluído com sucesso!',
        output: {
          images: response.images,
          description: response.description,
        },
      })

      return result
    } catch (error: unknown) {
      const duration = Date.now() - startTime
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      logger.error('❌ FAL.AI Task: Falhou', {
        requestId,
        model: payload.model,
        error: errorMessage,
        duration,
        durationSeconds: Math.round(duration / 1000),
      })

      // Atualizar job para FAILED com o erro
      await updateJobStatus(jobId, 'FAILED', {
        progressMessage: `Erro: ${errorMessage}`,
        error: {
          message: errorMessage,
          code: 'FAL_AI_TASK_ERROR',
        },
      })

      const result: FalAiTaskResult = {
        success: false,
        error: {
          message: errorMessage,
          code: 'FAL_AI_TASK_ERROR',
        },
        metadata: {
          model: payload.model,
          requestId,
          duration,
        },
      }

      return result
    }
  },
})
