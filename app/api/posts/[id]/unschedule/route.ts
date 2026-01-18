import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { withAuthAndParams } from '@/middleware/api-auth'
import { validateParams, validationErrorResponse } from '@/middleware/api-validation'

const postIdSchema = z.object({
  id: z.string().uuid('ID do post inválido'),
})

/**
 * POST /api/posts/:id/unschedule
 * Cancela o agendamento de um post (requer autenticação)
 */
export const POST = withAuthAndParams<{ id: string }>(async (request, user, params) => {
  try {
    const paramsValidation = validateParams(params, postIdSchema)
    if (!paramsValidation.success) {
      return validationErrorResponse(paramsValidation.error)
    }
    
    const { id } = paramsValidation.data
    
    // Verificar se o post existe e pertence ao usuário
    const existingPost = await prisma.post.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })
    
    if (!existingPost) {
      return NextResponse.json(
        { error: 'Post não encontrado', code: 'POST_NOT_FOUND' },
        { status: 404 }
      )
    }
    
    // Verificar se o post está agendado
    if (existingPost.status !== 'scheduled') {
      return NextResponse.json(
        { error: 'Post não está agendado', code: 'POST_NOT_SCHEDULED' },
        { status: 400 }
      )
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
    
    logger.info('Post unscheduled', { postId: post.id, userId: user.id })
    
    return NextResponse.json({
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
  } catch (error) {
    logger.error('Failed to unschedule post', { error: (error as Error).message })
    return NextResponse.json(
      { error: 'Failed to unschedule post', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
})
