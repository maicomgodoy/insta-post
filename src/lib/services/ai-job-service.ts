import { prisma } from '../prisma'
import { logger } from '../logger'

/**
 * Status possíveis de um AI Job
 */
export type AiJobStatus = 
  | 'PENDING'     // Job criado, aguardando processamento
  | 'STARTED'     // Trigger.dev iniciou o processamento
  | 'PROCESSING'  // FAL.AI está processando (em fila ou gerando)
  | 'COMPLETED'   // Sucesso, resultado disponível
  | 'FAILED'      // Erro durante processamento
  | 'CANCELLED'   // Cancelado pelo usuário

/**
 * Tipos de job suportados
 */
export type AiJobType = 
  | 'image_generation'  // Text-to-image
  | 'image_edit'        // Image-to-image
  | 'video_generation'  // Text-to-video (futuro)

/**
 * Interface para criar um novo job
 */
export interface CreateAiJobInput {
  userId: string
  jobType: AiJobType
  model: string
  input: Record<string, unknown>
  metadata?: Record<string, unknown>
}

/**
 * Interface para atualizar status do job
 */
export interface UpdateAiJobStatusInput {
  status: AiJobStatus
  progress?: number
  progressMessage?: string
  output?: Record<string, unknown>
  error?: Record<string, unknown>
  metadata?: Record<string, unknown>
  triggerRunId?: string
}

/**
 * Interface do AiJob (compatível com Prisma)
 */
export interface AiJob {
  id: string
  userId: string
  triggerRunId: string | null
  jobType: string
  model: string
  status: string
  progress: number | null
  progressMessage: string | null
  input: unknown
  output: unknown | null
  error: unknown | null
  metadata: unknown | null
  startedAt: Date | null
  completedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Serviço para gerenciamento de AI Jobs
 * Responsável por criar, atualizar e consultar jobs de IA
 */
export class AiJobService {
  /**
   * Cria um novo AI Job com status PENDING
   */
  async createJob(input: CreateAiJobInput): Promise<AiJob> {
    const job = await prisma.aiJob.create({
      data: {
        userId: input.userId,
        jobType: input.jobType,
        model: input.model,
        input: input.input as any, // Prisma Json type accepts any serializable value
        metadata: (input.metadata || {}) as any, // Prisma Json type accepts any serializable value
        status: 'PENDING',
        progress: 0,
      },
    })

    logger.info('AI Job created', {
      jobId: job.id,
      userId: input.userId,
      jobType: input.jobType,
      model: input.model,
    })

    return job as AiJob
  }

  /**
   * Atualiza o status de um job
   */
  async updateJobStatus(
    jobId: string,
    update: UpdateAiJobStatusInput
  ): Promise<AiJob> {
    const now = new Date()
    
    // Determinar timestamps baseado no status
    const timestamps: { startedAt?: Date; completedAt?: Date } = {}
    
    if (update.status === 'STARTED') {
      timestamps.startedAt = now
    }
    
    if (update.status === 'COMPLETED' || update.status === 'FAILED' || update.status === 'CANCELLED') {
      timestamps.completedAt = now
    }

    logger.info('AI Job Service: Updating job', {
      jobId,
      status: update.status,
      progress: update.progress,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    })

    try {
      const job = await prisma.aiJob.update({
        where: { id: jobId },
        data: {
          status: update.status,
          ...(update.progress !== undefined && { progress: update.progress }),
          ...(update.progressMessage !== undefined && { progressMessage: update.progressMessage }),
          ...(update.output !== undefined && { output: update.output as any }), // Prisma Json type
          ...(update.error !== undefined && { error: update.error as any }), // Prisma Json type
          ...(update.metadata !== undefined && { metadata: update.metadata as any }), // Prisma Json type
          ...(update.triggerRunId !== undefined && { triggerRunId: update.triggerRunId }),
          ...timestamps,
        },
      })

      logger.info('AI Job status updated successfully', {
        jobId,
        status: update.status,
        progress: update.progress,
        updatedStatus: job.status,
        updatedAt: job.updatedAt,
      })

      return job as AiJob
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorStack = error instanceof Error ? error.stack : undefined
      
      logger.error('AI Job Service: Failed to update job', {
        jobId,
        status: update.status,
        error: errorMessage,
        stack: errorStack,
        errorType: error?.constructor?.name,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
      })
      
      throw error
    }
  }

