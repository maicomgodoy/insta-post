import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { creditService, CreditType } from '@/lib/services/credit-service'
import { logger } from '@/lib/logger'
import { withAuth } from '@/middleware/api-auth'
import { validateQuery, validationErrorResponse } from '@/middleware/api-validation'

const historyQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  type: z.enum(['monthly_renewal', 'purchase', 'bonus', 'usage']).optional(),
})

/**
 * GET /api/credits/history
 * Retorna o histórico de transações de créditos do usuário (requer autenticação)
 */
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const validation = validateQuery(request, historyQuerySchema)
    
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }
    
    const { limit, offset, type } = validation.data
    
    const history = await creditService.getCreditHistory(user.id, {
      limit,
      offset,
      type: type as CreditType | undefined,
    })
    
    return NextResponse.json({
      credits: history.credits.map((credit) => ({
        id: credit.id,
        amount: credit.amount,
        type: credit.type,
        description: credit.description,
        createdAt: credit.createdAt,
      })),
      pagination: {
        total: history.total,
        limit: history.limit,
        offset: history.offset,
        hasMore: history.offset + history.limit < history.total,
      },
    })
  } catch (error) {
    logger.error('Failed to fetch credit history', {
      userId: user.id,
      error: (error as Error).message,
    })
    return NextResponse.json(
      { error: 'Failed to fetch credit history', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
})
