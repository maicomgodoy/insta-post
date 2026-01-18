import { NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { instagramService } from '@/lib/services/instagram-service'
import { withAuthAndParams } from '@/middleware/api-auth'
import { validateParams, validationErrorResponse } from '@/middleware/api-validation'

const accountIdSchema = z.object({
  id: z.string().uuid('ID da conta inválido'),
})

/**
 * POST /api/social-accounts/:id/validate
 * Valida o token de uma conta social fazendo uma chamada real à API (requer autenticação)
 * 
 * Esta validação não depende de webhook - faz uma chamada direta à API do Instagram
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
    
    // Validar apenas contas Instagram por enquanto
    if (account.platform !== 'instagram') {
      return NextResponse.json(
        { error: 'Validação de token só é suportada para Instagram', code: 'PLATFORM_NOT_SUPPORTED' },
        { status: 400 }
      )
    }
    
    // Validar token fazendo chamada real à API do Instagram
    try {
      const isValid = await instagramService.validateToken(account.accessToken)
      
      if (!isValid) {
        logger.warn('Token validation failed', {
          userId: user.id,
          accountId: id,
          platform: account.platform,
        })
        
        return NextResponse.json({
          isValid: false,
          message: 'Token inválido ou expirado',
          tokenExpired: account.tokenExpiresAt ? account.tokenExpiresAt < new Date() : false,
        })
      }
      
      // Se o token é válido, tentar obter informações do perfil para confirmação
      let profile = null
      try {
        profile = await instagramService.getProfile(account.accessToken)
      } catch {
        // Se falhar ao obter perfil, mas o token é válido, continuar
        logger.warn('Failed to get profile but token is valid', {
          userId: user.id,
          accountId: id,
        })
      }
      
      logger.info('Token validated successfully', {
        userId: user.id,
        accountId: id,
        username: profile?.username || account.accountUsername,
      })
      
      return NextResponse.json({
        isValid: true,
        message: 'Token válido',
        profile: profile || {
          id: account.accountId,
          username: account.accountUsername,
        },
        tokenExpired: account.tokenExpiresAt ? account.tokenExpiresAt < new Date() : false,
        tokenExpiresAt: account.tokenExpiresAt,
      })
    } catch (error) {
      logger.error('Failed to validate token', {
        userId: user.id,
        accountId: id,
        error: (error as Error).message,
      })
      
      return NextResponse.json(
        { 
          isValid: false, 
          error: 'Falha ao validar token', 
          message: (error as Error).message,
          code: 'VALIDATION_ERROR' 
        },
        { status: 500 }
      )
    }
  } catch (error) {
    logger.error('Failed to validate social account token', { error: (error as Error).message })
    return NextResponse.json(
      { error: 'Failed to validate token', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
})
