import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { validateBody, validationErrorResponse } from '@/middleware/api-validation'

const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required'),
})

/**
 * POST /api/auth/refresh
 * Atualiza o access token usando o refresh token
 */
export async function POST(request: NextRequest) {
  try {
    const validation = await validateBody(request, refreshTokenSchema)
    
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }
    
    const { refresh_token } = validation.data
    
    // Atualizar sessão com refresh token
    const { data, error } = await supabaseAdmin.auth.refreshSession({
      refresh_token,
    })
    
    if (error || !data.session) {
      logger.warn('Token refresh failed', { error: error?.message })
      return NextResponse.json(
        { error: 'Invalid refresh token', code: 'INVALID_REFRESH_TOKEN' },
        { status: 401 }
      )
    }
    
    return NextResponse.json({
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    })
  } catch (error) {
    logger.error('Token refresh error', { error: (error as Error).message })
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
