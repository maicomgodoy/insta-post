import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { withAuthAndParams } from '@/middleware/api-auth'
import { validateBody, validateParams, validationErrorResponse } from '@/middleware/api-validation'

const postIdSchema = z.object({
  id: z.string().uuid('ID do post inválido'),
})

const regeneratePostSchema = z.object({
  instructions: z.string().optional(),
  saveCurrentAsRejected: z.boolean().default(true),
})

/**
 * POST /api/posts/:id/regenerate
 * Gera um novo post completamente diferente (requer autenticação)
 */
export const POST = withAuthAndParams<{ id: string }>(async (request, user, params) => {
  try {
    const paramsValidation = validateParams(params, postIdSchema)
    if (!paramsValidation.success) {
      return validationErrorResponse(paramsValidation.error)
    }

    const { id } = paramsValidation.data

    const bodyValidation = await validateBody(request, regeneratePostSchema)
    if (!bodyValidation.success) {
      return validationErrorResponse(bodyValidation.error)
    }

    const { instructions, saveCurrentAsRejected } = bodyValidation.data

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

    // Não permitir regenerar posts já publicados
    if (post.status === 'published') {
      return NextResponse.json(
        { error: 'Não é possível regenerar um post já publicado', code: 'POST_ALREADY_PUBLISHED' },
        { status: 400 }
      )
    }

    // TODO: Validar créditos disponíveis antes de processar
    // TODO: Debitar créditos após validação
    // TODO: Chamar job Trigger.dev para processamento assíncrono

    // Se saveCurrentAsRejected é true, salvar imagem atual na galeria
    if (saveCurrentAsRejected) {
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

    // Por enquanto, criar mock de novo post (síncrono)
    // Em produção, isso seria feito por um job Trigger.dev

    const mockImageUrl = `https://via.placeholder.com/1080x1080?text=New+Post+${Date.now()}`
    const mockCaption = instructions 
      ? `[Novo post gerado] ${instructions}`
      : '[Novo post gerado pela IA] Conteúdo totalmente novo!'
    const mockHashtags = '#newpost #ai #generated'

    // Criar novo post com referência ao post original
    const newPost = await prisma.post.create({
      data: {
        userId: user.id,
        imageUrl: mockImageUrl,
        caption: mockCaption,
        hashtags: mockHashtags,
        status: 'draft',
        parentPostId: post.id, // Referência ao post original
        version: 1,
        editHistory: [{
          action: 'regenerated',
          fromPostId: post.id,
          instructions: instructions || null,
          createdAt: new Date().toISOString(),
        }],
        socialAccountId: post.socialAccountId,
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

    logger.info('Post regenerated (mock)', {
      originalPostId: post.id,
      newPostId: newPost.id,
      userId: user.id,
      savedAsRejected: saveCurrentAsRejected,
    })

    return NextResponse.json(
      {
        message: 'Novo post gerado com sucesso',
        post: {
          id: newPost.id,
          imageUrl: newPost.imageUrl,
          caption: newPost.caption,
          hashtags: newPost.hashtags,
          status: newPost.status,
          version: newPost.version,
          parentPostId: newPost.parentPostId,
          scheduledFor: newPost.scheduledFor,
          publishedAt: newPost.publishedAt,
          socialAccount: newPost.socialAccount,
          createdAt: newPost.createdAt,
          updatedAt: newPost.updatedAt,
        },
        originalPostId: post.id,
      },
      { status: 201 }
    )
  } catch (error) {
    logger.error('Failed to regenerate post', { error: (error as Error).message })
    return NextResponse.json(
      { error: 'Failed to regenerate post', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
})
