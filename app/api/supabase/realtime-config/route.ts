import { NextRequest, NextResponse } from 'next/server'
import { validateApiAuth } from '@/src/middleware/api-auth'

export const dynamic = 'force-dynamic'

/**
 * GET /api/supabase/realtime-config
 * Retorna as credenciais necessárias para conectar ao Supabase Realtime
 * Apenas para usuários autenticados - não expõe chaves no frontend
 */
export async function GET(request: NextRequest) {
  try {
    // Validar autenticação
    const authResult = await validateApiAuth(request)
    if (!authResult.success) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      )
    }

    // Retornar apenas as credenciais necessárias para Realtime
    // A URL do Supabase pode ser pública, mas a anon key não deve ser exposta diretamente
    // Porém, para Realtime funcionar, precisamos da anon key
    // Solução: retornar via API autenticada
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase configuration not found' },
        { status: 500 }
      )
    }

    // Retornar credenciais para o cliente autenticado
    return NextResponse.json({
      url: supabaseUrl,
      anonKey: supabaseAnonKey,
    })
  } catch (error) {
    console.error('[supabase-realtime-config]', error)
    return NextResponse.json(
      {
        error: 'Failed to get Supabase Realtime config',
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
