import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { logger } from '@/lib/logger'
import { validateBody, validationErrorResponse } from '@/middleware/api-validation'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

/**
 * POST /api/auth/login
 * Autentica um usuário existente
 */
export async function POST(request: NextRequest) {
  try {
    const validation = await validateBody(request, loginSchema)
    
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }
    
    const { email, password } = validation.data
    
    // Autenticar com Supabase
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error || !data.session || !data.user) {
      logger.warn('Login failed', { email, error: error?.message })
      return NextResponse.json(
        { error: 'Invalid email or password', code: 'INVALID_CREDENTIALS' },
        { status: 401 }
      )
    }
    
    logger.info('User logged in successfully', { userId: data.user.id, email })
    
    return NextResponse.json({
      message: 'Login successful',
      user: {
        id: data.user.id,
        email: data.user.email,
      },
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
      },
    })
  } catch (error) {
    logger.error('Login error', { error: (error as Error).message })
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
