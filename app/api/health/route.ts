import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * GET /api/health
 * Health check endpoint - verifica se o servidor e banco de dados estão funcionando
 */
export async function GET() {
  try {
    // Testar conexão com o banco
    await prisma.$queryRaw`SELECT 1`
    
    return NextResponse.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'insta-post-api',
      database: 'connected',
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        service: 'insta-post-api',
        database: 'disconnected',
        error: process.env.NODE_ENV === 'development' 
          ? (error as Error).message 
          : 'Database connection failed',
      },
      { status: 503 }
    )
  }
}
