import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { logger } from '../lib/logger'

export interface ApiError extends Error {
  statusCode?: number
  code?: string
}

/**
 * Middleware de tratamento de erros
 * Deve ser o último middleware na cadeia
 */
export function errorHandler(
  err: ApiError | ZodError | Error,
  req: Request,
  res: Response,
  next: NextFunction
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
