import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { instagramService } from '@/lib/services/instagram-service'
import { withAuthAndParams } from '@/middleware/api-auth'
import { validateBody, validateParams, validationErrorResponse } from '@/middleware/api-validation'

const postIdSchema = z.object({
  id: z.string().uuid('ID do post inválido'),
})

const publishSchema = z.object({
  socialAccountId: z.string().uuid('ID da conta social inválido'),
})

/**
 * POST /api/posts/:id/publish
 * Publica um post imediatamente no Instagram (requer autenticação)
 */
export const POST = withAuthAndParams<{ id: string }>(async (request, user, params) => {
  try {
    const paramsValidation = validateParams(params, postIdSchema)
    if (!paramsValidation.success) {
      return validationErrorResponse(paramsValidation.error)
    }
    
    const { id } = paramsValidation.data
    
    const bodyValidation = await validateBody(request, publishSchema)
    if (!bodyValidation.success) {
      return validationErrorResponse(bodyValidation.error)
    }
    
    const { socialAccountId } = bodyValidation.data
    
    // Verificar se o post existe e pertence ao usuário
    const post = await prisma.post.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })
    
    if (!post) {
      return NextResponse.json(
        { error: 'Post não encontrado', code: 'POST_NOT_FOUND' },
        { status: 404 }
      )
    }
    
    // Verificar se o post já foi publicado
    if (post.status === 'published') {
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
        platform: 'instagram',
      },
    })
    
    if (!socialAccount) {
      return NextResponse.json(
        { error: 'Conta social não encontrada ou não pertence ao usuário', code: 'SOCIAL_ACCOUNT_NOT_FOUND' },
        { status: 404 }
      )
    }
    
    // Verificar se o token não expirou
    if (socialAccount.tokenExpiresAt && socialAccount.tokenExpiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Token de acesso expirado. Reconecte a conta do Instagram', code: 'TOKEN_EXPIRED' },
        { status: 400 }
      )
    }
    
    try {
      // Publicar no Instagram
      const instagramPostId = await instagramService.publishPost(
        socialAccount.accessToken,
        socialAccount.accountId,
        post.imageUrl,
        post.caption
      )
      
      // Atualizar post no banco
      const updatedPost = await prisma.post.update({
        where: { id },
        data: {
          status: 'published',
          publishedAt: new Date(),
          instagramPostId,
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
      
      logger.info('Post published to Instagram', {
        postId: post.id,
        userId: user.id,
        instagramPostId,
        socialAccountId,
      })
      
      return NextResponse.json({
        message: 'Post publicado com sucesso no Instagram',
        post: {
          id: updatedPost.id,
          imageUrl: updatedPost.imageUrl,
          caption: updatedPost.caption,
          status: updatedPost.status,
          publishedAt: updatedPost.publishedAt,
          instagramPostId: updatedPost.instagramPostId,
          socialAccount: updatedPost.socialAccount,
          createdAt: updatedPost.createdAt,
          updatedAt: updatedPost.updatedAt,
        },
      })
    } catch (publishError) {
      // Atualizar status do post para 'failed' em caso de erro
      await prisma.post.update({
        where: { id },
        data: { status: 'failed' },
      })
      
      const errorMessage = publishError instanceof Error ? publishError.message : 'Unknown error'
      logger.error('Failed to publish post to Instagram', {
        postId: post.id,
        userId: user.id,
        error: errorMessage,
      })
      
      return NextResponse.json(
        { error: errorMessage, code: 'INSTAGRAM_PUBLISH_ERROR' },
        { status: 400 }
      )
    }
  } catch (error) {
    logger.error('Failed to publish post', { error: (error as Error).message })
    return NextResponse.json(
      { error: 'Failed to publish post', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
})
