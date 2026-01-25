import { logger } from '../logger'
import { createApiError } from '../errors'
// Import dinâmico para compatibilidade com Trigger.dev
// import { fal } from '@fal-ai/client'
import type {
  FalAiModel,
  FalAiTextToImageInput,
  FalAiImageToImageInput,
  FalAiImageResponse,
  FalAiErrorResponse,
  FalAiApiError,
} from './fal-ai-types'

/**
 * Função auxiliar para obter a API key
 * Suporta tanto FAL_API_KEY quanto FAL_KEY para compatibilidade
 */
const getApiKey = (): string | undefined => {
  return process.env.FAL_API_KEY || process.env.FAL_KEY
}

/**
 * Service para integração com FAL.AI API
 * Usa o cliente oficial @fal-ai/client para autenticação e requisições
 */
export class FalAiService {
  constructor() {
    // Verificar se a chave está disponível (suporta FAL_API_KEY ou FAL_KEY)
    const key = getApiKey()
    if (!key) {
      throw new Error('FAL_API_KEY or FAL_KEY environment variable is required')
    }
    
    logger.debug('FAL.AI Service initialized', {
      apiKeyLength: key.trim().length,
      apiKeyPrefix: key.trim().substring(0, 8) + '...',
      hasSpaces: key.includes(' '),
      source: process.env.FAL_API_KEY ? 'FAL_API_KEY' : 'FAL_KEY',
    })
    // Nota: A configuração do cliente será feita no método callApi usando import dinâmico
    // para garantir compatibilidade com Trigger.dev
  }

  /**
   * Gera imagem a partir de texto (text-to-image)
   * 
   * @param input Parâmetros de geração
   * @returns Resposta com imagens geradas
   */
  async generateImage(
    input: FalAiTextToImageInput
  ): Promise<FalAiImageResponse> {
    try {
      logger.info('🎨 FAL.AI: Iniciando geração text-to-image', {
        prompt: input.prompt.substring(0, 100) + '...',
        aspect_ratio: input.aspect_ratio,
        num_images: input.num_images,
      })

      const response = await this.callApi('fal-ai/nano-banana', {
        prompt: input.prompt,
        num_images: input.num_images ?? 1,
        aspect_ratio: input.aspect_ratio ?? '1:1',
        output_format: input.output_format ?? 'png',
        sync_mode: input.sync_mode ?? false,
        limit_generations: input.limit_generations ?? false,
      })

      logger.info('✨ FAL.AI: Geração de imagem concluída', {
        imagesCount: response.images.length,
        description: response.description,
      })

      return response
    } catch (error: unknown) {
      const falAiError = error as FalAiApiError
      logger.error('FAL.AI: Image generation error', {
        error: falAiError.message || 'Unknown error',
        prompt: input.prompt.substring(0, 50) + '...',
      })

      if (falAiError.falAiError) {
        throw createApiError(
          `Erro ao gerar imagem: ${falAiError.falAiError.detail || falAiError.falAiError.error?.message || 'Erro desconhecido'}`,
          400,
          'FAL_AI_GENERATION_ERROR'
        )
      }

      if (error instanceof Error) {
        throw createApiError(
          `Erro ao gerar imagem: ${error.message}`,
          500,
          'FAL_AI_GENERATION_ERROR'
        )
      }

      throw createApiError(
        'Erro desconhecido ao gerar imagem',
        500,
        'FAL_AI_GENERATION_ERROR'
      )
    }
  }

  /**
   * Edita imagem existente (image-to-image)
   * 
   * @param imageUrl URL da imagem a ser editada
   * @param prompt Instruções de edição
   * @param options Opções adicionais
   * @returns Resposta com imagens editadas
   */
  async editImage(
    imageUrl: string,
    prompt: string,
    options?: {
      aspect_ratio?: FalAiTextToImageInput['aspect_ratio']
      output_format?: FalAiTextToImageInput['output_format']
      sync_mode?: boolean
    }
  ): Promise<FalAiImageResponse> {
    try {
      logger.info('🖼️ FAL.AI: Iniciando edição image-to-image', {
        prompt: prompt.substring(0, 100) + '...',
        imageUrl: imageUrl.substring(0, 100) + '...',
        aspect_ratio: options?.aspect_ratio,
      })

      const response = await this.callApi('fal-ai/nano-banana/edit', {
        prompt,
        image_urls: [imageUrl],
        aspect_ratio: options?.aspect_ratio ?? 'auto',
        output_format: options?.output_format ?? 'png',
        sync_mode: options?.sync_mode ?? false,
      })

      logger.info('✨ FAL.AI: Edição de imagem concluída', {
        imagesCount: response.images.length,
        description: response.description,
      })

      return response
    } catch (error: unknown) {
      const falAiError = error as FalAiApiError
      logger.error('FAL.AI: Image editing error', {
        error: falAiError.message || 'Unknown error',
        prompt: prompt.substring(0, 50) + '...',
      })

      if (falAiError.falAiError) {
        throw createApiError(
          `Erro ao editar imagem: ${falAiError.falAiError.detail || falAiError.falAiError.error?.message || 'Erro desconhecido'}`,
          400,
          'FAL_AI_EDIT_ERROR'
        )
      }

      if (error instanceof Error) {
        throw createApiError(
          `Erro ao editar imagem: ${error.message}`,
          500,
          'FAL_AI_EDIT_ERROR'
        )
      }

      throw createApiError(
        'Erro desconhecido ao editar imagem',
        500,
        'FAL_AI_EDIT_ERROR'
      )
    }
  }

