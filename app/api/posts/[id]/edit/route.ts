import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { withAuthAndParams } from '@/middleware/api-auth'
import { validateBody, validateParams, validationErrorResponse } from '@/middleware/api-validation'

const postIdSchema = z.object({
  id: z.string().uuid('ID do post inválido'),
})

const editPostSchema = z.object({
  editType: z.enum(['regenerate_image', 'regenerate_caption', 'regenerate_all', 'edit_caption_only']),
  instructions: z.string().optional(),
  keepImage: z.boolean().default(true),
})

/**
 * POST /api/posts/:id/edit
 * Edita um post via IA (requer autenticação)
 */
export const POST = withAuthAndParams<{ id: string }>(async (request, user, params) => {
  try {
    const paramsValidation = validateParams(params, postIdSchema)
    if (!paramsValidation.success) {
      return validationErrorResponse(paramsValidation.error)
    }

    const { id } = paramsValidation.data

    const bodyValidation = await validateBody(request, editPostSchema)
    if (!bodyValidation.success) {
      return validationErrorResponse(bodyValidation.error)
    }

    const { editType, instructions, keepImage } = bodyValidation.data

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

    // Não permitir editar posts já publicados
    if (post.status === 'published') {
      return NextResponse.json(
        { error: 'Não é possível editar um post já publicado', code: 'POST_ALREADY_PUBLISHED' },
        { status: 400 }
      )
    }

    // TODO: Validar créditos disponíveis antes de processar
    // TODO: Debitar créditos após validação
    // TODO: Chamar job Trigger.dev para processamento assíncrono

    // Por enquanto, criar mock de edição (síncrono)
    // Em produção, isso seria feito por um job Trigger.dev

    let updatedCaption = post.caption
    let updatedHashtags = post.hashtags
    let updatedImageUrl = post.imageUrl

    // Se keepImage é true e o tipo de edição envolve imagem, salvar imagem atual
    if (keepImage && (editType === 'regenerate_image' || editType === 'regenerate_all')) {
      await prisma.rejectedImage.create({
        data: {
          userId: user.id,
          postId: post.id,
          imageUrl: post.imageUrl,
          caption: post.caption,
          hashtags: post.hashtags,
        },
      })
    }

    // Mock: Simular edição baseada no tipo
    switch (editType) {
      case 'regenerate_image':
        // Mock: Gerar nova imagem
        updatedImageUrl = `https://via.placeholder.com/1080x1080?text=Edited+Image+v${post.version + 1}`
        break

      case 'regenerate_caption':
        // Mock: Gerar nova legenda e hashtags
        updatedCaption = `${post.caption} [Editado pela IA${instructions ? `: ${instructions}` : ''}]`
        updatedHashtags = `${post.hashtags} #edited`
        break

      case 'regenerate_all':
        // Mock: Gerar tudo novo
        updatedImageUrl = `https://via.placeholder.com/1080x1080?text=New+Image+v${post.version + 1}`
        updatedCaption = `${post.caption} [Regenerado pela IA${instructions ? `: ${instructions}` : ''}]`
        updatedHashtags = `${post.hashtags} #regenerated`
        break

      case 'edit_caption_only':
        // Mock: Apenas ajustar legenda
        updatedCaption = `${post.caption} [Ajustado${instructions ? `: ${instructions}` : ''}]`
        break
    }

    // Atualizar histórico de edições
    const editHistory = (post.editHistory as unknown[] || [])
    editHistory.push({
      version: post.version,
      editType,
      instructions: instructions || null,
      editedAt: new Date().toISOString(),
      previousCaption: post.caption,
      previousHashtags: post.hashtags,
      previousImageUrl: post.imageUrl,
    })

    // Atualizar post
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        caption: updatedCaption,
        hashtags: updatedHashtags,
        imageUrl: updatedImageUrl,
        version: post.version + 1,
        editHistory,
        status: 'draft', // Volta para draft após edição
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

    logger.info('Post edited via AI (mock)', {
      postId: post.id,
      userId: user.id,
      editType,
      newVersion: updatedPost.version,
    })

    return NextResponse.json({
      message: 'Post editado com sucesso',
      post: {
        id: updatedPost.id,
        imageUrl: updatedPost.imageUrl,
        caption: updatedPost.caption,
        hashtags: updatedPost.hashtags,
        status: updatedPost.status,
        version: updatedPost.version,
        scheduledFor: updatedPost.scheduledFor,
        publishedAt: updatedPost.publishedAt,
        socialAccount: updatedPost.socialAccount,
        createdAt: updatedPost.createdAt,
        updatedAt: updatedPost.updatedAt,
      },
    })
  } catch (error) {
    logger.error('Failed to edit post', { error: (error as Error).message })
    return NextResponse.json(
      { error: 'Failed to edit post', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
})
