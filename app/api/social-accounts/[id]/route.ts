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
 * GET /api/social-accounts/:id
 * Busca uma conta social por ID (requer autenticação)
 */
export const GET = withAuthAndParams<{ id: string }>(async (request, user, params) => {
  try {
    const paramsValidation = validateParams(params, accountIdSchema)
    if (!paramsValidation.success) {
      return validationErrorResponse(paramsValidation.error)
    }
    
    const { id } = paramsValidation.data
    
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
    
    return NextResponse.json({
      account: {
        id: account.id,
        platform: account.platform,
        accountId: account.accountId,
        accountUsername: account.accountUsername,
        isTokenExpired: account.tokenExpiresAt ? account.tokenExpiresAt < new Date() : false,
        createdAt: account.createdAt,
      },
    })
  } catch (error) {
    logger.error('Failed to get social account', { error: (error as Error).message })
    return NextResponse.json(
      { error: 'Failed to get social account', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
})

/**
 * DELETE /api/social-accounts/:id
 * Desconecta uma conta social (requer autenticação)
 */
export const DELETE = withAuthAndParams<{ id: string }>(async (request, user, params) => {
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
    
    // Desativar a conta (soft delete)
    await prisma.socialAccount.update({
      where: { id },
      data: { isActive: false },
    })
    
    logger.info('Social account disconnected', {
      userId: user.id,
      accountId: id,
      platform: account.platform,
    })
    
    return NextResponse.json({
      message: 'Conta social desconectada com sucesso',
    })
  } catch (error) {
    logger.error('Failed to disconnect social account', { error: (error as Error).message })
    return NextResponse.json(
      { error: 'Failed to disconnect social account', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
})
