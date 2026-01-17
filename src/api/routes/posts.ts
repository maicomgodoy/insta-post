import { Router, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { validateBody, validateParams, validateQuery } from '../middleware/validation'
import { authenticate, AuthenticatedRequest } from '../middleware/auth'
import { logger } from '../lib/logger'
import { ApiError } from '../middleware/error-handler'

const router = Router()

// ============================================
// SCHEMAS DE VALIDAÇÃO
// ============================================

const createPostSchema = z.object({
  imageUrl: z.string().url('URL da imagem inválida'),
  caption: z.string().min(1, 'Legenda é obrigatória').max(2200, 'Legenda muito longa'),
  socialAccountId: z.string().uuid('ID da conta social inválido').optional(),
})

const updatePostSchema = z.object({
  imageUrl: z.string().url('URL da imagem inválida').optional(),
  caption: z.string().min(1, 'Legenda é obrigatória').max(2200, 'Legenda muito longa').optional(),
  status: z.enum(['draft', 'scheduled', 'published', 'failed']).optional(),
  scheduledFor: z.string().datetime().optional().nullable(),
  socialAccountId: z.string().uuid('ID da conta social inválido').optional().nullable(),
})

const postIdParamSchema = z.object({
  id: z.string().uuid('ID do post inválido'),
})

const listPostsQuerySchema = z.object({
  status: z.enum(['draft', 'scheduled', 'published', 'failed']).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
  orderBy: z.enum(['createdAt', 'updatedAt', 'scheduledFor']).optional().default('createdAt'),
  order: z.enum(['asc', 'desc']).optional().default('desc'),
})

// ============================================
// ENDPOINTS
// ============================================

/**
 * POST /api/posts
 * Cria um novo post
 */
router.post(
  '/',
  authenticate,
  validateBody(createPostSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id
    const { imageUrl, caption, socialAccountId } = req.body

    // Se socialAccountId fornecido, verificar se pertence ao usuário
    if (socialAccountId) {
      const socialAccount = await prisma.socialAccount.findFirst({
        where: {
          id: socialAccountId,
          userId,
          isActive: true,
        },
      })

      if (!socialAccount) {
        const error: ApiError = new Error('Conta social não encontrada ou não pertence ao usuário')
        error.statusCode = 404
        error.code = 'SOCIAL_ACCOUNT_NOT_FOUND'
        throw error
      }
    }

    const post = await prisma.post.create({
      data: {
        userId,
        imageUrl,
        caption,
        socialAccountId: socialAccountId || null,
        status: 'draft',
      },
      include: {
        socialAccount: {
          select: {
            id: true,
            accountUsername: true,
            platform: true,
          },
        },
      },
    })

    logger.info('Post created', { postId: post.id, userId })

    res.status(201).json({
      message: 'Post criado com sucesso',
      post: {
        id: post.id,
        imageUrl: post.imageUrl,
        caption: post.caption,
        status: post.status,
        scheduledFor: post.scheduledFor,
        publishedAt: post.publishedAt,
        socialAccount: post.socialAccount,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      },
    })
  }
)

/**
 * GET /api/posts
 * Lista posts do usuário autenticado
 */
router.get(
  '/',
  authenticate,
  validateQuery(listPostsQuerySchema),
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id
    const { status, limit, offset, orderBy, order } = req.query as z.infer<typeof listPostsQuerySchema>

    const where = {
      userId,
      ...(status && { status }),
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        include: {
          socialAccount: {
            select: {
              id: true,
              accountUsername: true,
              platform: true,
            },
          },
        },
        orderBy: { [orderBy || 'createdAt']: order || 'desc' },
        take: limit || 20,
        skip: offset || 0,
      }),
      prisma.post.count({ where }),
    ])

    res.json({
      posts: posts.map((post) => ({
        id: post.id,
        imageUrl: post.imageUrl,
        caption: post.caption,
        status: post.status,
        scheduledFor: post.scheduledFor,
        publishedAt: post.publishedAt,
        instagramPostId: post.instagramPostId,
        socialAccount: post.socialAccount,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      })),
      pagination: {
        total,
        limit: limit || 20,
        offset: offset || 0,
        hasMore: (offset || 0) + (limit || 20) < total,
      },
    })
  }
)

