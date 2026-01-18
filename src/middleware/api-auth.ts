import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

/**
 * Interface para usuário autenticado
 */
export interface AuthUser {
  id: string
  email: string
}

/**
 * Extrai e valida o usuário do token JWT
 * 
 * @param request NextRequest
 * @returns Usuário autenticado ou null
 */
export async function getAuthUser(request: NextRequest): Promise<AuthUser | null> {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }
  
  const token = authHeader.substring(7)
  
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)
    
    if (error || !user) {
      return null
    }
    
    return {
      id: user.id,
      email: user.email || '',
    }
  } catch {
    return null
  }
}

/**
 * Tipo para handler autenticado
 */
export type AuthenticatedHandler = (
  request: NextRequest,
  user: AuthUser
) => Promise<NextResponse>

/**
 * HOF para proteger uma rota com autenticação
 * 
 * @param handler Handler que requer autenticação
 * @returns Handler protegido
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const user = await getAuthUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    
    return handler(request, user)
  }
}

/**
 * Tipo para handler com params dinâmicos
 */
export type AuthenticatedHandlerWithParams<T = Record<string, string>> = (
  request: NextRequest,
  user: AuthUser,
  params: T
) => Promise<NextResponse>

/**
 * HOF para proteger uma rota com autenticação e params
 */
export function withAuthAndParams<T = Record<string, string>>(
  handler: AuthenticatedHandlerWithParams<T>
) {
  return async (
    request: NextRequest,
    context: { params: Promise<T> }
  ): Promise<NextResponse> => {
    const user = await getAuthUser(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }
    
    const params = await context.params
    return handler(request, user, params)
  }
}
