import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { withAuthAndParams } from '@/middleware/api-auth'
import { validateParams, validationErrorResponse } from '@/middleware/api-validation'

const accountIdSchema = z.object({
  id: z.string().uuid('ID da conta inválido'),
})

/**
 * POST /api/social-accounts/:id/refresh
 * Atualiza o token de uma conta social (requer autenticação)
 */
export const POST = withAuthAndParams<{ id: string }>(async (request, user, params) => {
  try {
    const paramsValidation = validateParams(params, accountIdSchema)
    if (!paramsValidation.success) {
      return validationErrorResponse(paramsValidation.error)
    }
    
    const { id } = paramsValidation.data
    
    // Verificar se a conta existe e pertence ao usuário
    const account = await prisma.socialAccount.findFirst({
      where: {
        id,
        userId: user.id,
        isActive: true,
      },
    })
    
    if (!account) {
      return NextResponse.json(
        { error: 'Conta social não encontrada', code: 'SOCIAL_ACCOUNT_NOT_FOUND' },
        { status: 404 }
      )
    }
    
    // Para Instagram, precisamos usar o refresh token endpoint
    if (account.platform === 'instagram') {
      try {
        const response = await fetch(
          `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${account.accessToken}`
        )
        
        if (!response.ok) {
          const errorData = await response.json()
          logger.error('Failed to refresh Instagram token', { error: errorData })
          return NextResponse.json(
            { error: 'Falha ao atualizar token. Reconecte a conta.', code: 'TOKEN_REFRESH_FAILED' },
            { status: 400 }
          )
        }
        
        const data = await response.json() as {
          access_token: string
          token_type: string
          expires_in: number
        }
        
        // Atualizar token no banco
        const expiresAt = new Date(Date.now() + data.expires_in * 1000)
        
        await prisma.socialAccount.update({
          where: { id },
          data: {
            accessToken: data.access_token,
            tokenExpiresAt: expiresAt,
          },
        })
        
        logger.info('Instagram token refreshed', {
          userId: user.id,
          accountId: id,
        })
        
        return NextResponse.json({
          message: 'Token atualizado com sucesso',
          expiresAt,
        })
      } catch (error) {
        logger.error('Failed to refresh Instagram token', {
          error: (error as Error).message,
        })
        return NextResponse.json(
          { error: 'Falha ao atualizar token', code: 'TOKEN_REFRESH_FAILED' },
          { status: 400 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Plataforma não suportada para refresh de token', code: 'PLATFORM_NOT_SUPPORTED' },
      { status: 400 }
    )
  } catch (error) {
    logger.error('Failed to refresh social account token', { error: (error as Error).message })
    return NextResponse.json(
      { error: 'Failed to refresh token', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
})
