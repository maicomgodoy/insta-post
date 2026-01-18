import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { withAuth } from '@/middleware/api-auth'

/**
 * POST /api/auth/logout
 * Logout (requer autenticação)
 */
export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.substring(7) // Remove "Bearer "
    
    if (token) {
      // Revogar sessão no Supabase
      await supabaseAdmin.auth.admin.signOut(token, 'global')
    }
    
    logger.info('User logged out', { userId: user.id })
    
    return NextResponse.json({
      message: 'Logout successful',
    })
  } catch (error) {
    logger.error('Logout error', { error: (error as Error).message })
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
})
