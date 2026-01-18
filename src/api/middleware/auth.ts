import { Request, Response, NextFunction } from 'express'
import { supabaseAdmin } from '../lib/supabase'
import { ApiError, createApiError } from './error-handler'
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
      throw createApiError('Unauthorized: Missing or invalid token', 401, 'UNAUTHORIZED')
    }

    const token = authHeader.substring(7) // Remove "Bearer "

    // Verificar token com Supabase
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

    if (error || !user) {
      throw createApiError('Unauthorized: Invalid token', 401, 'INVALID_TOKEN')
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
      next(createApiError('Authentication failed', 401, 'AUTH_ERROR'))
    }
  }
}
