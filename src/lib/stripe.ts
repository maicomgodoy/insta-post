import Stripe from 'stripe'

// Cache do cliente para evitar recriação
let stripeClient: Stripe | null = null

/**
 * Valida e retorna a chave secreta do Stripe
 * Validação ocorre apenas em runtime, não em build time
 */
function getStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not defined')
  }
  return key
}

/**
 * Obtém o cliente Stripe singleton
 * Usa lazy initialization para evitar erros durante o build time
 */
function getStripeClient(): Stripe {
  if (!stripeClient) {
    const secretKey = getStripeSecretKey()
    stripeClient = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
      typescript: true,
    })
  }
  
  return stripeClient
}

/**
 * Cliente Stripe singleton
 * Configurado com a chave secreta da API
 * 
 * Usa lazy initialization via Proxy para evitar erros durante o build time
 */
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    const client = getStripeClient()
    const value = (client as any)[prop]
    
    // Se for uma função, fazer bind para manter o contexto correto
    if (typeof value === 'function') {
      return value.bind(client)
    }
    
    return value
  },
}) as Stripe
