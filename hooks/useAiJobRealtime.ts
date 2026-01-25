'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient, RealtimeChannel } from '@supabase/supabase-js'

/**
 * Interface do AiJob (espelha o modelo Prisma)
 */
export interface AiJob {
  id: string
  user_id: string
  trigger_run_id: string | null
  job_type: string
  model: string
  status: 'PENDING' | 'STARTED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'CANCELLED'
  progress: number | null
  progress_message: string | null
  input: unknown
  output: unknown | null
  error: unknown | null
  metadata: unknown | null
  started_at: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
}

/**
 * Estado retornado pelo hook
 */
export interface UseAiJobRealtimeResult {
  job: AiJob | null
  isLoading: boolean
  isCompleted: boolean
  isFailed: boolean
  isProcessing: boolean
  error: string | null
  refetch: () => Promise<void>
}

/**
 * Cache para credenciais do Supabase
 */
let supabaseConfigCache: { url: string; anonKey: string } | null = null
let configCacheExpiry: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

/**
 * Busca as credenciais do Supabase via API autenticada
 * Não expõe chaves diretamente no frontend
 */
async function getSupabaseConfig(): Promise<{ url: string; anonKey: string }> {
  // Verificar cache
  if (supabaseConfigCache && Date.now() < configCacheExpiry) {
    return supabaseConfigCache
  }

  const token = localStorage.getItem('access_token')
  if (!token) {
    throw new Error('No authentication token')
  }

  const response = await fetch('/api/supabase/realtime-config', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get Supabase config: ${response.status}`)
  }

  const config = await response.json()
  
  // Cachear credenciais
  supabaseConfigCache = config
  configCacheExpiry = Date.now() + CACHE_DURATION

  return config
}

/**
 * Cria um cliente Supabase para o frontend
 * Busca credenciais via API autenticada (não usa variáveis públicas)
 */
async function getSupabaseClient() {
  const config = await getSupabaseConfig()
  return createClient(config.url, config.anonKey)
}

/**
 * Hook para escutar atualizações de um AI Job em tempo real via Supabase Realtime
 * 
 * @param jobId - ID do job para monitorar (ou null para não monitorar)
 * @returns Estado do job e funções auxiliares
 * 
 * @example
 * ```tsx
 * const { job, isLoading, isCompleted, isFailed } = useAiJobRealtime(jobId)
 * 
 * if (isLoading) return <Loading />
 * if (isFailed) return <Error message={job?.error?.message} />
 * if (isCompleted) return <Success images={job?.output?.images} />
 * return <Processing progress={job?.progress} />
 * ```
 */
export function useAiJobRealtime(jobId: string | null): UseAiJobRealtimeResult {
  const [job, setJob] = useState<AiJob | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabaseRef = useRef<Awaited<ReturnType<typeof getSupabaseClient>> | null>(null)

  // Função para buscar o job atual
  const fetchJob = useCallback(async (id: string) => {
    try {
      if (!supabaseRef.current) {
        supabaseRef.current = await getSupabaseClient()
      }

      const { data, error: fetchError } = await supabaseRef.current
        .from('ai_jobs')
        .select('*')
        .eq('id', id)
        .single()

      if (fetchError) {
        // Se for 404 (não encontrado), pode ser que o job ainda não foi criado
        if (fetchError.code === 'PGRST116') {
          console.log('[useAiJobRealtime] Job not found yet, waiting for creation...')
          return
        }
        throw new Error(fetchError.message)
      }

      setJob(data as AiJob)
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch job'
      console.error('[useAiJobRealtime] Error fetching job:', errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Função de refetch exposta
  const refetch = useCallback(async () => {
    if (jobId) {
      setIsLoading(true)
      await fetchJob(jobId)
    }
  }, [jobId, fetchJob])

  // Efeito para configurar o Realtime
  useEffect(() => {
    // Se não há jobId, limpar estado
    if (!jobId) {
      setJob(null)
      setIsLoading(false)
      setError(null)
      return
    }

    let isMounted = true
    let channel: RealtimeChannel | null = null

    // Função async para inicializar
    const initialize = async () => {
      try {
        // Inicializar cliente Supabase
        if (!supabaseRef.current) {
          supabaseRef.current = await getSupabaseClient()
        }

        if (!isMounted) return

        const supabase = supabaseRef.current

        // Buscar estado inicial
        setIsLoading(true)
        await fetchJob(jobId!)

        if (!isMounted) return

        // Configurar canal Realtime
        const channelName = `ai_job:${jobId}`
        console.log('[useAiJobRealtime] Subscribing to channel:', channelName)

        channel = supabase
          .channel(channelName)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'ai_jobs',
              filter: `id=eq.${jobId}`,
            },
            (payload) => {
              if (!isMounted) return
              console.log('[useAiJobRealtime] Received update:', {
                status: (payload.new as AiJob).status,
                progress: (payload.new as AiJob).progress,
              })
              setJob(payload.new as AiJob)
              setError(null)
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'ai_jobs',
              filter: `id=eq.${jobId}`,
            },
            (payload) => {
              if (!isMounted) return
              console.log('[useAiJobRealtime] Job created:', payload.new)
              setJob(payload.new as AiJob)
              setIsLoading(false)
              setError(null)
            }
          )
          .subscribe((status) => {
            if (!isMounted) return
            console.log('[useAiJobRealtime] Subscription status:', status)
            if (status === 'SUBSCRIBED') {
              console.log('[useAiJobRealtime] Successfully subscribed to job updates')
            }
            if (status === 'CHANNEL_ERROR') {
              console.error('[useAiJobRealtime] Channel error')
              setError('Failed to subscribe to job updates')
            }
          })

        channelRef.current = channel
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : 'Failed to initialize Supabase')
        setIsLoading(false)
      }
    }

    initialize()

    // Cleanup
    return () => {
      isMounted = false
      console.log('[useAiJobRealtime] Unsubscribing from channel')
      if (channelRef.current && supabaseRef.current) {
        supabaseRef.current.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [jobId, fetchJob])

  // Calcular estados derivados
  const isCompleted = job?.status === 'COMPLETED'
  const isFailed = job?.status === 'FAILED' || job?.status === 'CANCELLED'
  const isProcessing = job?.status === 'STARTED' || job?.status === 'PROCESSING'

  return {
    job,
    isLoading,
    isCompleted,
    isFailed,
    isProcessing,
    error,
    refetch,
  }
}

/**
 * Hook para monitorar múltiplos jobs em tempo real
 * Útil para listar jobs do usuário com atualizações ao vivo
 */
export function useAiJobsRealtime(userId: string | null): {
  jobs: AiJob[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
} {
  const [jobs, setJobs] = useState<AiJob[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const channelRef = useRef<RealtimeChannel | null>(null)
  const supabaseRef = useRef<Awaited<ReturnType<typeof getSupabaseClient>> | null>(null)

  const fetchJobs = useCallback(async (uid: string) => {
    try {
      if (!supabaseRef.current) {
        supabaseRef.current = await getSupabaseClient()
      }

      const { data, error: fetchError } = await supabaseRef.current
        .from('ai_jobs')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false })
        .limit(50)

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      setJobs(data as AiJob[])
      setError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch jobs'
      console.error('[useAiJobsRealtime] Error fetching jobs:', errorMessage)
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const refetch = useCallback(async () => {
    if (userId) {
      setIsLoading(true)
      await fetchJobs(userId)
    }
  }, [userId, fetchJobs])

  useEffect(() => {
    if (!userId) {
      setJobs([])
      setIsLoading(false)
      return
    }

    let isMounted = true
    let channel: RealtimeChannel | null = null

    const initialize = async () => {
      try {
        if (!supabaseRef.current) {
          supabaseRef.current = await getSupabaseClient()
        }

        if (!isMounted) return

        const supabase = supabaseRef.current

        // Buscar jobs iniciais
        setIsLoading(true)
        await fetchJobs(userId)

        if (!isMounted) return

        // Configurar Realtime para todos os jobs do usuário
        channel = supabase
          .channel(`ai_jobs:user:${userId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'ai_jobs',
              filter: `user_id=eq.${userId}`,
            },
            (payload) => {
              if (!isMounted) return
              if (payload.eventType === 'INSERT') {
                setJobs((prev) => [payload.new as AiJob, ...prev])
              } else if (payload.eventType === 'UPDATE') {
                setJobs((prev) =>
                  prev.map((job) =>
                    job.id === (payload.new as AiJob).id ? (payload.new as AiJob) : job
                  )
                )
              } else if (payload.eventType === 'DELETE') {
                setJobs((prev) =>
                  prev.filter((job) => job.id !== (payload.old as { id: string }).id)
                )
              }
            }
          )
          .subscribe()

        channelRef.current = channel
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : 'Failed to initialize Supabase')
        setIsLoading(false)
      }
    }

    initialize()

    return () => {
      isMounted = false
      if (channelRef.current && supabaseRef.current) {
        supabaseRef.current.removeChannel(channelRef.current)
        channelRef.current = null
      }
    }
  }, [userId, fetchJobs])

  return { jobs, isLoading, error, refetch }
}
