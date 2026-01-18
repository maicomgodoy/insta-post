import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { withAuth } from '@/middleware/api-auth'

/**
 * GET /api/social-accounts
 * Lista todas as contas sociais do usuário (requer autenticação)
 */
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const accounts = await prisma.socialAccount.findMany({
      where: {
        userId: user.id,
        isActive: true,
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json({
      accounts: accounts.map((account) => ({
        id: account.id,
        platform: account.platform,
        accountId: account.accountId,
        accountUsername: account.accountUsername,
        isTokenExpired: account.tokenExpiresAt ? account.tokenExpiresAt < new Date() : false,
        createdAt: account.createdAt,
      })),
    })
  } catch (error) {
    logger.error('Failed to list social accounts', {
      userId: user.id,
      error: (error as Error).message,
    })
    return NextResponse.json(
      { error: 'Failed to list social accounts', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
})
