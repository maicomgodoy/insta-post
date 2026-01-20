import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { withAuthAndParams } from '@/middleware/api-auth'
import { validateParams, validationErrorResponse } from '@/middleware/api-validation'

const imageIdSchema = z.object({
  id: z.string().uuid('ID da imagem inválido'),
})

/**
 * POST /api/rejected-images/:id/reuse
 * Reutiliza uma imagem rejeitada para criar um novo post (requer autenticação)
 */
export const POST = withAuthAndParams<{ id: string }>(async (request, user, params) => {
  try {
    const paramsValidation = validateParams(params, imageIdSchema)
    if (!paramsValidation.success) {
      return validationErrorResponse(paramsValidation.error)
    }

    const { id } = paramsValidation.data

    // Verificar se a imagem existe e pertence ao usuário
    const image = await prisma.rejectedImage.findFirst({
      where: {
        id,
        userId: user.id,
      },
    })

    if (!image) {
      return NextResponse.json(
        { error: 'Imagem não encontrada', code: 'IMAGE_NOT_FOUND' },
        { status: 404 }
      )
    }

    // Criar novo post usando a imagem rejeitada
    const newPost = await prisma.post.create({
      data: {
        userId: user.id,
        imageUrl: image.imageUrl,
        caption: image.caption || '',
        hashtags: image.hashtags || '',
        status: 'draft',
        version: 1,
        editHistory: [{
          action: 'reused_from_gallery',
          sourceImageId: image.id,
          sourcePostId: image.postId,
          createdAt: new Date().toISOString(),
        }],
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

    logger.info('Rejected image reused for new post', {
      imageId: id,
      newPostId: newPost.id,
      userId: user.id,
    })

    return NextResponse.json(
      {
        message: 'Imagem reutilizada com sucesso',
        post: {
          id: newPost.id,
          imageUrl: newPost.imageUrl,
          caption: newPost.caption,
          hashtags: newPost.hashtags,
          status: newPost.status,
          version: newPost.version,
          scheduledFor: newPost.scheduledFor,
          publishedAt: newPost.publishedAt,
          socialAccount: newPost.socialAccount,
          createdAt: newPost.createdAt,
          updatedAt: newPost.updatedAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    logger.error('Failed to reuse rejected image', { error: (error as Error).message })
    return NextResponse.json(
      { error: 'Failed to reuse rejected image', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
})
