import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { withAuth } from '@/middleware/api-auth'
import { validateBody, validationErrorResponse } from '@/middleware/api-validation'

// Schema de validação para geração de post
const generatePostSchema = z.object({
  niche: z.string().min(1, 'Nicho é obrigatório'),
  postType: z.string().min(1, 'Tipo de post é obrigatório'),
  tone: z.string().min(1, 'Tom é obrigatório'),
  themeOrIdea: z.string().min(1, 'Tema ou ideia é obrigatório'),
  socialAccountId: z.string().uuid('ID da conta social inválido').optional(),
})

/**
 * POST /api/posts/generate
 * Gera um novo post com base nas informações fornecidas
 * Por enquanto, cria um post mock até que as integrações de IA estejam prontas
 */
export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const validation = await validateBody(request, generatePostSchema)
    
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }
    
    const { niche, postType, tone, themeOrIdea, socialAccountId } = validation.data
    
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
    
    // TODO: Quando as integrações de IA estiverem prontas, substituir por:
    // 1. Chamar job Trigger.dev para gerar texto (legenda)
    // 2. Chamar job Trigger.dev para gerar imagem
    // 3. Upload da imagem para Cloudflare R2
    // 4. Criar post com imagem e legenda geradas
    
    // Por enquanto, criar post mock com dados placeholder
    const mockImageUrl = 'https://via.placeholder.com/1080x1080?text=Post+Image'
    const mockCaption = `[${niche}] ${postType} - ${tone}\n\n${themeOrIdea}\n\n#${niche} #${postType} #${tone}`
    
    const post = await prisma.post.create({
      data: {
        userId: user.id,
        imageUrl: mockImageUrl,
        caption: mockCaption,
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
    
    logger.info('Post generated (mock)', { postId: post.id, userId: user.id, niche, postType })
    
    return NextResponse.json(
      {
        message: 'Post gerado com sucesso',
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
    logger.error('Failed to generate post', { userId: user.id, error: (error as Error).message })
    return NextResponse.json(
      { error: 'Failed to generate post', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
})
