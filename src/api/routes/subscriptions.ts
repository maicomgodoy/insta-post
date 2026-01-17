import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { stripe } from '../lib/stripe'
import { prisma } from '../lib/prisma'
import { validateBody } from '../middleware/validation'
import { authenticate, AuthenticatedRequest } from '../middleware/auth'
import { logger } from '../lib/logger'
import { ApiError } from '../middleware/error-handler'

const router = Router()

// Schemas de validação
const createCheckoutSchema = z.object({
  planId: z.string().uuid('Invalid plan ID'),
  successUrl: z.string().url('Invalid success URL').optional(),
  cancelUrl: z.string().url('Invalid cancel URL').optional(),
})

/**
 * GET /api/subscriptions/plans
 * Lista todos os planos disponíveis
 */
router.get('/plans', async (req: Request, res: Response) => {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { monthlyCredits: 'asc' },
    })

    res.json({
      plans: plans.map((plan) => ({
        id: plan.id,
        name: plan.name,
        displayName: plan.displayName,
        monthlyCredits: plan.monthlyCredits,
        allowsScheduling: plan.allowsScheduling,
        maxScheduledPosts: plan.maxScheduledPosts,
        allowsMultipleAccounts: plan.allowsMultipleAccounts,
        stripePriceId: plan.stripePriceId,
      })),
    })
  } catch (error) {
    logger.error('Failed to fetch plans', { error: (error as Error).message })
    throw error
  }
})

/**
 * POST /api/subscriptions/checkout
 * Cria uma sessão de checkout do Stripe
 */
router.post(
  '/checkout',
  authenticate,
  validateBody(createCheckoutSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user!.id
      const { planId, successUrl, cancelUrl } = req.body

      // Buscar plano
      const plan = await prisma.plan.findUnique({
        where: { id: planId },
      })

      if (!plan) {
        const error: ApiError = new Error('Plan not found')
        error.statusCode = 404
        error.code = 'PLAN_NOT_FOUND'
        throw error
      }

      if (!plan.stripePriceId) {
        const error: ApiError = new Error('Plan does not have a Stripe price ID')
        error.statusCode = 400
        error.code = 'PLAN_NOT_CONFIGURED'
        throw error
      }

      // Buscar usuário para obter email
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        const error: ApiError = new Error('User not found')
        error.statusCode = 404
        error.code = 'USER_NOT_FOUND'
        throw error
      }

      // Verificar se já existe assinatura ativa
      const existingSubscription = await prisma.subscription.findUnique({
        where: { userId },
        include: { plan: true },
      })

      // URLs de sucesso/cancelamento
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
      const defaultSuccessUrl = `${baseUrl}/dashboard?checkout=success`
      const defaultCancelUrl = `${baseUrl}/pricing?checkout=cancelled`

      // Criar ou obter customer no Stripe
      let customerId: string
      if (existingSubscription?.stripeCustomerId) {
        customerId = existingSubscription.stripeCustomerId
      } else {
        const customer = await stripe.customers.create({
          email: user.email,
          metadata: {
            userId,
          },
        })
        customerId = customer.id
      }

      // Criar checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [
          {
            price: plan.stripePriceId,
            quantity: 1,
          },
        ],
        success_url: successUrl || defaultSuccessUrl,
        cancel_url: cancelUrl || defaultCancelUrl,
        metadata: {
          userId,
          planId,
        },
        subscription_data: {
          metadata: {
            userId,
            planId,
          },
          trial_period_days: 14, // Período de teste grátis de 14 dias
        },
      })

      logger.info('Checkout session created', {
        userId,
        planId,
        sessionId: session.id,
      })

      res.json({
        sessionId: session.id,
        url: session.url,
      })
    } catch (error) {
      logger.error('Failed to create checkout session', {
        userId: req.user?.id,
        error: (error as Error).message,
      })
      throw error
    }
  }
)

/**
 * GET /api/subscriptions/me
 * Retorna a assinatura atual do usuário
 */
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: {
        plan: true,
      },
    })

    if (!subscription) {
      return res.json({
        subscription: null,
      })
    }

    res.json({
      subscription: {
        id: subscription.id,
        plan: {
          id: subscription.plan.id,
          name: subscription.plan.name,
          displayName: subscription.plan.displayName,
          monthlyCredits: subscription.plan.monthlyCredits,
          allowsScheduling: subscription.plan.allowsScheduling,
          maxScheduledPosts: subscription.plan.maxScheduledPosts,
          allowsMultipleAccounts: subscription.plan.allowsMultipleAccounts,
        },
        status: subscription.status,
        trialEndsAt: subscription.trialEndsAt,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        canceledAt: subscription.canceledAt,
        createdAt: subscription.createdAt,
      },
    })
  } catch (error) {
    logger.error('Failed to fetch subscription', {
      userId: req.user?.id,
      error: (error as Error).message,
    })
    throw error
  }
})

/**
 * POST /api/subscriptions/cancel
 * Cancela a assinatura atual do usuário
 */
router.post('/cancel', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id

    const subscription = await prisma.subscription.findUnique({
      where: { userId },
    })

    if (!subscription) {
      const error: ApiError = new Error('Subscription not found')
      error.statusCode = 404
      error.code = 'SUBSCRIPTION_NOT_FOUND'
      throw error
    }

    if (!subscription.stripeSubscriptionId) {
      const error: ApiError = new Error('Subscription does not have Stripe subscription ID')
      error.statusCode = 400
      error.code = 'SUBSCRIPTION_NOT_SYNCED'
      throw error
    }

    // Cancelar no Stripe (no final do período)
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    })

    // Atualizar no banco
    await prisma.subscription.update({
      where: { userId },
      data: {
        status: 'canceled',
        canceledAt: new Date(),
      },
    })

    logger.info('Subscription cancelled', {
      userId,
      subscriptionId: subscription.id,
    })

    res.json({
      message: 'Subscription cancelled successfully',
      canceledAt: new Date(),
    })
  } catch (error) {
    logger.error('Failed to cancel subscription', {
      userId: req.user?.id,
      error: (error as Error).message,
    })
    throw error
  }
})

export { router as subscriptionRoutes }
