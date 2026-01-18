import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { logger } from '../lib/logger'

/**
 * Interface para erros da API (compatibilidade com padrão antigo)
 */
export interface ApiError extends Error {
  statusCode?: number
  code?: string
}

/**
 * Classe de erro customizado para a API
 */
export class AppError extends Error implements ApiError {
  statusCode: number
  code?: string

  constructor(message: string, statusCode = 500, code?: string) {
    super(message)
    this.name = 'AppError'
    this.statusCode = statusCode
    this.code = code
  }
}

/**
 * Função helper para criar erros da API
 */
export function createApiError(message: string, statusCode = 500, code?: string): ApiError {
  const error: ApiError = new Error(message)
  error.statusCode = statusCode
  error.code = code
  return error
}

/**
 * Middleware de tratamento de erros
 * Deve ser o último middleware na cadeia
 */
export function errorHandler(
  err: ApiError | ZodError | Error,
  req: Request,
  res: Response,
  _next: NextFunction // eslint-disable-line @typescript-eslint/no-unused-vars
): void {
  // Erro de validação Zod
  if (err instanceof ZodError) {
    const statusCode = 400
    logger.warn('Validation error', {
      path: req.path,
      errors: err.errors,
    })
    
    res.status(statusCode).json({
      error: 'Validation error',
      message: 'Invalid request data',
      details: err.errors,
    })
    return
  }

  // Erro customizado da API
  if ('statusCode' in err && err.statusCode) {
    const statusCode = err.statusCode
    logger.error('API error', {
      path: req.path,
      statusCode,
      message: err.message,
      code: err.code,
    })
    
    res.status(statusCode).json({
      error: err.message,
      code: err.code,
    })
    return
  }

  // Erro genérico
  logger.error('Unhandled error', {
    path: req.path,
    message: err.message,
    stack: err.stack,
  })
  
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  })
}
