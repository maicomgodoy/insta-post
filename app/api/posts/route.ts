import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { withAuth } from '@/middleware/api-auth'
import { validateBody, validateQuery, validationErrorResponse } from '@/middleware/api-validation'

// Schemas de validação
const createPostSchema = z.object({
  imageUrl: z.string().url('URL da imagem inválida'),
  caption: z.string().min(1, 'Legenda é obrigatória').max(2200, 'Legenda muito longa'),
  socialAccountId: z.string().uuid('ID da conta social inválido').optional(),
})

const listPostsQuerySchema = z.object({
  status: z.enum(['draft', 'scheduled', 'published', 'failed']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
  orderBy: z.enum(['createdAt', 'updatedAt', 'scheduledFor']).default('createdAt'),
  order: z.enum(['asc', 'desc']).default('desc'),
})

/**
 * POST /api/posts
 * Cria um novo post (requer autenticação)
 */
export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const validation = await validateBody(request, createPostSchema)
    
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }
    
    const { imageUrl, caption, socialAccountId } = validation.data
    
    // Se socialAccountId fornecido, verificar se pertence ao usuário
    if (socialAccountId) {
      const socialAccount = await prisma.socialAccount.findFirst({
        where: {
          id: socialAccountId,
          userId: user.id,
          isActive: true,
        },
      })
      
      if (!socialAccount) {
        return NextResponse.json(
          { error: 'Conta social não encontrada ou não pertence ao usuário', code: 'SOCIAL_ACCOUNT_NOT_FOUND' },
          { status: 404 }
        )
      }
    }
    
    const post = await prisma.post.create({
      data: {
        userId: user.id,
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
    
    logger.info('Post created', { postId: post.id, userId: user.id })
    
    return NextResponse.json(
      {
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
      },
      { status: 201 }
    )
  } catch (error) {
    logger.error('Failed to create post', { userId: user.id, error: (error as Error).message })
    return NextResponse.json(
      { error: 'Failed to create post', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
})

/**
 * GET /api/posts
 * Lista posts do usuário autenticado
 */
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const validation = validateQuery(request, listPostsQuerySchema)
    
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }
    
    const { status } = validation.data
    const limit = validation.data.limit ?? 20
    const offset = validation.data.offset ?? 0
    const orderBy = validation.data.orderBy ?? 'createdAt'
    const order = validation.data.order ?? 'desc'
    
    const where = {
      userId: user.id,
      ...(status && { status }),
    }
    
    const orderByField = orderBy as 'createdAt' | 'updatedAt' | 'scheduledFor'
    
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
        orderBy: { [orderByField]: order },
        take: limit,
        skip: offset,
      }),
      prisma.post.count({ where }),
    ])
    
    return NextResponse.json({
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
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })
  } catch (error) {
    logger.error('Failed to list posts', { userId: user.id, error: (error as Error).message })
    return NextResponse.json(
      { error: 'Failed to list posts', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
})
