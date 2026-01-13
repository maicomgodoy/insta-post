import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Seed de planos
 * 
 * IMPORTANTE: Antes de executar este seed, você precisa:
 * 1. Criar os produtos e preços no Stripe
 * 2. Obter os price IDs do Stripe
 * 3. Atualizar os stripePriceId abaixo com os IDs reais
 * 
 * Para criar produtos/preços no Stripe:
 * - Via Dashboard: https://dashboard.stripe.com/products
 * - Via CLI: stripe products create / stripe prices create
 * - Via API: usar a biblioteca do Stripe
 */

const plans = [
  {
    name: 'starter',
    displayName: 'Starter',
    monthlyCredits: 20,
    allowsScheduling: false,
    maxScheduledPosts: null,
    allowsMultipleAccounts: false,
    stripePriceId: null, // TODO: Preencher após criar no Stripe
  },
  {
    name: 'pro',
    displayName: 'Pro',
    monthlyCredits: 50,
    allowsScheduling: true,
    maxScheduledPosts: 10,
    allowsMultipleAccounts: false,
    stripePriceId: null, // TODO: Preencher após criar no Stripe
  },
  {
    name: 'premium',
    displayName: 'Premium',
    monthlyCredits: 120,
    allowsScheduling: true,
    maxScheduledPosts: null, // null = ilimitado
    allowsMultipleAccounts: false,
    stripePriceId: null, // TODO: Preencher após criar no Stripe
  },
  {
    name: 'agency',
    displayName: 'Agência',
    monthlyCredits: 300,
    allowsScheduling: true,
    maxScheduledPosts: null, // null = ilimitado
    allowsMultipleAccounts: true,
    stripePriceId: null, // TODO: Preencher após criar no Stripe
  },
]

async function main() {
  console.log('🌱 Seeding plans...')

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
