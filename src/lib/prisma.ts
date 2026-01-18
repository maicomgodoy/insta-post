import { PrismaClient } from '@prisma/client'
import { logger } from './logger'

/**
 * Cliente Prisma singleton
 * Reutiliza a mesma instância em toda a aplicação
 * 
 * Para Next.js, usamos o padrão de global singleton para evitar
 * múltiplas instâncias durante hot reload
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn']
    : ['error'],
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Log de conexão (apenas uma vez)
if (!globalForPrisma.prisma) {
  prisma.$connect()
    .then(() => {
      logger.info('Prisma connected to database')
    })
    .catch((error: unknown) => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      logger.error('Failed to connect to database', { error: errorMessage })
    })
}
