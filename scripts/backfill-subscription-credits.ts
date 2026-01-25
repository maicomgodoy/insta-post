/**
 * Concede créditos para assinantes ativos/trialing que ainda não receberam
 * (ex.: assinaram antes do webhook conceder créditos).
 * Se currentPeriodStart estiver null, busca no Stripe e atualiza o banco.
 *
 * Uso: pnpm exec tsx scripts/backfill-subscription-credits.ts
 */

import 'dotenv/config'
import Stripe from 'stripe'
import { prisma } from '../src/lib/prisma'
import { creditService } from '../src/lib/services/credit-service'
import { logger } from '../src/lib/logger'

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key?.startsWith('sk_')) throw new Error('STRIPE_SECRET_KEY não definida')
  return new Stripe(key, { apiVersion: '2023-10-16' })
}

async function main() {
  const allActive = await prisma.subscription.findMany({
    where: { status: { in: ['active', 'trialing'] } },
    include: { plan: true },
  })
  const pending = allActive.filter(
    (s) => s.lastCreditPeriodStart == null && s.plan.monthlyCredits > 0
  )
  if (pending.length === 0) {
    console.log('Nenhuma assinatura pendente de créditos.')
    return
  }

  const stripe = getStripe()

  for (const sub of pending) {
    let periodStart = sub.currentPeriodStart

    if (!periodStart && sub.stripeSubscriptionId) {
      try {
        const stripeSub = await stripe.subscriptions.retrieve(sub.stripeSubscriptionId)
        periodStart = stripeSub.current_period_start
          ? new Date(stripeSub.current_period_start * 1000)
          : new Date()
        await prisma.subscription.update({
          where: { userId: sub.userId },
          data: {
            currentPeriodStart: periodStart,
            ...(stripeSub.current_period_end && {
              currentPeriodEnd: new Date(stripeSub.current_period_end * 1000),
            }),
          },
        })
        console.log(`  ⏳ ${sub.plan.displayName}: período obtido do Stripe.`)
      } catch (e) {
        console.error(`  ✗ ${sub.userId}: falha ao buscar Stripe – ${e instanceof Error ? e.message : e}`)
        continue
      }
    }

    if (!periodStart) periodStart = new Date()

    const amount = sub.plan.monthlyCredits

    try {
      await creditService.renewMonthlyCredits(sub.userId, amount)
      await prisma.subscription.update({
        where: { userId: sub.userId },
        data: { lastCreditPeriodStart: periodStart },
      })
      console.log(`  ✓ ${sub.userId} (${sub.plan.displayName}): +${amount} créditos.`)
      logger.info('Backfill credits granted', {
        userId: sub.userId,
        planId: sub.planId,
        amount,
      })
    } catch (e) {
      console.error(`  ✗ ${sub.userId}: ${e instanceof Error ? e.message : e}`)
    }
  }

  console.log('\nConcluído.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
