/**
 * Lista produtos e preços do Stripe e gera as linhas para .env (STRIPE_PRICE_*).
 * Usa STRIPE_SECRET_KEY do .env.
 *
 * Uso: pnpm exec tsx scripts/list-stripe-prices.ts
 */

import 'dotenv/config'
import Stripe from 'stripe'

const PLAN_MAP: Record<string, string> = {
  starter: 'STRIPE_PRICE_STARTER',
  pro: 'STRIPE_PRICE_PRO',
  premium: 'STRIPE_PRICE_PREMIUM',
  agência: 'STRIPE_PRICE_AGENCY',
  agency: 'STRIPE_PRICE_AGENCY',
}

async function main() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key || !key.startsWith('sk_')) {
    console.error('Defina STRIPE_SECRET_KEY no .env (sk_test_... ou sk_live_...)')
    process.exit(1)
  }

  const stripe = new Stripe(key, { apiVersion: '2023-10-16' })

  console.log('Buscando produtos e preços no Stripe...\n')

  const prices = await stripe.prices.list({
    active: true,
    type: 'recurring',
    expand: ['data.product'],
    limit: 100,
  })

  const monthly = prices.data.filter(
    (p) => p.recurring?.interval === 'month'
  ) as (Stripe.Price & { product: Stripe.Product })[]

  if (monthly.length === 0) {
    console.log('Nenhum preço recorrente mensal encontrado.')
    console.log('Crie os 4 produtos (Starter, Pro, Premium, Agência) com preço mensal no Stripe Dashboard.')
    process.exit(0)
  }

  const envLines: string[] = []
  const matched: string[] = []

  for (const price of monthly) {
    const product = price.product as Stripe.Product
    const name = (product.name || '').toLowerCase().trim()
    const amount = price.unit_amount
    const currency = (price.currency || '').toUpperCase()
    const amountStr =
      amount != null
        ? currency === 'BRL'
          ? `R$ ${(amount / 100).toFixed(2)}`
          : `${(amount / 100).toFixed(2)} ${currency}`
        : '?'

    let varName: string | null = null
    for (const [slug, envVar] of Object.entries(PLAN_MAP)) {
      if (name.includes(slug)) {
        varName = envVar
        matched.push(envVar)
        break
      }
    }
    if (!varName) varName = `# Ajuste manual: "${product.name}"`

    const line =
      typeof varName === 'string' && varName.startsWith('#')
        ? `${varName} -> ${price.id}`
        : `${varName}="${price.id}"`
    envLines.push(line)

    console.log(
      `  ${product.name} (${amountStr}) → ${price.id}${varName?.startsWith('#') ? '' : ` [${varName}]`}`
    )
  }

  console.log('\n--- Cole no .env ---\n')
  console.log(envLines.join('\n'))
  console.log('')

  const missing = Object.values(PLAN_MAP).filter((v) => !matched.includes(v))
  if (missing.length > 0) {
    console.log(
      `⚠ Planos não encontrados por nome (Starter, Pro, Premium, Agência): ${missing.join(', ')}`
    )
    console.log(
      '  Renomeie os produtos no Stripe ou adicione os Price IDs manualmente.')
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
