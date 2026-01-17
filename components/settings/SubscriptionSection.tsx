'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Card, Button, Loading, Error } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { useParams } from 'next/navigation'

interface Plan {
  id: string
  name: string
  displayName: string
  monthlyCredits: number
  allowsScheduling: boolean
  maxScheduledPosts: number | null
  allowsMultipleAccounts: boolean
  stripePriceId: string | null
}

interface Subscription {
  id: string
  plan: Plan
  status: string
  trialEndsAt: string | null
  currentPeriodStart: string | null
  currentPeriodEnd: string | null
  canceledAt: string | null
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export function SubscriptionSection() {
  const t = useTranslations('settings')
  const { addToast } = useToast()
  const params = useParams()
  const locale = params.locale as string

  const [plans, setPlans] = useState<Plan[]>([])
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null)
  const [canceling, setCanceling] = useState(false)

  // Fetch plans and subscription
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get token
        const token = localStorage.getItem('access_token')
        if (!token) return

        // Fetch plans and subscription in parallel
        const [plansResponse, subscriptionResponse] = await Promise.all([
          fetch(`${API_URL}/api/subscriptions/plans`),
          fetch(`${API_URL}/api/subscriptions/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ])

        if (!plansResponse.ok) {
          throw new globalThis.Error('Failed to fetch plans')
        }

        const plansData = await plansResponse.json()
        setPlans(plansData.plans)

        if (subscriptionResponse.ok) {
          const subscriptionData = await subscriptionResponse.json()
          setSubscription(subscriptionData.subscription)
        }
      } catch (err) {
        setError(err instanceof globalThis.Error ? err.message : 'Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Handle checkout
  const handleCheckout = async (planId: string) => {
    try {
      setProcessingPlanId(planId)
      const token = localStorage.getItem('access_token')
      if (!token) {
        addToast({
          type: 'error',
          title: 'Error',
          message: 'Você precisa estar logado',
        })
        return
      }

      const successUrl = `${window.location.origin}/${locale}/settings?checkout=success`
      const cancelUrl = `${window.location.origin}/${locale}/settings?checkout=cancelled`

      const response = await fetch(`${API_URL}/api/subscriptions/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId,
          successUrl,
          cancelUrl,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new globalThis.Error(errorData.error || errorData.message || 'Failed to create checkout')
      }

      const data = await response.json()

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Error',
        message: err instanceof globalThis.Error ? err.message : 'Failed to create checkout',
      })
    } finally {
      setProcessingPlanId(null)
    }
  }

  // Handle cancel subscription
  const handleCancel = async () => {
    if (!confirm('Tem certeza que deseja cancelar sua assinatura? Você continuará com acesso até o fim do período atual.')) {
      return
    }

    try {
      setCanceling(true)
      const token = localStorage.getItem('access_token')
      if (!token) {
        addToast({
          type: 'error',
          title: 'Error',
          message: 'Você precisa estar logado',
        })
        return
      }

      const response = await fetch(`${API_URL}/api/subscriptions/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new globalThis.Error(errorData.error || errorData.message || 'Failed to cancel subscription')
      }

      addToast({
        type: 'success',
        title: 'Success',
        message: 'Assinatura cancelada com sucesso',
      })

      // Refresh subscription data
      const subscriptionResponse = await fetch(`${API_URL}/api/subscriptions/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (subscriptionResponse.ok) {
        const subscriptionData = await subscriptionResponse.json()
        setSubscription(subscriptionData.subscription)
      }
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Error',
        message: err instanceof globalThis.Error ? err.message : 'Failed to cancel subscription',
      })
    } finally {
      setCanceling(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <Loading text="Carregando planos..." />
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <Error title="Error" message={error} />
      </Card>
    )
  }

  const currentPlanId = subscription?.plan.id

  return (
    <Card>
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
        {t('subscription')}
      </h2>

      {/* Current subscription */}
      {subscription && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                Plano Atual: {subscription.plan.displayName}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {subscription.plan.monthlyCredits} créditos/mês
              </p>
              {subscription.status === 'trialing' && subscription.trialEndsAt && (
                <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                  Período de teste até {new Date(subscription.trialEndsAt).toLocaleDateString()}
                </p>
              )}
              {subscription.status === 'canceled' && (
                <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
                  Assinatura cancelada. Válida até {subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : 'fim do período'}
                </p>
              )}
            </div>
            {subscription.status === 'active' && !subscription.canceledAt && (
              <Button variant="outline" size="sm" onClick={handleCancel} disabled={canceling}>
                {canceling ? 'Cancelando...' : 'Cancelar Assinatura'}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Available plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const isCurrentPlan = currentPlanId === plan.id
          const isProcessing = processingPlanId === plan.id

          return (
            <div
              key={plan.id}
              className={`p-4 rounded-lg border-2 ${
                isCurrentPlan
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
                {plan.displayName}
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                {plan.monthlyCredits} créditos
              </p>
              <ul className="text-sm text-gray-600 dark:text-gray-400 mb-4 space-y-1">
                <li>✓ {plan.monthlyCredits} créditos/mês</li>
                {plan.allowsScheduling && (
                  <li>
                    ✓ Agendamento{' '}
                    {plan.maxScheduledPosts ? `(${plan.maxScheduledPosts} posts)` : 'ilimitado'}
                  </li>
                )}
                {plan.allowsMultipleAccounts && <li>✓ Múltiplas contas</li>}
              </ul>
              {isCurrentPlan ? (
                <Button variant="outline" size="sm" disabled className="w-full">
                  Plano Atual
                </Button>
              ) : (
                <Button
                  variant={plan.name === 'premium' || plan.name === 'agency' ? 'primary' : 'outline'}
                  size="sm"
                  className="w-full"
                  onClick={() => handleCheckout(plan.id)}
                  disabled={isProcessing || !plan.stripePriceId}
                >
                  {isProcessing ? 'Processando...' : 'Assinar'}
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