/**
 * GET /api/posts/:id
 * Busca um post por ID
 */
router.get(
  '/:id',
  authenticate,
  validateParams(postIdParamSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id
    const { id } = req.params

    const post = await prisma.post.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        socialAccount: {
          select: {
            id: true,
            accountUsername: true,
            platform: true,
          },
        },
      },
    })

    if (!post) {
      const error: ApiError = new Error('Post não encontrado')
      error.statusCode = 404
      error.code = 'POST_NOT_FOUND'
      throw error
    }

    res.json({
      post: {
        id: post.id,
        imageUrl: post.imageUrl,
        caption: post.caption,
        status: post.status,
        scheduledFor: post.scheduledFor,
        publishedAt: post.publishedAt,
        instagramPostId: post.instagramPostId,
        socialAccount: post.socialAccount,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      },
    })
  }
)

/**
 * PUT /api/posts/:id
 * Atualiza um post
 */
router.put(
  '/:id',
  authenticate,
  validateParams(postIdParamSchema),
  validateBody(updatePostSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id
    const { id } = req.params
    const { imageUrl, caption, status, scheduledFor, socialAccountId } = req.body

    // Verificar se o post existe e pertence ao usuário
    const existingPost = await prisma.post.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!existingPost) {
      const error: ApiError = new Error('Post não encontrado')
      error.statusCode = 404
      error.code = 'POST_NOT_FOUND'
      throw error
    }

    // Não permitir editar posts já publicados
    if (existingPost.status === 'published') {
      const error: ApiError = new Error('Não é possível editar um post já publicado')
      error.statusCode = 400
      error.code = 'POST_ALREADY_PUBLISHED'
      throw error
    }

    // Se socialAccountId fornecido, verificar se pertence ao usuário
    if (socialAccountId) {
      const socialAccount = await prisma.socialAccount.findFirst({
        where: {
          id: socialAccountId,
          userId,
          isActive: true,
        },
      })

      if (!socialAccount) {
        const error: ApiError = new Error('Conta social não encontrada ou não pertence ao usuário')
        error.statusCode = 404
        error.code = 'SOCIAL_ACCOUNT_NOT_FOUND'
        throw error
      }
    }

    // Preparar dados para atualização
    const updateData: Record<string, unknown> = {}
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (caption !== undefined) updateData.caption = caption
    if (status !== undefined) updateData.status = status
    if (scheduledFor !== undefined) updateData.scheduledFor = scheduledFor ? new Date(scheduledFor) : null
    if (socialAccountId !== undefined) updateData.socialAccountId = socialAccountId

    const post = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        socialAccount: {
          select: {
            id: true,
            accountUsername: true,
            platform: true,
          },
        },
      },
    })

    logger.info('Post updated', { postId: post.id, userId })

    res.json({
      message: 'Post atualizado com sucesso',
      post: {
        id: post.id,
        imageUrl: post.imageUrl,
        caption: post.caption,
        status: post.status,
        scheduledFor: post.scheduledFor,
        publishedAt: post.publishedAt,
        socialAccount: post.socialAccount,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      },
    })
  }
)

/**
 * DELETE /api/posts/:id
 * Deleta um post
 */
router.delete(
  '/:id',
  authenticate,
  validateParams(postIdParamSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id
    const { id } = req.params

    // Verificar se o post existe e pertence ao usuário
    const existingPost = await prisma.post.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!existingPost) {
      const error: ApiError = new Error('Post não encontrado')
      error.statusCode = 404
      error.code = 'POST_NOT_FOUND'
      throw error
    }

    // Não permitir deletar posts já publicados
    if (existingPost.status === 'published') {
      const error: ApiError = new Error('Não é possível deletar um post já publicado')
      error.statusCode = 400
      error.code = 'POST_ALREADY_PUBLISHED'
      throw error
    }

    await prisma.post.delete({
      where: { id },
    })

    logger.info('Post deleted', { postId: id, userId })

    res.json({
      message: 'Post deletado com sucesso',
    })
  }
)

