import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

/**
 * Health check endpoint
 * Verifica se o servidor e banco de dados estão funcionando
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    // Testar conexão com o banco
    await prisma.$queryRaw`SELECT 1`
    
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'insta-post-api',
      database: 'connected',
    })
  } catch (error) {
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'insta-post-api',
      database: 'disconnected',
      error: process.env.NODE_ENV === 'development' 
        ? (error as Error).message 
        : 'Database connection failed',
    })
  }
})

export const healthRoutes = router