  /**
   * Chama a API FAL.AI usando o cliente oficial
   * 
   * @param endpoint Endpoint do modelo (ex: 'fal-ai/nano-banana')
   * @param input Dados de entrada
   * @returns Resposta da API
   */
  private async callApi(
    endpoint: string,
    input: Record<string, unknown>
  ): Promise<FalAiImageResponse> {
    // Garantir que o cliente está configurado antes de usar
    // A documentação diz que o cliente pode ler automaticamente FAL_KEY,
    // mas vamos configurar explicitamente para garantir
    const apiKey = getApiKey()
    if (!apiKey) {
      throw new Error('FAL_API_KEY or FAL_KEY environment variable is required')
    }
    
    // Import dinâmico para compatibilidade com Trigger.dev
    // O import estático pode falhar em alguns ambientes
    const falModule = await import('@fal-ai/client')
    
    // Verificar se o import foi bem-sucedido
    // O @fal-ai/client pode exportar como default ou como named export
    let fal: any
    
    // Tentar diferentes formas de acessar o fal
    if (falModule.fal) {
      // Named export: { fal }
      fal = falModule.fal
      logger.debug('FAL.AI: Using named export (falModule.fal)')
    } else if (falModule.default?.fal) {
      // Default export com fal: { default: { fal } }
      fal = falModule.default.fal
      logger.debug('FAL.AI: Using default.fal')
    } else if (falModule.default && typeof (falModule.default as any).config === 'function') {
      // Default export é o próprio fal: { default: fal }
      fal = falModule.default
      logger.debug('FAL.AI: Using default as fal')
    } else {
      logger.error('FAL.AI: Failed to import @fal-ai/client', {
        endpoint,
        falModuleKeys: falModule ? Object.keys(falModule) : [],
        falModuleType: typeof falModule,
        hasDefault: !!falModule.default,
        defaultType: typeof falModule.default,
        defaultKeys: falModule.default ? Object.keys(falModule.default as any) : [],
        defaultHasConfig: falModule.default && typeof (falModule.default as any).config === 'function',
      })
      throw new Error('@fal-ai/client is not properly imported - fal export is not available')
    }

    // Verificar se fal.config existe
    if (!fal || typeof fal.config !== 'function') {
      logger.error('FAL.AI: fal.config is not available', {
        endpoint,
        falType: typeof fal,
        falKeys: fal ? Object.keys(fal) : [],
      })
      throw new Error('@fal-ai/client is not properly imported - fal.config is not available')
    }
    
    // Reconfigurar o cliente para garantir que está usando a chave correta
    // Conforme documentação: https://fal.ai/models/fal-ai/nano-banana/api
    fal.config({
      credentials: apiKey.trim(),
    })

    logger.info('📤 FAL.AI: Preparando requisição para API', {
      endpoint,
      inputKeys: Object.keys(input),
      apiKeyConfigured: true,
      apiKeyLength: apiKey.trim().length,
      source: process.env.FAL_API_KEY ? 'FAL_API_KEY' : 'FAL_KEY',
      // Log do endpoint completo para verificar
      fullEndpoint: endpoint,
    })

    try {
      // Usar o cliente oficial do FAL.AI conforme documentação
      // https://fal.ai/models/fal-ai/nano-banana/api
      logger.debug('FAL.AI: Calling subscribe', {
        endpoint,
        inputKeys: Object.keys(input),
      })

      // O fal.subscribe() faz polling internamente (aproximadamente a cada 3 segundos)
      // Logar início do polling
      const pollingStartTime = Date.now()
      logger.info('⏳ FAL.AI: Iniciando polling (intervalo ~3s)', {
        endpoint,
        pollingStartTime: new Date(pollingStartTime).toISOString(),
      })

      const result = await fal.subscribe(endpoint, {
        input: input as any,
        logs: true,
        onQueueUpdate: (update) => {
          const pollingElapsed = Date.now() - pollingStartTime
          
          // Log detalhado de cada update do polling com ícones baseados no status
          const statusIcon = update.status === 'IN_PROGRESS' ? '⚙️' : 
                            update.status === 'IN_QUEUE' ? '📋' : 
                            update.status === 'COMPLETED' ? '✅' : '🔄'
          
          logger.info(`${statusIcon} FAL.AI: Atualização do polling recebida`, {
            endpoint,
            status: update.status,
            position: update.position,
            elapsedMs: pollingElapsed,
            elapsedSeconds: Math.round(pollingElapsed / 1000),
            hasLogs: !!update.logs,
            logCount: update.logs?.length || 0,
          })
          
          // Logar mensagens de progresso
          if (update.logs && update.logs.length > 0) {
            update.logs.forEach((log) => {
              logger.info('📝 FAL.AI: Mensagem da fila', {
                endpoint,
                message: log.message,
                timestamp: log.timestamp,
                status: update.status,
              })
            })
          }
          
          // Log específico quando está em progresso
          if (update.status === 'IN_PROGRESS') {
            logger.info('⚙️ FAL.AI: Geração em progresso', {
              endpoint,
              position: update.position,
              elapsedSeconds: Math.round(pollingElapsed / 1000),
            })
          }
        },
      })

      const totalPollingTime = Date.now() - pollingStartTime
      logger.info('✅ FAL.AI: Polling concluído', {
        endpoint,
        totalPollingTimeMs: totalPollingTime,
        totalPollingTimeSeconds: Math.round(totalPollingTime / 1000),
        requestId: result.requestId,
      })

      logger.info('🎉 FAL.AI: Requisição à API bem-sucedida', {
        endpoint,
        requestId: result.requestId,
      })

      // Logar resposta completa do FAL.AI
      logger.info('📦 FAL.AI: Resposta completa recebida', {
        endpoint,
        requestId: result.requestId,
        hasData: !!result.data,
        dataKeys: result.data ? Object.keys(result.data) : [],
        imagesType: Array.isArray(result.data?.images) ? 'array' : typeof result.data?.images,
        imagesCount: Array.isArray(result.data?.images) 
          ? result.data.images.length 
          : result.data?.images ? 1 : 0,
        description: result.data?.description || '',
        // Logar URLs das imagens (primeiros 100 chars de cada)
        imageUrls: Array.isArray(result.data?.images)
          ? result.data.images.map((img: any) => 
              typeof img === 'string' ? img.substring(0, 100) : img.url?.substring(0, 100) || ''
            )
          : result.data?.images
            ? [typeof result.data.images === 'string' 
                ? result.data.images.substring(0, 100)
                : result.data.images.url?.substring(0, 100) || '']
            : [],
      })

      // Logar estrutura completa da resposta (debug)
      logger.debug('FAL.AI: Raw response structure', {
        endpoint,
        requestId: result.requestId,
        fullResponse: JSON.stringify(result, null, 2).substring(0, 1000), // Primeiros 1000 chars
      })

      const imageData: FalAiImageResponse = {
        images: Array.isArray(result.data?.images) 
          ? result.data.images.map((img: any) => ({
              url: img.url || (typeof img === 'string' ? img : ''),
              content_type: img.content_type,
              file_name: img.file_name,
              file_size: img.file_size,
              width: img.width,
              height: img.height,
            }))
          : result.data?.images && typeof result.data.images === 'object'
            ? [{
                url: result.data.images.url || '',
                content_type: result.data.images.content_type,
                file_name: result.data.images.file_name,
                file_size: result.data.images.file_size,
                width: result.data.images.width,
                height: result.data.images.height,
              }]
            : result.data?.images && typeof result.data.images === 'string'
              ? [{
                  url: result.data.images,
                  content_type: undefined,
                  file_name: undefined,
                  file_size: undefined,
                  width: undefined,
                  height: undefined,
                }]
              : [],
        description: result.data?.description || '',
      }

      return imageData
    } catch (error: any) {
      logger.error('❌ FAL.AI: Requisição à API falhou', {
        endpoint,
        error: error?.message || String(error),
        status: error?.status,
        statusCode: error?.statusCode,
      })

      const errorData: FalAiErrorResponse = {
        detail: error?.message || String(error),
        error: error?.error || {
          message: error?.message || 'Unknown error',
          code: error?.code,
        },
      }

      const falAiError: FalAiApiError = new Error(
        `FAL.AI API error: ${error?.message || 'Unknown error'}`
      )
      falAiError.falAiError = errorData
      falAiError.statusCode = error?.status || error?.statusCode || 500
      throw falAiError
    }
  }
}

/**
 * Cria uma instância do FalAiService
 * Usa esta função em vez de singleton para evitar erros na inicialização
 * quando a variável de ambiente não está disponível
 */
export function createFalAiService(): FalAiService {
  return new FalAiService()
}

// Exportar instância singleton (usar apenas quando FAL_API_KEY estiver configurada)
// Para tasks do trigger.dev, use createFalAiService() dentro da task
export const falAiService = createFalAiService()
