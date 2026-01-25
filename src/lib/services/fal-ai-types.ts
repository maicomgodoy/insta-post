/**
 * Tipos e interfaces para integração com FAL.AI
 */

/**
 * Aspect ratios suportados pela API FAL.AI
 */
export type FalAiAspectRatio =
  | '21:9'
  | '16:9'
  | '3:2'
  | '4:3'
  | '5:4'
  | '1:1'
  | '4:5'
  | '3:4'
  | '2:3'
  | '9:16'
  | 'auto'

/**
 * Formatos de saída suportados
 */
export type FalAiOutputFormat = 'jpeg' | 'png' | 'webp'

/**
 * Modelos disponíveis no FAL.AI
 */
export type FalAiModel = 'nano-banana' | 'nano-banana/edit'

/**
 * Input para text-to-image (nano-banana)
 */
export interface FalAiTextToImageInput {
  prompt: string
  num_images?: number
  aspect_ratio?: FalAiAspectRatio
  output_format?: FalAiOutputFormat
  sync_mode?: boolean
  limit_generations?: boolean
}

/**
 * Input para image-to-image (nano-banana/edit)
 */
export interface FalAiImageToImageInput {
  prompt: string
  image_urls: string[]
  aspect_ratio?: FalAiAspectRatio
  output_format?: FalAiOutputFormat
  sync_mode?: boolean
}

/**
 * Arquivo de imagem retornado pela API
 */
export interface FalAiImageFile {
  url: string
  content_type?: string
  file_name?: string
  file_size?: number
  file_data?: string
  width?: number
  height?: number
}

/**
 * Resposta padrão da API FAL.AI para geração de imagens
 */
export interface FalAiImageResponse {
  images: FalAiImageFile[]
  description: string
}

/**
 * Erro retornado pela API FAL.AI
 */
export interface FalAiErrorResponse {
  detail?: string
  error?: {
    message: string
    code?: string
  }
}

/**
 * Erro customizado para erros da API FAL.AI
 */
export interface FalAiApiError extends Error {
  falAiError?: FalAiErrorResponse
  statusCode?: number
}

/**
 * Payload para a task do trigger.dev
 */
export interface FalAiTaskPayload {
  model: FalAiModel
  input: FalAiTextToImageInput | FalAiImageToImageInput
  /** ID do job no Supabase (ai_jobs table) para atualização de status em tempo real */
  jobId?: string
  metadata?: {
    userId?: string
    postId?: string
    [key: string]: unknown
  }
}

/**
 * Resultado da task do trigger.dev
 */
export interface FalAiTaskResult {
  success: boolean
  data?: FalAiImageResponse
  error?: {
    message: string
    code: string
  }
  metadata: {
    model: FalAiModel
    requestId?: string
    duration?: number
  }
}