  /**
   * Marca job como iniciado
   */
  async startJob(jobId: string, triggerRunId?: string): Promise<AiJob> {
    return this.updateJobStatus(jobId, {
      status: 'STARTED',
      progress: 10,
      progressMessage: 'Iniciando processamento...',
      triggerRunId,
    })
  }

  /**
   * Atualiza progresso do job durante processamento
   */
  async updateProgress(
    jobId: string,
    progress: number,
    message?: string
  ): Promise<AiJob> {
    return this.updateJobStatus(jobId, {
      status: 'PROCESSING',
      progress: Math.min(90, Math.max(0, progress)), // Limitar entre 0 e 90
      progressMessage: message,
    })
  }

  /**
   * Marca job como concluído com sucesso
   */
  async completeJob(
    jobId: string,
    output: Record<string, unknown>,
    metadata?: Record<string, unknown>
  ): Promise<AiJob> {
    return this.updateJobStatus(jobId, {
      status: 'COMPLETED',
      progress: 100,
      progressMessage: 'Concluído com sucesso!',
      output,
      metadata,
    })
  }

  /**
   * Marca job como falho
   */
  async failJob(
    jobId: string,
    error: { message: string; code?: string; details?: unknown }
  ): Promise<AiJob> {
    return this.updateJobStatus(jobId, {
      status: 'FAILED',
      progressMessage: `Erro: ${error.message}`,
      error,
    })
  }

  /**
   * Cancela um job pendente ou em processamento
   */
  async cancelJob(jobId: string): Promise<AiJob> {
    return this.updateJobStatus(jobId, {
      status: 'CANCELLED',
      progressMessage: 'Cancelado pelo usuário',
    })
  }

  /**
   * Busca um job pelo ID
   */
  async getJob(jobId: string): Promise<AiJob | null> {
    const job = await prisma.aiJob.findUnique({
      where: { id: jobId },
    })

    return job as AiJob | null
  }

  /**
   * Busca um job pelo ID do Trigger.dev
   */
  async getJobByTriggerRunId(triggerRunId: string): Promise<AiJob | null> {
    const job = await prisma.aiJob.findFirst({
      where: { triggerRunId },
    })

    return job as AiJob | null
  }

  /**
   * Lista jobs de um usuário
   */
  async getUserJobs(
    userId: string,
    options?: {
      limit?: number
      offset?: number
      status?: AiJobStatus
      jobType?: AiJobType
    }
  ): Promise<{ jobs: AiJob[]; total: number }> {
    const { limit = 20, offset = 0, status, jobType } = options || {}

    const where = {
      userId,
      ...(status && { status }),
      ...(jobType && { jobType }),
    }

    const [jobs, total] = await Promise.all([
      prisma.aiJob.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.aiJob.count({ where }),
    ])

    return {
      jobs: jobs as AiJob[],
      total,
    }
  }

  /**
   * Lista jobs pendentes ou em processamento (para monitoramento)
   */
  async getActiveJobs(limit: number = 100): Promise<AiJob[]> {
    const jobs = await prisma.aiJob.findMany({
      where: {
        status: {
          in: ['PENDING', 'STARTED', 'PROCESSING'],
        },
      },
      orderBy: { createdAt: 'asc' },
      take: limit,
    })

    return jobs as AiJob[]
  }

  /**
   * Remove jobs antigos (limpeza)
   */
  async cleanupOldJobs(olderThanDays: number = 30): Promise<number> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    const result = await prisma.aiJob.deleteMany({
      where: {
        createdAt: { lt: cutoffDate },
        status: { in: ['COMPLETED', 'FAILED', 'CANCELLED'] },
      },
    })

    if (result.count > 0) {
      logger.info('AI Jobs cleaned up', {
        deletedCount: result.count,
        olderThanDays,
      })
    }

    return result.count
  }
}

// Exportar instância singleton
export const aiJobService = new AiJobService()
