import Stripe from 'stripe'
import { logger } from './logger'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not defined')
}

/**
 * Cliente Stripe singleton
 * Configurado com a chave secreta da API
 */
export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-10-16',
  typescript: true,
})

logger.info('Stripe client initialized')
