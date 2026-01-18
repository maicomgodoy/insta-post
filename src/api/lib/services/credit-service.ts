import { prisma } from '../prisma'
import { logger } from '../logger'

export type CreditType = 'monthly_renewal' | 'purchase' | 'bonus' | 'usage'

/**
 * Erro quando usuário não tem créditos suficientes
 */
export class InsufficientCreditsError extends Error {
  constructor(
    public available: number,
    public required: number
  ) {
    super(`Insufficient credits: ${available} available, ${required} required`)
    this.name = 'InsufficientCreditsError'
  }
}

/**
 * Serviço para gerenciamento de créditos
 */
export class CreditService {
  /**
   * Obtém o saldo de créditos disponíveis de um usuário
   * Calcula a soma de todos os créditos (positivos e negativos)
   */
  async getAvailableCredits(userId: string): Promise<number> {
    const credits = await prisma.credit.findMany({
      where: { userId },
      select: { amount: true },
    })

    const balance = credits.reduce((sum: number, credit: { amount: number }) => sum + credit.amount, 0)

    return Math.max(0, balance) // Garantir que não seja negativo
  }

  /**
   * Obtém o histórico de créditos de um usuário
   */
  async getCreditHistory(
    userId: string,
    options?: {
      limit?: number
      offset?: number
      type?: CreditType
    }
  ) {
    const { limit = 50, offset = 0, type } = options || {}

    const where = {
      userId,
      ...(type && { type }),
    }

    const [credits, total] = await Promise.all([
      prisma.credit.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.credit.count({ where }),
    ])

    return {
      credits,
      total,
      limit,
      offset,
    }
  }

  /**
   * Consome créditos de um usuário
   * Registra uma transação de uso (crédito negativo)
   */
  async consumeCredits(
    userId: string,
    amount: number,
    description?: string
  ): Promise<void> {
    if (amount <= 0) {
      throw new Error('Credit amount must be positive')
    }

    const available = await this.getAvailableCredits(userId)

    if (available < amount) {
      throw new InsufficientCreditsError(available, amount)
    }

    // Registrar transação de uso (valor negativo)
    await prisma.credit.create({
      data: {
        userId,
        amount: -amount,
        type: 'usage',
        description: description || `Credit usage: ${amount} credits`,
      },
    })

    logger.info('Credits consumed', {
      userId,
      amount,
      availableAfter: available - amount,
    })
  }

  /**
   * Adiciona créditos a um usuário
   * Registra uma transação de crédito (crédito positivo)
   */
  async addCredits(
    userId: string,
    amount: number,
    type: CreditType,
    description?: string
  ): Promise<void> {
    if (amount <= 0) {
      throw new Error('Credit amount must be positive')
    }

    await prisma.credit.create({
      data: {
        userId,
        amount,
        type,
        description: description || `Credits added: ${amount} credits (${type})`,
      },
    })

    logger.info('Credits added', {
      userId,
      amount,
      type,
    })
  }

  /**
   * Renova créditos mensais para um usuário
   * Usado quando a assinatura é renovada
   */
  async renewMonthlyCredits(
    userId: string,
    monthlyCredits: number
  ): Promise<void> {
    await prisma.credit.create({
      data: {
        userId,
        amount: monthlyCredits,
        type: 'monthly_renewal',
        description: `Monthly credit renewal: ${monthlyCredits} credits`,
      },
    })

    logger.info('Monthly credits renewed', {
      userId,
      amount: monthlyCredits,
    })
  }

  /**
   * Verifica se um usuário tem créditos suficientes
   */
  async hasSufficientCredits(userId: string, required: number): Promise<boolean> {
    const available = await this.getAvailableCredits(userId)
    return available >= required
  }
}

// Exportar instância singleton
export const creditService = new CreditService()
