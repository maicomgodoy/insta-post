import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { validateBody, validationErrorResponse } from '@/middleware/api-validation'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

/**
 * POST /api/auth/register
 * Registra um novo usuário
 */
export async function POST(request: NextRequest) {
  try {
    const validation = await validateBody(request, registerSchema)
    
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }
    
    const { email, password } = validation.data
    
    // Criar usuário no Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmar email para simplificar MVP
    })
    
    if (authError || !authData.user) {
      logger.warn('Registration failed', { email, error: authError?.message })
      return NextResponse.json(
        { error: authError?.message || 'Registration failed', code: 'REGISTRATION_ERROR' },
        { status: 400 }
      )
    }
    
    // Criar registro na tabela users
    try {
      await prisma.user.create({
        data: {
          id: authData.user.id,
          email: authData.user.email || email,
        },
      })
    } catch (dbError) {
      // Se falhar ao criar no DB, deletar o usuário do Auth
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      logger.error('Failed to create user in database', { error: (dbError as Error).message })
      return NextResponse.json(
        { error: 'Failed to create user', code: 'DATABASE_ERROR' },
        { status: 500 }
      )
    }
    
    // Gerar sessão para o novo usuário
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    })
    
    if (sessionError || !sessionData.session) {
      logger.error('Failed to create session after registration', { error: sessionError?.message })
      // Usuário foi criado, mas não conseguimos criar sessão
      return NextResponse.json(
        {
          message: 'User created successfully. Please login.',
          user: {
            id: authData.user.id,
            email: authData.user.email,
          },
        },
        { status: 201 }
      )
    }
    
    logger.info('User registered successfully', { userId: authData.user.id, email })
    
    return NextResponse.json(
      {
        message: 'User registered successfully',
        user: {
          id: authData.user.id,
          email: authData.user.email,
        },
        session: {
          access_token: sessionData.session.access_token,
          refresh_token: sessionData.session.refresh_token,
          expires_at: sessionData.session.expires_at,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    logger.error('Registration error', { error: (error as Error).message })
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
}
