import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { withAuth } from '@/middleware/api-auth'

/**
 * GET /api/social-accounts/connect/instagram
 * Inicia o fluxo OAuth do Instagram (requer autenticação)
 * Retorna a URL de autorização para redirecionar o usuário
 */
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const clientId = process.env.INSTAGRAM_CLIENT_ID
    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI
    
    if (!clientId || !redirectUri) {
      logger.error('Instagram OAuth not configured', {
        hasClientId: !!clientId,
        hasRedirectUri: !!redirectUri,
      })
      return NextResponse.json(
        { error: 'Instagram OAuth not configured', code: 'OAUTH_NOT_CONFIGURED' },
        { status: 500 }
      )
    }
    
    // Gerar state para prevenir CSRF
    const state = Buffer.from(JSON.stringify({
      userId: user.id,
      timestamp: Date.now(),
    })).toString('base64')
    
    // Permissões necessárias para Instagram Graph API (via Facebook)
    const scopes = [
      'instagram_basic',
      'instagram_content_publish',
      'pages_show_list',
      'pages_read_engagement',
    ].join(',')
    
    // URL de autorização do Facebook (para Instagram Business/Creator accounts)
    // Nota: Instagram Graph API requer autenticação via Facebook OAuth
    // pois contas Instagram Business/Creator precisam estar vinculadas a uma Página do Facebook
    const authUrl = new URL('https://www.facebook.com/v21.0/dialog/oauth')
    authUrl.searchParams.set('client_id', clientId)
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('state', state)
    authUrl.searchParams.set('scope', scopes)
    authUrl.searchParams.set('response_type', 'code')
    // Parâmetros para melhorar a experiência do usuário
    authUrl.searchParams.set('display', 'page') // Exibe em página completa
    authUrl.searchParams.set('auth_type', 'rerequest') // Solicita permissões novamente se necessário
    // Forçar a tela de permissões mesmo se já autorizado
    authUrl.searchParams.set('prompt', 'consent') // Força a tela de consentimento/permissões
    
    logger.info('Instagram OAuth initiated', {
      userId: user.id,
      redirectUri,
    })
    
    return NextResponse.json({
      authUrl: authUrl.toString(),
    })
  } catch (error) {
    logger.error('Failed to initiate Instagram OAuth', {
      userId: user.id,
      error: (error as Error).message,
    })
    return NextResponse.json(
      { error: 'Failed to initiate OAuth', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
})
