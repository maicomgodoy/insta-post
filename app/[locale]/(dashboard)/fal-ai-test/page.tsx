'use client'

import { useState } from 'react'
import { Card, Button, Input, Select, Textarea, Loading } from '@/components/ui'
import { useAiJobRealtime, type AiJob } from '@/hooks/useAiJobRealtime'

type ModelType = 'nano-banana' | 'nano-banana/edit'

interface DispatchResult {
  success: boolean
  jobId?: string
  taskHandle?: {
    id: string
  }
  error?: string
}

/**
 * Página de teste para integração FAL.AI com Supabase Realtime
 * 
 * Fluxo:
 * 1. Usuário preenche form e submete
 * 2. API cria job no Supabase e dispara task no Trigger.dev
 * 3. Frontend usa Supabase Realtime para receber atualizações
 * 4. Sem polling HTTP - atualizações em tempo real via WebSocket
 */
export default function FalAiTestPage() {
  const [model, setModel] = useState<ModelType>('nano-banana')
  const [isLoading, setIsLoading] = useState(false)
  const [dispatchResult, setDispatchResult] = useState<DispatchResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Text-to-image fields
  const [prompt, setPrompt] = useState('')
  const [numImages, setNumImages] = useState(1)
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [outputFormat, setOutputFormat] = useState('png')

  // Image-to-image fields
  const [imageUrl, setImageUrl] = useState('')

  // Hook de Realtime - monitora o job automaticamente via WebSocket
  const { 
    job, 
    isLoading: isJobLoading, 
    isCompleted, 
    isFailed, 
    isProcessing,
    error: realtimeError 
  } = useAiJobRealtime(dispatchResult?.jobId || null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setDispatchResult(null)

    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('No authentication token')
      }

      const payload: Record<string, unknown> = {
        model,
        input: {},
      }

      if (model === 'nano-banana') {
        payload.input = {
          prompt,
          num_images: numImages,
          aspect_ratio: aspectRatio,
          output_format: outputFormat,
        }
      } else {
        payload.input = {
          prompt,
          image_urls: [imageUrl],
          aspect_ratio: aspectRatio === 'auto' ? 'auto' : aspectRatio,
          output_format: outputFormat,
        }
      }

      const response = await fetch('/api/fal-ai/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || data.detail || 'Failed to dispatch task')
      }

      console.log('[FalAiTestPage] Job created:', data)
      setDispatchResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  // Resetar para nova geração
  const handleReset = () => {
    setDispatchResult(null)
    setError(null)
  }

  const aspectRatioOptions = [
    { value: '21:9', label: '21:9 (Ultra Wide)' },
    { value: '16:9', label: '16:9 (Wide)' },
    { value: '3:2', label: '3:2' },
    { value: '4:3', label: '4:3' },
    { value: '5:4', label: '5:4' },
    { value: '1:1', label: '1:1 (Square)' },
    { value: '4:5', label: '4:5 (Portrait)' },
    { value: '3:4', label: '3:4' },
    { value: '2:3', label: '2:3' },
    { value: '9:16', label: '9:16 (Story)' },
    ...(model === 'nano-banana/edit' ? [{ value: 'auto', label: 'Auto' }] : []),
  ]

  // Extrair imagens do output do job
  const getImages = (job: AiJob | null) => {
    if (!job?.output) return []
    const output = job.output as { images?: Array<{ url: string; file_name?: string; content_type?: string; width?: number; height?: number; file_size?: number }> }
    if (!output.images) return []
    return Array.isArray(output.images) ? output.images : [output.images]
  }

  const images = getImages(job)
  const description: string | null = job?.output 
    ? (typeof (job.output as { description?: unknown }).description === 'string' 
        ? (job.output as { description: string }).description 
        : null)
    : null

  // Determinar se deve mostrar loading overlay
  const showLoadingOverlay = Boolean(dispatchResult?.jobId) && !isCompleted && !isFailed
  
  // Determinar se deve mostrar job status (garantir que dispatchResult não é null)
  const shouldShowJobStatus = dispatchResult !== null && dispatchResult.jobId !== undefined

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-heading-lg font-bold text-gray-900 dark:text-gray-50 mb-2">
          FAL.AI Test
        </h1>
        <p className="text-body text-gray-600 dark:text-gray-400">
          Teste a integração com FAL.AI usando Supabase Realtime
        </p>
        <p className="text-body-sm text-gray-500 dark:text-gray-500 mt-1">
          Atualizações em tempo real via WebSocket - sem polling HTTP
        </p>
      </div>

      <Card className="p-6 relative">
        {/* Loading Overlay - aparece enquanto está gerando */}
        {showLoadingOverlay && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/95 dark:bg-[#0A0A0A]/95 backdrop-blur-sm z-20 rounded-md">
            <div className="text-center">
              <Loading size="lg" />
              <p className="text-body-sm text-gray-600 dark:text-gray-400 mt-4 font-medium">
                Gerando imagem{numImages > 1 ? 's' : ''}...
              </p>
              
              {/* Progress bar */}
              {job?.progress !== null && job?.progress !== undefined && (
                <div className="mt-4 w-48 mx-auto">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-300 ease-out"
                      style={{ width: `${job.progress}%` }}
                    />
                  </div>
                  <p className="text-body-xs text-gray-500 dark:text-gray-500 mt-1">
                    {job.progress}%
                  </p>
                </div>
              )}

              {job?.status && (
                <p className="text-body-xs text-gray-500 dark:text-gray-500 mt-2">
                  Status: <span className="font-medium">{job.status}</span>
                </p>
              )}
              {job?.progress_message && (
                <p className="text-body-xs text-gray-400 dark:text-gray-600 mt-1">
                  {job.progress_message}
                </p>
              )}
              {!job?.status && (
                <p className="text-body-xs text-gray-500 dark:text-gray-500 mt-2">
                  Conectando ao Realtime...
                </p>
              )}
              <p className="text-body-xs text-green-600 dark:text-green-400 mt-2">
                Recebendo atualizações em tempo real
              </p>
            </div>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Model Selection */}
          <div>
            <Select
              label="Modelo"
              value={model}
              onChange={(e) => setModel(e.target.value as ModelType)}
              options={[
                { value: 'nano-banana', label: 'Nano-Banana (Text-to-Image)' },
                { value: 'nano-banana/edit', label: 'Nano-Banana Edit (Image-to-Image)' },
              ]}
            />
          </div>

          {/* Prompt */}
          <div>
            <Textarea
              label="Prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Descreva a imagem que deseja gerar ou editar..."
              rows={4}
              required
            />
          </div>

          {/* Image URL (only for image-to-image) */}
          {model === 'nano-banana/edit' && (
            <div>
              <Input
                label="URL da Imagem"
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                required
              />
              <p className="mt-1.5 text-caption text-gray-500 dark:text-gray-400">
                URL da imagem que será editada (deve ser acessível publicamente)
              </p>
            </div>
          )}

          {/* Number of Images (only for text-to-image) */}
          {model === 'nano-banana' && (
            <div>
              <Input
                label="Número de Imagens"
                type="number"
                min={1}
                max={10}
                value={numImages}
                onChange={(e) => setNumImages(parseInt(e.target.value) || 1)}
              />
            </div>
          )}

          {/* Aspect Ratio */}
          <div>
            <Select
              label="Proporção (Aspect Ratio)"
              value={aspectRatio}
              onChange={(e) => setAspectRatio(e.target.value)}
              options={aspectRatioOptions}
            />
          </div>

          {/* Output Format */}
          <div>
            <Select
              label="Formato de Saída"
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              options={[
                { value: 'png', label: 'PNG' },
                { value: 'jpeg', label: 'JPEG' },
                { value: 'webp', label: 'WebP' },
              ]}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-3">
            <Button type="submit" loading={isLoading} fullWidth>
              {isLoading ? 'Enviando...' : 'Executar Task'}
            </Button>
            {dispatchResult && (
              <Button type="button" variant="secondary" onClick={handleReset}>
                Nova Geração
              </Button>
            )}
          </div>
        </form>

        {/* Error Display */}
        {error || realtimeError ? (
          <div className="mt-6 p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-md">
            <p className="text-body-sm text-error-600 dark:text-error-400">
              <strong>Erro:</strong> {String(error || realtimeError || '')}
            </p>
          </div>
        ) : null}

        {/* Job Status Display */}
        {shouldShowJobStatus && dispatchResult ? (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-[#1F1F1F] border border-gray-200 dark:border-gray-800 rounded-md">
            <h3 className="text-body font-semibold text-gray-900 dark:text-gray-50 mb-3">
              Status do Job
            </h3>
            <div className="space-y-3">
              <p className="text-body-sm text-gray-700 dark:text-gray-300">
                <strong>Job ID:</strong> {dispatchResult.jobId ?? ''}
              </p>
              {dispatchResult.taskHandle?.id && (
                <p className="text-body-sm text-gray-700 dark:text-gray-300">
                  <strong>Trigger Run ID:</strong> {dispatchResult.taskHandle.id}
                </p>
              )}
              {job && (
                <>
                  <p className="text-body-sm text-gray-700 dark:text-gray-300">
                    <strong>Status:</strong>{' '}
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      job.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : job.status === 'FAILED' || job.status === 'CANCELLED'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                      {job.status}
                    </span>
                  </p>
                  {job.progress !== null && (
                    <p className="text-body-sm text-gray-700 dark:text-gray-300">
                      <strong>Progresso:</strong> {job.progress}%
                    </p>
                  )}
                  {job.progress_message && (
                    <p className="text-body-sm text-gray-700 dark:text-gray-300">
                      <strong>Mensagem:</strong> {job.progress_message}
                    </p>
                  )}
                  {isProcessing && (
                    <p className="text-body-sm text-green-600 dark:text-green-400">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
                      Recebendo atualizações via Realtime...
                    </p>
                  )}
                </>
              )}
              {isJobLoading && !job && (
                <p className="text-body-sm text-gray-500 dark:text-gray-400">
                  Conectando ao Supabase Realtime...
                </p>
              )}
            </div>
          </div>
        ) : null}

        {/* Images Display */}
        {isCompleted && images.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-[#1F1F1F] border border-gray-200 dark:border-gray-800 rounded-md">
            <h3 className="text-body font-semibold text-gray-900 dark:text-gray-50 mb-4">
              Imagens Geradas ({images.length})
            </h3>
            {description ? (
              <p className="text-body-sm text-gray-600 dark:text-gray-400 mb-4">
                <strong>Descrição:</strong> {description}
              </p>
            ) : null}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map((image, index) => {
                const imgUrl = typeof image === 'string' ? image : image.url
                const fileName = typeof image === 'string' ? undefined : image.file_name
                const contentType = typeof image === 'string' ? undefined : image.content_type
                const width = typeof image === 'string' ? undefined : image.width
                const height = typeof image === 'string' ? undefined : image.height
                const fileSize = typeof image === 'string' ? undefined : image.file_size
                
                if (!imgUrl) return null
                
                return (
                  <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                    <div className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <img
                        src={imgUrl}
                        alt={fileName || `Generated image ${index + 1}`}
                        className="w-full h-full object-contain"
                        loading="lazy"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23ddd" width="400" height="400"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="18" dy="10.5" font-weight="bold" x="50%25" y="50%25" text-anchor="middle"%3EErro ao carregar imagem%3C/text%3E%3C/svg%3E'
                        }}
                      />
                    </div>
                    <div className="p-3 bg-white dark:bg-gray-900">
                      <p className="text-body-xs text-gray-600 dark:text-gray-400 truncate">
                        {fileName || `Image ${index + 1}`}
                      </p>
                      {fileSize && (
                        <p className="text-body-xs text-gray-500 dark:text-gray-500 mt-1">
                          Tamanho: {(fileSize / 1024).toFixed(1)} KB
                        </p>
                      )}
                      {width && height && (
                        <p className="text-body-xs text-gray-500 dark:text-gray-500 mt-1">
                          {width} x {height}px
                        </p>
                      )}
                      {contentType && (
                        <p className="text-body-xs text-gray-500 dark:text-gray-500 mt-1">
                          Tipo: {contentType}
                        </p>
                      )}
                      <a
                        href={imgUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-body-xs text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block"
                      >
                        Abrir em nova aba
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Error Display from Job */}
        {isFailed && job?.error ? (
          <div className="mt-6 p-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-md">
            <h3 className="text-body font-semibold text-error-700 dark:text-error-400 mb-2">
              Erro no Job
            </h3>
            <p className="text-body-sm text-error-600 dark:text-error-400">
              <strong>Mensagem:</strong> {(job.error as { message?: string }).message || 'Erro desconhecido'}
            </p>
            {(job.error as { code?: string }).code ? (
              <p className="text-body-sm text-error-600 dark:text-error-400 mt-1">
                <strong>Código:</strong> {(job.error as { code?: string }).code}
              </p>
            ) : null}
          </div>
        ) : null}
      </Card>
    </div>
  )
}
