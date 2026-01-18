import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { withAuth } from '@/middleware/api-auth'
import { validateBody, validationErrorResponse } from '@/middleware/api-validation'

const createCheckoutSchema = z.object({
  planId: z.string().uuid('Invalid plan ID'),
  successUrl: z.string().url('Invalid success URL').optional(),
  cancelUrl: z.string().url('Invalid cancel URL').optional(),
})

/**
 * POST /api/subscriptions/checkout
 * Cria uma sessão de checkout do Stripe (requer autenticação)
 */
export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const validation = await validateBody(request, createCheckoutSchema)
    
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }
    
    const { planId, successUrl, cancelUrl } = validation.data
    
    // Buscar plano
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    })
    
    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found', code: 'PLAN_NOT_FOUND' },
        { status: 404 }
      )
    }
    
    if (!plan.stripePriceId) {
      return NextResponse.json(
        { error: 'Plan does not have a Stripe price ID', code: 'PLAN_NOT_CONFIGURED' },
        { status: 400 }
      )
    }
    
    // Buscar usuário para obter email
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
    })
    
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      )
    }
    
    // Verificar se já existe assinatura ativa
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: user.id },
      include: { plan: true },
    })
    
    // URLs de sucesso/cancelamento
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const defaultSuccessUrl = `${baseUrl}/dashboard?checkout=success`
    const defaultCancelUrl = `${baseUrl}/pricing?checkout=cancelled`
    
    // Criar ou obter customer no Stripe
    let customerId: string
    if (existingSubscription?.stripeCustomerId) {
      customerId = existingSubscription.stripeCustomerId
    } else {
      const customer = await stripe.customers.create({
        email: userData.email,
        metadata: {
          userId: user.id,
        },
      })
      customerId = customer.id
    }
    
    // Criar checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.stripePriceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || defaultSuccessUrl,
      cancel_url: cancelUrl || defaultCancelUrl,
      metadata: {
        userId: user.id,
        planId,
      },
      subscription_data: {
        metadata: {
          userId: user.id,
          planId,
        },
        trial_period_days: 14, // Período de teste grátis de 14 dias
      },
    })
    
    logger.info('Checkout session created', {
      userId: user.id,
      planId,
      sessionId: session.id,
    })
    
    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    logger.error('Failed to create checkout session', {
      userId: user.id,
      error: (error as Error).message,
    })
    return NextResponse.json(
      { error: 'Failed to create checkout session', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
})