/**
 * POST /api/posts/:id/schedule
 * Agenda um post para publicação
 */
router.post(
  '/:id/schedule',
  authenticate,
  validateParams(postIdParamSchema),
  validateBody(z.object({
    scheduledFor: z.string().datetime('Data/hora inválida'),
    socialAccountId: z.string().uuid('ID da conta social inválido'),
  })),
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id
    const { id } = req.params
    const { scheduledFor, socialAccountId } = req.body

    // Verificar se o post existe e pertence ao usuário
    const existingPost = await prisma.post.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!existingPost) {
      const error: ApiError = new Error('Post não encontrado')
      error.statusCode = 404
      error.code = 'POST_NOT_FOUND'
      throw error
    }

    // Verificar se o post já foi publicado
    if (existingPost.status === 'published') {
      const error: ApiError = new Error('Post já foi publicado')
      error.statusCode = 400
      error.code = 'POST_ALREADY_PUBLISHED'
      throw error
    }

    // Verificar se a conta social existe e pertence ao usuário
    const socialAccount = await prisma.socialAccount.findFirst({
      where: {
        id: socialAccountId,
        userId,
        isActive: true,
      },
    })

    if (!socialAccount) {
      const error: ApiError = new Error('Conta social não encontrada ou não pertence ao usuário')
      error.statusCode = 404
      error.code = 'SOCIAL_ACCOUNT_NOT_FOUND'
      throw error
    }

    // Verificar se a data é no futuro
    const scheduleDate = new Date(scheduledFor)
    if (scheduleDate <= new Date()) {
      const error: ApiError = new Error('A data de agendamento deve ser no futuro')
      error.statusCode = 400
      error.code = 'INVALID_SCHEDULE_DATE'
      throw error
    }

    // TODO: Verificar limite de agendamentos por plano

    const post = await prisma.post.update({
      where: { id },
      data: {
        status: 'scheduled',
        scheduledFor: scheduleDate,
        socialAccountId,
      },
      include: {
        socialAccount: {
          select: {
            id: true,
            accountUsername: true,
            platform: true,
          },
        },
      },
    })

    logger.info('Post scheduled', { postId: post.id, userId, scheduledFor })

    res.json({
      message: 'Post agendado com sucesso',
      post: {
        id: post.id,
        imageUrl: post.imageUrl,
        caption: post.caption,
        status: post.status,
        scheduledFor: post.scheduledFor,
        socialAccount: post.socialAccount,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      },
    })
  }
)

/**
 * POST /api/posts/:id/unschedule
 * Cancela o agendamento de um post
 */
router.post(
  '/:id/unschedule',
  authenticate,
  validateParams(postIdParamSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id
    const { id } = req.params

    // Verificar se o post existe e pertence ao usuário
    const existingPost = await prisma.post.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!existingPost) {
      const error: ApiError = new Error('Post não encontrado')
      error.statusCode = 404
      error.code = 'POST_NOT_FOUND'
      throw error
    }

    // Verificar se o post está agendado
    if (existingPost.status !== 'scheduled') {
      const error: ApiError = new Error('Post não está agendado')
      error.statusCode = 400
      error.code = 'POST_NOT_SCHEDULED'
      throw error
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        status: 'draft',
        scheduledFor: null,
      },
      include: {
        socialAccount: {
          select: {
            id: true,
            accountUsername: true,
            platform: true,
          },
        },
      },
    })

    logger.info('Post unscheduled', { postId: post.id, userId })

    res.json({
      message: 'Agendamento cancelado com sucesso',
      post: {
        id: post.id,
        imageUrl: post.imageUrl,
        caption: post.caption,
        status: post.status,
        scheduledFor: post.scheduledFor,
        socialAccount: post.socialAccount,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      },
    })
  }
)

export { router as postRoutes }
