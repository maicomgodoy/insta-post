import { Request, Response } from 'express'
import Stripe from 'stripe'
import { stripe } from '../../lib/stripe'
import { prisma } from '../../lib/prisma'
import { logger } from '../../lib/logger'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

if (!webhookSecret) {
  logger.warn('STRIPE_WEBHOOK_SECRET is not defined - webhook verification will be disabled')
}

/**
 * Sincroniza uma assinatura do Stripe com o banco de dados
 */
async function syncSubscription(stripeSubscription: Stripe.Subscription): Promise<void> {
  const userId = stripeSubscription.metadata.userId
  const planId = stripeSubscription.metadata.planId

  if (!userId || !planId) {
    logger.error('Stripe subscription missing metadata', {
      subscriptionId: stripeSubscription.id,
      metadata: stripeSubscription.metadata,
    })
    throw new Error('Subscription metadata missing userId or planId')
  }

  // Buscar plano
  const plan = await prisma.plan.findUnique({
    where: { id: planId },
  })

  if (!plan) {
    logger.error('Plan not found for subscription', { planId, subscriptionId: stripeSubscription.id })
    throw new Error(`Plan not found: ${planId}`)
  }

  // Determinar status
  let status: string
  if (stripeSubscription.status === 'active') {
    status = stripeSubscription.trial_end && stripeSubscription.trial_end > Date.now() / 1000
      ? 'trialing'
      : 'active'
  } else if (stripeSubscription.status === 'canceled' || stripeSubscription.cancel_at_period_end) {
    status = 'canceled'
  } else if (stripeSubscription.status === 'past_due' || stripeSubscription.status === 'unpaid') {
    status = 'past_due'
  } else {
    status = stripeSubscription.status
  }

  // Criar ou atualizar assinatura no banco
  await prisma.subscription.upsert({
    where: { userId },
    create: {
      userId,
      planId,
      stripeCustomerId: stripeSubscription.customer as string,
      stripeSubscriptionId: stripeSubscription.id,
      status,
      trialEndsAt: stripeSubscription.trial_end
        ? new Date(stripeSubscription.trial_end * 1000)
        : null,
      currentPeriodStart: stripeSubscription.current_period_start
        ? new Date(stripeSubscription.current_period_start * 1000)
        : null,
      currentPeriodEnd: stripeSubscription.current_period_end
        ? new Date(stripeSubscription.current_period_end * 1000)
        : null,
      canceledAt: stripeSubscription.canceled_at
        ? new Date(stripeSubscription.canceled_at * 1000)
        : null,
    },
    update: {
      planId,
      stripeCustomerId: stripeSubscription.customer as string,
      stripeSubscriptionId: stripeSubscription.id,
      status,
      trialEndsAt: stripeSubscription.trial_end
        ? new Date(stripeSubscription.trial_end * 1000)
        : null,
      currentPeriodStart: stripeSubscription.current_period_start
        ? new Date(stripeSubscription.current_period_start * 1000)
        : null,
      currentPeriodEnd: stripeSubscription.current_period_end
        ? new Date(stripeSubscription.current_period_end * 1000)
        : null,
      canceledAt: stripeSubscription.canceled_at
        ? new Date(stripeSubscription.canceled_at * 1000)
        : null,
    },
  })

  logger.info('Subscription synced', {
    userId,
    planId,
    subscriptionId: stripeSubscription.id,
    status,
  })
}

/**
 * Handler de webhooks do Stripe
 * 
 * IMPORTANTE: Este handler recebe req.body como Buffer (raw body)
 * O middleware express.raw() deve ser aplicado ANTES deste handler
 */
export async function stripeWebhookHandler(req: Request, res: Response): Promise<void> {
  const sig = req.headers['stripe-signature']

  if (!sig) {
    logger.warn('Stripe webhook received without signature')
    res.status(400).send('Missing stripe-signature header')
    return
  }

  if (!webhookSecret) {
    logger.error('Webhook secret not configured')
    res.status(500).send('Webhook secret not configured')
    return
  }

  let event: Stripe.Event

  try {
    // Verificar assinatura do webhook
    // req.body deve ser o raw body (Buffer) - não usar express.json() antes
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
  } catch (err) {
    const error = err as Error
    logger.error('Webhook signature verification failed', { error: error.message })
    res.status(400).send(`Webhook Error: ${error.message}`)
    return
  }

  // Processar evento
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session

        if (session.mode === 'subscription' && session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
          )
          await syncSubscription(subscription)
        }

        logger.info('Checkout session completed', {
          sessionId: session.id,
          subscriptionId: session.subscription,
        })
        break
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        await syncSubscription(subscription)

        logger.info('Subscription synced via webhook', {
          eventType: event.type,
          subscriptionId: subscription.id,
        })
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata.userId

        if (userId) {
          await prisma.subscription.updateMany({
            where: {
              userId,
              stripeSubscriptionId: subscription.id,
            },
            data: {
              status: 'canceled',
              canceledAt: new Date(),
            },
          })

          logger.info('Subscription deleted', {
            userId,
            subscriptionId: subscription.id,
          })
        }
        break
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice

        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          )
          await syncSubscription(subscription)

          logger.info('Invoice payment succeeded', {
            invoiceId: invoice.id,
            subscriptionId: subscription.id,
          })
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice

        if (invoice.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            invoice.subscription as string
          )
          await syncSubscription(subscription)

          logger.warn('Invoice payment failed', {
            invoiceId: invoice.id,
            subscriptionId: subscription.id,
          })
        }
        break
      }

      default:
        logger.debug('Unhandled webhook event type', { type: event.type })
    }

    res.json({ received: true })
  } catch (error) {
    logger.error('Error processing webhook event', {
      eventType: event.type,
      error: (error as Error).message,
      stack: (error as Error).stack,
    })
    res.status(500).json({ error: 'Webhook handler failed' })
  }
}
