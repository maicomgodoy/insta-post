import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'

/**
 * GET /api/subscriptions/plans
 * Lista todos os planos disponíveis (público)
 */
export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      orderBy: { monthlyCredits: 'asc' },
    })
    
    return NextResponse.json({
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
    return NextResponse.json(
      { error: 'Failed to fetch plans', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
