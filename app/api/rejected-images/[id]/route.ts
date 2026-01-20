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
 * GET /api/rejected-images/:id
 * Busca uma imagem rejeitada específica (requer autenticação)
 */
export const GET = withAuthAndParams<{ id: string }>(async (request, user, params) => {
  try {
    const paramsValidation = validateParams(params, imageIdSchema)
    if (!paramsValidation.success) {
      return validationErrorResponse(paramsValidation.error)
    }

    const { id } = paramsValidation.data

    const image = await prisma.rejectedImage.findFirst({
      where: {
        id,
        userId: user.id,
      },
      include: {
        post: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    })

    if (!image) {
      return NextResponse.json(
        { error: 'Imagem não encontrada', code: 'IMAGE_NOT_FOUND' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      image: {
        id: image.id,
        imageUrl: image.imageUrl,
        caption: image.caption,
        hashtags: image.hashtags,
        rejectedAt: image.rejectedAt,
        createdAt: image.createdAt,
        originalPost: image.post
          ? {
              id: image.post.id,
              status: image.post.status,
            }
          : null,
      },
    })
  } catch (error) {
    logger.error('Failed to get rejected image', { error: (error as Error).message })
    return NextResponse.json(
      { error: 'Failed to get rejected image', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
})

/**
 * DELETE /api/rejected-images/:id
 * Remove uma imagem rejeitada da galeria (requer autenticação)
 */
export const DELETE = withAuthAndParams<{ id: string }>(async (request, user, params) => {
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

    // Deletar imagem
    await prisma.rejectedImage.delete({
      where: { id },
    })

    // TODO: Deletar imagem do Cloudflare R2

    logger.info('Rejected image deleted', { imageId: id, userId: user.id })

    return NextResponse.json({
      message: 'Imagem removida com sucesso',
    })
  } catch (error) {
    logger.error('Failed to delete rejected image', { error: (error as Error).message })
    return NextResponse.json(
      { error: 'Failed to delete rejected image', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
})
