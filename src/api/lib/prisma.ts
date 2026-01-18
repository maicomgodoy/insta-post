import { PrismaClient } from '@prisma/client'
import { logger } from './logger'

/**
 * Cliente Prisma singleton
 * Reutiliza a mesma instância em toda a aplicação
 */
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn']
    : ['error'],
})

// Log de conexão
prisma.$connect()
  .then(() => {
    logger.info('Prisma connected to database')
  })
  .catch((error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    logger.error('Failed to connect to database', { error: errorMessage })
  })

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
  logger.info('Prisma disconnected')
})
