/**
 * Erros customizados da API
 */

export interface ApiError extends Error {
  statusCode: number
  code: string
}

/**
 * Cria um erro de API padronizado
 */
export function createApiError(
  message: string,
  statusCode: number,
  code: string
): ApiError {
  const error = new Error(message) as ApiError
  error.statusCode = statusCode
  error.code = code
  return error
}

/**
 * Erro quando usuário não tem créditos suficientes
 */
export class InsufficientCreditsError extends Error {
  constructor(
    public available: number,
    public required: number
  ) {
    super(`Insufficient credits: ${available} available, ${required} required`)
    this.name = 'InsufficientCreditsError'
  }
}
