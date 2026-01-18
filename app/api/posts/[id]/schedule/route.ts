import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { withAuthAndParams } from '@/middleware/api-auth'
import { validateBody, validateParams, validationErrorResponse } from '@/middleware/api-validation'

const postIdSchema = z.object({
  id: z.string().uuid('ID do post inválido'),
})

const scheduleSchema = z.object({
  scheduledFor: z.string().datetime('Data/hora inválida'),
  socialAccountId: z.string().uuid('ID da conta social inválido'),
})

/**
 * POST /api/posts/:id/schedule
 * Agenda um post para publicação (requer autenticação)
 */
export const POST = withAuthAndParams<{ id: string }>(async (request, user, params) => {
  try {
    const paramsValidation = validateParams(params, postIdSchema)
    if (!paramsValidation.success) {
      return validationErrorResponse(paramsValidation.error)
    }
    
    const { id } = paramsValidation.data
    
    const bodyValidation = await validateBody(request, scheduleSchema)
    if (!bodyValidation.success) {
      return validationErrorResponse(bodyValidation.error)
    }
    
    const { scheduledFor, socialAccountId } = bodyValidation.data
    
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
    
    // Verificar se o post já foi publicado
    if (existingPost.status === 'published') {
      return NextResponse.json(
        { error: 'Post já foi publicado', code: 'POST_ALREADY_PUBLISHED' },
        { status: 400 }
      )
    }
    
    // Verificar se a conta social existe e pertence ao usuário
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
    
    // Verificar se a data é no futuro
    const scheduleDate = new Date(scheduledFor)
    if (scheduleDate <= new Date()) {
      return NextResponse.json(
        { error: 'A data de agendamento deve ser no futuro', code: 'INVALID_SCHEDULE_DATE' },
        { status: 400 }
      )
    }
    
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
    
    logger.info('Post scheduled', { postId: post.id, userId: user.id, scheduledFor })
    
    return NextResponse.json({
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
  } catch (error) {
    logger.error('Failed to schedule post', { error: (error as Error).message })
    return NextResponse.json(
      { error: 'Failed to schedule post', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
})
