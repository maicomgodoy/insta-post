import { Router, Request, Response } from 'express'
import { z } from 'zod'
import { supabaseAdmin } from '../lib/supabase'
import { prisma } from '../lib/prisma'
import { validateBody } from '../middleware/validation'
import { authenticate, AuthenticatedRequest } from '../middleware/auth'
import { logger } from '../lib/logger'
import { ApiError } from '../middleware/error-handler'

const router = Router()

// Schemas de validação
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

const refreshTokenSchema = z.object({
  refresh_token: z.string().min(1, 'Refresh token is required'),
})

/**
 * POST /api/auth/register
 * Registra um novo usuário
 */
router.post(
  '/register',
  validateBody(registerSchema),
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirmar email para simplificar MVP
      })

      if (authError || !authData.user) {
        logger.warn('Registration failed', { email, error: authError?.message })
        const error: ApiError = new Error(authError?.message || 'Registration failed')
        error.statusCode = 400
        error.code = 'REGISTRATION_ERROR'
        throw error
      }

      // Criar registro na tabela users
      try {
        await prisma.user.create({
          data: {
            id: authData.user.id,
            email: authData.user.email || email,
          },
        })
      } catch (dbError: any) {
        // Se falhar ao criar no DB, deletar o usuário do Auth
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        logger.error('Failed to create user in database', { error: dbError.message })
        throw dbError
      }

      // Gerar sessão para o novo usuário
      const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      })

      if (sessionError || !sessionData.session) {
        logger.error('Failed to create session after registration', { error: sessionError?.message })
        // Usuário foi criado, mas não conseguimos criar sessão
        res.status(201).json({
          message: 'User created successfully. Please login.',
          user: {
            id: authData.user.id,
            email: authData.user.email,
          },
        })
        return
      }

      logger.info('User registered successfully', { userId: authData.user.id, email })

      res.status(201).json({
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
      })
    } catch (error) {
      throw error
    }
  }
)

/**
 * POST /api/auth/login
 * Autentica um usuário existente
 */
router.post(
  '/login',
  validateBody(loginSchema),
  async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body

      // Autenticar com Supabase
      const { data, error } = await supabaseAdmin.auth.signInWithPassword({
        email,
        password,
      })

      if (error || !data.session || !data.user) {
        logger.warn('Login failed', { email, error: error?.message })
        const apiError: ApiError = new Error('Invalid email or password')
        apiError.statusCode = 401
        apiError.code = 'INVALID_CREDENTIALS'
        throw apiError
      }

      logger.info('User logged in successfully', { userId: data.user.id, email })

      res.json({
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
      throw error
    }
  }
)

/**
 * POST /api/auth/logout
 * Logout (requer autenticação)
 */
router.post('/logout', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader?.substring(7) // Remove "Bearer "

    if (token) {
      // Revogar sessão no Supabase
      await supabaseAdmin.auth.admin.signOut(token, 'global')
    }

    logger.info('User logged out', { userId: req.user?.id })

    res.json({
      message: 'Logout successful',
    })
  } catch (error) {
    throw error
  }
})

/**
 * POST /api/auth/refresh
 * Atualiza o access token usando o refresh token
 */
router.post(
  '/refresh',
  validateBody(refreshTokenSchema),
  async (req: Request, res: Response) => {
    try {
      const { refresh_token } = req.body

      // Atualizar sessão com refresh token
      const { data, error } = await supabaseAdmin.auth.refreshSession({
        refresh_token,
      })

      if (error || !data.session) {
        logger.warn('Token refresh failed', { error: error?.message })
        const apiError: ApiError = new Error('Invalid refresh token')
        apiError.statusCode = 401
        apiError.code = 'INVALID_REFRESH_TOKEN'
        throw apiError
      }

      res.json({
        session: {
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at,
        },
      })
    } catch (error) {
      throw error
    }
  }
)

/**
 * GET /api/auth/me
 * Retorna informações do usuário autenticado (requer autenticação)
 */
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // O middleware authenticate garante que req.user existe
    const userId = req.user!.id
    
    // Buscar dados completos do usuário no banco
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      const error: ApiError = new Error('User not found')
      error.statusCode = 404
      error.code = 'USER_NOT_FOUND'
      throw error
    }

    res.json({
      user,
    })
  } catch (error) {
    throw error
  }
})

export const authRoutes = router
