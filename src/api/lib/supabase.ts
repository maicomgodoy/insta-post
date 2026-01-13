import { createClient } from '@supabase/supabase-js'
import { logger } from './logger'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('SUPABASE_URL is not defined')
}

if (!supabaseServiceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined')
}

/**
 * Cliente Supabase para backend (service_role)
 * Tem privilégios administrativos - NUNCA exponha no frontend
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

/**
 * Cliente Supabase público (anon key)
 * Para operações que não requerem privilégios administrativos
 */
export const supabasePublic = createClient(
  supabaseUrl,
  process.env.SUPABASE_ANON_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

logger.info('Supabase clients initialized', {
  url: supabaseUrl.substring(0, 30) + '...',
  hasServiceRoleKey: !!supabaseServiceRoleKey,
})
