import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { withAuth } from '@/middleware/api-auth'

/**
 * POST /api/subscriptions/cancel
 * Cancela a assinatura atual do usuário (requer autenticação)
 */
export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
    })
    
    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found', code: 'SUBSCRIPTION_NOT_FOUND' },
        { status: 404 }
      )
    }
    
    if (!subscription.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'Subscription does not have Stripe subscription ID', code: 'SUBSCRIPTION_NOT_SYNCED' },
        { status: 400 }
      )
    }
    
    // Cancelar no Stripe (no final do período)
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    })
    
    // Atualizar no banco
    await prisma.subscription.update({
      where: { userId: user.id },
      data: {
        status: 'canceled',
        canceledAt: new Date(),
      },
    })
    
    logger.info('Subscription cancelled', {
      userId: user.id,
      subscriptionId: subscription.id,
    })
    
    return NextResponse.json({
      message: 'Subscription cancelled successfully',
      canceledAt: new Date(),
    })
  } catch (error) {
    logger.error('Failed to cancel subscription', {
      userId: user.id,
      error: (error as Error).message,
    })
    return NextResponse.json(
      { error: 'Failed to cancel subscription', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
})
