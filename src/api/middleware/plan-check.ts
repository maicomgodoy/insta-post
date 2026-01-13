import { Response, NextFunction } from 'express'
import { prisma } from '../lib/prisma'
import { logger } from '../lib/logger'
import { ApiError } from './error-handler'
import { AuthenticatedRequest } from './auth'

export interface PlanCheckOptions {
  /**
   * Se true, permite usuários sem assinatura (plano gratuito/trial)
   */
  allowNoSubscription?: boolean

  /**
   * Se especificado, verifica se o plano permite uma funcionalidade específica
   */
  requiresScheduling?: boolean
  requiresMultipleAccounts?: boolean

  /**
   * Se especificado, verifica se o plano tem créditos suficientes
   */
  requiredCredits?: number
}

/**
 * Middleware para verificar se o usuário tem um plano ativo
 * Adiciona informações do plano e assinatura em req.plan e req.subscription
 */
export async function checkActivePlan(
  req: AuthenticatedRequest & {
    subscription?: {
      id: string
      status: string
      plan: {
        id: string
        name: string
        displayName: string
        monthlyCredits: number
        allowsScheduling: boolean
        maxScheduledPosts: number | null
        allowsMultipleAccounts: boolean
      }
      trialEndsAt: Date | null
      currentPeriodEnd: Date | null
    }
    plan?: {
      id: string
      name: string
      displayName: string
      monthlyCredits: number
      allowsScheduling: boolean
      maxScheduledPosts: number | null
      allowsMultipleAccounts: boolean
    }
  },
  res: Response,
  next: NextFunction,
  options: PlanCheckOptions = {}
): Promise<void> {
  try {
    const userId = req.user!.id
    const {
      allowNoSubscription = false,
      requiresScheduling = false,
      requiresMultipleAccounts = false,
      requiredCredits,
    } = options

    // Buscar assinatura do usuário
    const subscription = await prisma.subscription.findUnique({
      where: { userId },
      include: {
        plan: true,
      },
    })

    // Se não tem assinatura e não permite sem assinatura, retornar erro
    if (!subscription) {
      if (!allowNoSubscription) {
        const error: ApiError = new Error('Active subscription required')
        error.statusCode = 403
        error.code = 'SUBSCRIPTION_REQUIRED'
        throw error
      }

      // Permite continuar sem assinatura
      req.subscription = undefined
      req.plan = undefined
      next()
      return
    }

    // Verificar status da assinatura
    const validStatuses = ['active', 'trialing']
    if (!validStatuses.includes(subscription.status)) {
      const error: ApiError = new Error('Active subscription required')
      error.statusCode = 403
      error.code = 'SUBSCRIPTION_INACTIVE'
      throw error
    }

    // Verificar se está em período de trial válido
    if (subscription.status === 'trialing' && subscription.trialEndsAt) {
      if (subscription.trialEndsAt < new Date()) {
        const error: ApiError = new Error('Trial period expired')
        error.statusCode = 403
        error.code = 'TRIAL_EXPIRED'
        throw error
      }
    }

    // Verificar funcionalidades do plano
    if (requiresScheduling && !subscription.plan.allowsScheduling) {
      const error: ApiError = new Error('This plan does not allow scheduling')
      error.statusCode = 403
      error.code = 'FEATURE_NOT_AVAILABLE'
      throw error
    }

    if (requiresMultipleAccounts && !subscription.plan.allowsMultipleAccounts) {
      const error: ApiError = new Error('This plan does not allow multiple accounts')
      error.statusCode = 403
      error.code = 'FEATURE_NOT_AVAILABLE'
      throw error
    }

    // Adicionar informações do plano e assinatura à requisição
    req.subscription = {
      id: subscription.id,
      status: subscription.status,
      plan: {
        id: subscription.plan.id,
        name: subscription.plan.name,
        displayName: subscription.plan.displayName,
        monthlyCredits: subscription.plan.monthlyCredits,
        allowsScheduling: subscription.plan.allowsScheduling,
        maxScheduledPosts: subscription.plan.maxScheduledPosts,
        allowsMultipleAccounts: subscription.plan.allowsMultipleAccounts,
      },
      trialEndsAt: subscription.trialEndsAt,
      currentPeriodEnd: subscription.currentPeriodEnd,
    }

    req.plan = req.subscription.plan

    // Verificar créditos se necessário (após adicionar plano à req)
    if (requiredCredits !== undefined && requiredCredits > 0) {
      // Isso será verificado no endpoint específico usando creditService
      // Não vamos verificar aqui para não criar dependência circular
    }

    next()
  } catch (error) {
    if ((error as ApiError).statusCode) {
      next(error)
    } else {
      logger.error('Plan check error', {
        userId: req.user?.id,
        error: (error as Error).message,
      })
      const apiError: ApiError = new Error('Plan verification failed')
      apiError.statusCode = 500
      apiError.code = 'PLAN_CHECK_ERROR'
      next(apiError)
    }
  }
}

/**
 * Factory function para criar middleware de verificação de plano
 * Retorna uma função middleware configurável
 */
export function requireActivePlan(options: PlanCheckOptions = {}) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    return checkActivePlan(req as any, res, next, options)
  }
}
