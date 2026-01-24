import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Seed de planos
 *
 * Stripe Price IDs: definidos via variáveis de ambiente (Opção B).
 * STRIPE_PRICE_STARTER, STRIPE_PRICE_PRO, STRIPE_PRICE_PREMIUM, STRIPE_PRICE_AGENCY.
 * Se não definidas, os planos são criados com stripePriceId null (checkout não funcionará).
 *
 * Ver: .env.example e docs/CONFIG-OPCAO-B.md
 */

function getStripePriceId(envKey: string): string | null {
  const v = process.env[envKey]
  return v && v.trim().length > 0 ? v.trim() : null
}

const plans = [
  {
    name: 'starter',
    displayName: 'Starter',
    monthlyCredits: 20,
    allowsScheduling: false,
    maxScheduledPosts: null,
    allowsMultipleAccounts: false,
    stripePriceId: getStripePriceId('STRIPE_PRICE_STARTER'),
  },
  {
    name: 'pro',
    displayName: 'Pro',
    monthlyCredits: 50,
    allowsScheduling: true,
    maxScheduledPosts: 10,
    allowsMultipleAccounts: false,
    stripePriceId: getStripePriceId('STRIPE_PRICE_PRO'),
  },
  {
    name: 'premium',
    displayName: 'Premium',
    monthlyCredits: 120,
    allowsScheduling: true,
    maxScheduledPosts: null,
    allowsMultipleAccounts: false,
    stripePriceId: getStripePriceId('STRIPE_PRICE_PREMIUM'),
  },
  {
    name: 'agency',
    displayName: 'Agência',
    monthlyCredits: 300,
    allowsScheduling: true,
    maxScheduledPosts: null,
    allowsMultipleAccounts: true,
    stripePriceId: getStripePriceId('STRIPE_PRICE_AGENCY'),
  },
]

async function main() {
  console.log('🌱 Seeding plans...')

  const missingPrices = plans.filter((p) => !(p.stripePriceId ?? null))
  if (missingPrices.length > 0) {
    console.log(
      `  ⚠ ${missingPrices.length} plano(s) sem STRIPE_PRICE_* definido(s). Defina no .env e rode o seed novamente para ativar checkout.`
    )
  }

  for (const planData of plans) {
    const existingPlan = await prisma.plan.findFirst({
      where: { name: planData.name },
    })

    if (existingPlan) {
      console.log(`  ✓ Plan ${planData.name} already exists, updating...`)
      await prisma.plan.update({
        where: { id: existingPlan.id },
        data: planData,
      })
    } else {
      console.log(`  ✓ Creating plan ${planData.name}...`)
      await prisma.plan.create({
        data: planData,
      })
    }
  }

  console.log('✅ Plans seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding plans:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
