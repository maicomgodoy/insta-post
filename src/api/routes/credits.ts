import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { creditService } from '../lib/services/credit-service'
import { authenticate, AuthenticatedRequest } from '../middleware/auth'
import { validateQuery } from '../middleware/validation'
import { logger } from '../lib/logger'
import { ApiError } from '../middleware/error-handler'

const router = Router()

// Schemas de validação
const creditHistoryQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
  type: z.enum(['monthly_renewal', 'purchase', 'bonus', 'usage']).optional(),
})

/**
 * GET /api/credits/balance
 * Retorna o saldo de créditos disponíveis do usuário
 */
router.get('/balance', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id

    const available = await creditService.getAvailableCredits(userId)

    res.json({
      available,
      userId,
    })
  } catch (error) {
    logger.error('Failed to fetch credit balance', {
      userId: req.user?.id,
      error: (error as Error).message,
    })
    throw error
  }
})

/**
 * GET /api/credits/history
 * Retorna o histórico de transações de créditos do usuário
 */
router.get(
  '/history',
  authenticate,
  validateQuery(creditHistoryQuerySchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id
      const { limit, offset, type } = req.query as {
        limit: number
        offset: number
        type?: 'monthly_renewal' | 'purchase' | 'bonus' | 'usage'
      }

      const history = await creditService.getCreditHistory(userId, {
        limit,
        offset,
        type,
      })

      res.json({
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
        userId: req.user?.id,
        error: (error as Error).message,
      })
      throw error
    }
  }
)

export { router as creditRoutes }
