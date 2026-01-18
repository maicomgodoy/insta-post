import { createClient, SupabaseClient } from '@supabase/supabase-js'

// Cache dos clientes para evitar recriação
let adminClient: SupabaseClient | null = null
let publicClient: SupabaseClient | null = null

/**
 * Valida e retorna a URL do Supabase
 * Validação ocorre apenas em runtime, não em build time
 */
function getSupabaseUrl(): string {
  const url = process.env.SUPABASE_URL
  if (!url) {
    throw new Error('SUPABASE_URL is not defined')
  }
  return url
}

/**
 * Valida e retorna a service role key do Supabase
 * Validação ocorre apenas em runtime, não em build time
 */
function getSupabaseServiceRoleKey(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined')
  }
  return key
}

/**
 * Cliente Supabase para backend (service_role)
 * Tem privilégios administrativos - NUNCA exponha no frontend
 * 
 * Usa lazy initialization para evitar erros durante o build time
 */
function getSupabaseAdmin(): SupabaseClient {
  if (!adminClient) {
    const url = getSupabaseUrl()
    const key = getSupabaseServiceRoleKey()
    
    adminClient = createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  
  return adminClient
}

/**
 * Cliente Supabase público (anon key)
 * Para operações que não requerem privilégios administrativos
 * 
 * Usa lazy initialization para evitar erros durante o build time
 */
function getSupabasePublic(): SupabaseClient {
  if (!publicClient) {
    const url = getSupabaseUrl()
    const anonKey = process.env.SUPABASE_ANON_KEY || ''
    
    publicClient = createClient(url, anonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  
  return publicClient
}

/**
 * Exportações para compatibilidade com código existente
 * Agora usam lazy initialization internamente via Proxy
 * O Proxy garante que o cliente só é criado quando acessado
 */
export const supabaseAdmin = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdmin()
    const value = (client as any)[prop]
    
    // Se for uma função ou objeto, retornar diretamente
    // Isso permite acesso a propriedades aninhadas como auth.signInWithPassword
    if (typeof value === 'function') {
      return value.bind(client)
    }
    
    return value
  },
}) as SupabaseClient

export const supabasePublic = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabasePublic()
    const value = (client as any)[prop]
    
    // Se for uma função ou objeto, retornar diretamente
    if (typeof value === 'function') {
      return value.bind(client)
    }
    
    return value
  },
}) as SupabaseClient
