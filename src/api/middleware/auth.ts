import { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '../lib/supabase'
import { ApiError } from './error-handler'
import { logger } from '../lib/logger'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
  }
}

/**
 * Middleware de autenticação
 * Verifica o token JWT do Supabase e adiciona o usuário à requisição
 */
export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Obter token do header Authorization
    const authHeader = req.headers.authorization
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error: ApiError = new Error('Unauthorized: Missing or invalid token')
      error.statusCode = 401
      error.code = 'UNAUTHORIZED'
      throw error
    }

    const token = authHeader.substring(7) // Remove "Bearer "

    // Verificar token com Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      const apiError: ApiError = new Error('Unauthorized: Invalid token')
      apiError.statusCode = 401
      apiError.code = 'INVALID_TOKEN'
      throw apiError
    }

    // Adicionar usuário à requisição
    req.user = {
      id: user.id,
      email: user.email || '',
    }

    next()
  } catch (error) {
    if ((error as ApiError).statusCode) {
      next(error)
    } else {
      logger.error('Authentication error', {
        path: req.path,
        error: (error as Error).message,
      })
      const apiError: ApiError = new Error('Authentication failed')
      apiError.statusCode = 401
      apiError.code = 'AUTH_ERROR'
      next(apiError)
    }
  }
}
