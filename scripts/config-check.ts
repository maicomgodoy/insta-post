/**
 * Verifica presença das variáveis de ambiente necessárias (Opção B).
 * Não exibe valores, apenas se estão definidas e não vazias.
 *
 * Uso: pnpm run config:check
 */

import 'dotenv/config'

const required = {
  base: [
    'DATABASE_URL',
    'SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'SUPABASE_ANON_KEY',
  ],
  stripe: [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'STRIPE_PRICE_STARTER',
    'STRIPE_PRICE_PRO',
    'STRIPE_PRICE_PREMIUM',
    'STRIPE_PRICE_AGENCY',
  ],
  instagram: ['INSTAGRAM_CLIENT_ID', 'INSTAGRAM_CLIENT_SECRET', 'INSTAGRAM_REDIRECT_URI'],
} as const

function isSet(key: string): boolean {
  const v = process.env[key]
  return typeof v === 'string' && v.trim().length > 0
}

function checkGroup(
  name: string,
  keys: readonly string[]
): { ok: boolean; missing: string[] } {
  const missing = keys.filter((k) => !isSet(k))
  return { ok: missing.length === 0, missing: [...missing] }
}

function main() {
  console.log('Config check (Opção B)\n')

  let hasError = false

  const base = checkGroup('Base', required.base)
  console.log(base.ok ? '  ✅ Base' : '  ❌ Base')
  if (!base.ok) {
    base.missing.forEach((k) => console.log(`      missing: ${k}`))
    hasError = true
  }

  const stripe = checkGroup('Stripe', required.stripe)
  console.log(stripe.ok ? '  ✅ Stripe' : '  ❌ Stripe')
  if (!stripe.ok) {
    stripe.missing.forEach((k) => console.log(`      missing: ${k}`))
    hasError = true
  }

  const ig = checkGroup('Instagram', required.instagram)
  console.log(ig.ok ? '  ✅ Instagram' : '  ❌ Instagram')
  if (!ig.ok) {
    ig.missing.forEach((k) => console.log(`      missing: ${k}`))
    hasError = true
  }

  const appUrl = isSet('NEXT_PUBLIC_APP_URL')
  console.log(appUrl ? '  ✅ NEXT_PUBLIC_APP_URL' : '  ⚠ NEXT_PUBLIC_APP_URL (opcional, default localhost:3000)')

  console.log('')
  if (hasError) {
    console.log('Defina as variáveis no .env. Veja .env.example e docs/CONFIG-OPCAO-B.md')
    process.exit(1)
  }
  console.log('Todas as variáveis necessárias estão definidas.')
}

main()
