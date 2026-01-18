import { NextRequest, NextResponse } from 'next/server'
import { z, ZodError } from 'zod'

/**
 * Resultado da validação
 */
export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; error: ZodError }

/**
 * Valida o body de uma requisição contra um schema Zod
 * 
 * @param request NextRequest
 * @param schema Schema Zod
 * @returns Resultado da validação
 */
export async function validateBody<T>(
  request: NextRequest,
  schema: z.Schema<T>
): Promise<ValidationResult<T>> {
  try {
    const body = await request.json()
    const result = schema.safeParse(body)
    
    if (!result.success) {
      return { success: false, error: result.error }
    }
    
    return { success: true, data: result.data }
  } catch {
    // Se falhar ao parsear JSON, retornar erro de validação
    const error = new ZodError([
      {
        code: 'custom',
        path: [],
        message: 'Invalid JSON body',
      },
    ])
    return { success: false, error }
  }
}

/**
 * Valida query params contra um schema Zod
 * 
 * @param request NextRequest
 * @param schema Schema Zod
 * @returns Resultado da validação
 */
export function validateQuery<T>(
  request: NextRequest,
  schema: z.Schema<T>
): ValidationResult<T> {
  const searchParams = request.nextUrl.searchParams
  const queryObject: Record<string, string> = {}
  
  searchParams.forEach((value, key) => {
    queryObject[key] = value
  })
  
  const result = schema.safeParse(queryObject)
  
  if (!result.success) {
    return { success: false, error: result.error }
  }
  
  return { success: true, data: result.data }
}

/**
 * Valida params dinâmicos da rota contra um schema Zod
 * 
 * @param params Params da rota
 * @param schema Schema Zod
 * @returns Resultado da validação
 */
export function validateParams<T>(
  params: Record<string, string>,
  schema: z.Schema<T>
): ValidationResult<T> {
  const result = schema.safeParse(params)
  
  if (!result.success) {
    return { success: false, error: result.error }
  }
  
  return { success: true, data: result.data }
}

/**
 * Formata erros de validação para resposta da API
 * 
 * @param error ZodError
 * @returns Objeto formatado para resposta
 */
export function formatValidationError(error: ZodError) {
  return {
    error: 'Validation failed',
    code: 'VALIDATION_ERROR',
    details: error.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    })),
  }
}

/**
 * Retorna resposta de erro de validação
 */
export function validationErrorResponse(error: ZodError): NextResponse {
  return NextResponse.json(formatValidationError(error), { status: 400 })
}
