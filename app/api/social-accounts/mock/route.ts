import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { withAuth } from '@/middleware/api-auth'

/**
 * POST /api/social-accounts/mock
 * Cria uma conta social mock para testes (somente em desenvolvimento)
 */
export const POST = withAuth(async (request: NextRequest, user) => {
  // Apenas permitir em desenvolvimento
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Not available in production', code: 'NOT_AVAILABLE' },
      { status: 403 }
    )
  }
  
  try {
    // Verificar se já existe uma conta mock
    const existingAccount = await prisma.socialAccount.findFirst({
      where: {
        userId: user.id,
        platform: 'instagram',
        accountId: 'mock_account_id',
      },
    })
    
    if (existingAccount) {
      return NextResponse.json({
        message: 'Mock account already exists',
        account: {
          id: existingAccount.id,
          platform: existingAccount.platform,
          accountId: existingAccount.accountId,
          accountUsername: existingAccount.accountUsername,
          isTokenExpired: false,
          createdAt: existingAccount.createdAt,
        },
      })
    }
    
    // Criar conta mock
    const account = await prisma.socialAccount.create({
      data: {
        userId: user.id,
        platform: 'instagram',
        accountId: 'mock_account_id',
        accountUsername: 'mock_user',
        accessToken: 'mock_access_token',
        tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 dias
        isActive: true,
      },
    })
    
    logger.info('Mock Instagram account created', {
      userId: user.id,
      accountId: account.id,
    })
    
    return NextResponse.json(
      {
        message: 'Mock account created',
        account: {
          id: account.id,
          platform: account.platform,
          accountId: account.accountId,
          accountUsername: account.accountUsername,
          isTokenExpired: false,
          createdAt: account.createdAt,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    logger.error('Failed to create mock account', {
      userId: user.id,
      error: (error as Error).message,
    })
    return NextResponse.json(
      { error: 'Failed to create mock account', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
})
