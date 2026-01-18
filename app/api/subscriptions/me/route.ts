import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { withAuth } from '@/middleware/api-auth'

/**
 * GET /api/subscriptions/me
 * Retorna a assinatura atual do usuário (requer autenticação)
 */
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const subscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
      include: {
        plan: true,
      },
    })
    
    if (!subscription) {
      return NextResponse.json({
        subscription: null,
      })
    }
    
    return NextResponse.json({
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
      userId: user.id,
      error: (error as Error).message,
    })
    return NextResponse.json(
      { error: 'Failed to fetch subscription', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
})
