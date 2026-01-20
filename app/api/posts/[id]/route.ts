import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { withAuthAndParams } from '@/middleware/api-auth'
import { validateBody, validateParams, validationErrorResponse } from '@/middleware/api-validation'

const postIdSchema = z.object({
  id: z.string().uuid('ID do post inválido'),
})

const updatePostSchema = z.object({
  imageUrl: z.string().url('URL da imagem inválida').optional(),
  caption: z.string().min(1, 'Legenda é obrigatória').max(2200, 'Legenda muito longa').optional(),
  hashtags: z.string().max(1000, 'Hashtags muito longas').optional(),
  status: z.enum(['draft', 'editing', 'ready', 'scheduled', 'published', 'failed']).optional(),
  scheduledFor: z.string().datetime().optional().nullable(),
  socialAccountId: z.string().uuid('ID da conta social inválido').optional().nullable(),
})

/**
 * GET /api/posts/:id
 * Busca um post por ID (requer autenticação)
 */
export const GET = withAuthAndParams<{ id: string }>(async (request, user, params) => {
  try {
    const paramsValidation = validateParams(params, postIdSchema)
    if (!paramsValidation.success) {
      return validationErrorResponse(paramsValidation.error)
    }
    
    const { id } = paramsValidation.data
    
    const post = await prisma.post.findFirst({
      where: {
        id,
        userId: user.id,
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
      return NextResponse.json(
        { error: 'Post não encontrado', code: 'POST_NOT_FOUND' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      post: {
        id: post.id,
        imageUrl: post.imageUrl,
        caption: post.caption,
        hashtags: post.hashtags,
        status: post.status,
        version: post.version,
        parentPostId: post.parentPostId,
        scheduledFor: post.scheduledFor,
        publishedAt: post.publishedAt,
        instagramPostId: post.instagramPostId,
        socialAccount: post.socialAccount,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      },
    })
  } catch (error) {
    logger.error('Failed to get post', { error: (error as Error).message })
    return NextResponse.json(
      { error: 'Failed to get post', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
})

/**
 * PUT /api/posts/:id
 * Atualiza um post (requer autenticação)
 */
export const PUT = withAuthAndParams<{ id: string }>(async (request, user, params) => {
  try {
    const paramsValidation = validateParams(params, postIdSchema)
    if (!paramsValidation.success) {
      return validationErrorResponse(paramsValidation.error)
    }
    
    const { id } = paramsValidation.data
    
    const bodyValidation = await validateBody(request, updatePostSchema)
    if (!bodyValidation.success) {
      return validationErrorResponse(bodyValidation.error)
    }
    
    const { imageUrl, caption, hashtags, status, scheduledFor, socialAccountId } = bodyValidation.data
    
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
    
    // Não permitir editar posts já publicados
    if (existingPost.status === 'published') {
      return NextResponse.json(
        { error: 'Não é possível editar um post já publicado', code: 'POST_ALREADY_PUBLISHED' },
        { status: 400 }
      )
    }
    
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
    
    // Preparar dados para atualização
    const updateData: Record<string, unknown> = {}
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (caption !== undefined) updateData.caption = caption
    if (hashtags !== undefined) updateData.hashtags = hashtags
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
    
    logger.info('Post updated', { postId: post.id, userId: user.id })
    
    return NextResponse.json({
      message: 'Post atualizado com sucesso',
      post: {
        id: post.id,
        imageUrl: post.imageUrl,
        caption: post.caption,
        hashtags: post.hashtags,
        status: post.status,
        version: post.version,
        scheduledFor: post.scheduledFor,
        publishedAt: post.publishedAt,
        socialAccount: post.socialAccount,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      },
    })
  } catch (error) {
    logger.error('Failed to update post', { error: (error as Error).message })
    return NextResponse.json(
      { error: 'Failed to update post', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
})

/**
 * DELETE /api/posts/:id
 * Deleta um post (requer autenticação)
 */
export const DELETE = withAuthAndParams<{ id: string }>(async (request, user, params) => {
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
    
    // Não permitir deletar posts já publicados
    if (existingPost.status === 'published') {
      return NextResponse.json(
        { error: 'Não é possível deletar um post já publicado', code: 'POST_ALREADY_PUBLISHED' },
        { status: 400 }
      )
    }
    
    await prisma.post.delete({
      where: { id },
    })
    
    logger.info('Post deleted', { postId: id, userId: user.id })
    
    return NextResponse.json({
      message: 'Post deletado com sucesso',
    })
  } catch (error) {
    logger.error('Failed to delete post', { error: (error as Error).message })
    return NextResponse.json(
      { error: 'Failed to delete post', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
})
