import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { withAuth } from '@/middleware/api-auth'

/**
 * GET /api/auth/me
 * Retorna informações do usuário autenticado (requer autenticação)
 */
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    // Buscar dados completos do usuário no banco
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    
    if (!userData) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      user: userData,
    })
  } catch (error) {
    logger.error('Get user error', { error: (error as Error).message })
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
})
