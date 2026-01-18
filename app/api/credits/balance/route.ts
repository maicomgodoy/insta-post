import { NextRequest, NextResponse } from 'next/server'
import { creditService } from '@/lib/services/credit-service'
import { logger } from '@/lib/logger'
import { withAuth } from '@/middleware/api-auth'

/**
 * GET /api/credits/balance
 * Retorna o saldo de créditos disponíveis do usuário (requer autenticação)
 */
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const available = await creditService.getAvailableCredits(user.id)
    
    return NextResponse.json({
      available,
      userId: user.id,
    })
  } catch (error) {
    logger.error('Failed to fetch credit balance', {
      userId: user.id,
      error: (error as Error).message,
    })
    return NextResponse.json(
      { error: 'Failed to fetch credit balance', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
})
