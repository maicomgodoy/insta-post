import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { withAuth } from '@/middleware/api-auth'
import { validateBody, validationErrorResponse } from '@/middleware/api-validation'

const callbackSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().optional(),
})

interface FacebookTokenResponse {
  access_token: string
  token_type: string
}

interface FacebookPage {
  id: string
  name: string
  access_token: string
  instagram_business_account?: {
    id: string
  }
}

interface FacebookPagesResponse {
  data: FacebookPage[]
}

interface InstagramProfile {
  id: string
  username: string
}

interface LongLivedTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

/**
 * POST /api/social-accounts/callback/instagram
 * Processa o callback do OAuth do Instagram (requer autenticação)
 */
export const POST = withAuth(async (request: NextRequest, user) => {
  try {
    const validation = await validateBody(request, callbackSchema)
    
    if (!validation.success) {
      return validationErrorResponse(validation.error)
    }
    
    const { code } = validation.data
    
    const clientId = process.env.INSTAGRAM_CLIENT_ID
    const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET
    const redirectUri = process.env.INSTAGRAM_REDIRECT_URI
    
    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.json(
        { error: 'Instagram OAuth not configured', code: 'OAUTH_NOT_CONFIGURED' },
        { status: 500 }
      )
    }
    
    // 1. Trocar código por access token (Facebook OAuth)
    const tokenUrl = new URL('https://graph.facebook.com/v21.0/oauth/access_token')
    tokenUrl.searchParams.set('client_id', clientId)
    tokenUrl.searchParams.set('client_secret', clientSecret)
    tokenUrl.searchParams.set('redirect_uri', redirectUri)
    tokenUrl.searchParams.set('code', code)
    
    const tokenResponse = await fetch(tokenUrl.toString())
    
    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json()
      logger.error('Failed to exchange code for token', { error: errorData })
      return NextResponse.json(
        { error: 'Falha ao obter token de acesso', code: 'TOKEN_EXCHANGE_FAILED' },
        { status: 400 }
      )
    }
    
    const tokenData = await tokenResponse.json() as FacebookTokenResponse
    const shortLivedToken = tokenData.access_token
    
    // Debug: Verificar permissões do token (apenas em desenvolvimento)
    if (process.env.NODE_ENV === 'development') {
      try {
        const debugTokenResponse = await fetch(
          `https://graph.facebook.com/v21.0/debug_token?input_token=${shortLivedToken}&access_token=${shortLivedToken}`
        )
        if (debugTokenResponse.ok) {
          const debugData = await debugTokenResponse.json()
          logger.info('Token debug info', {
            scopes: debugData.data?.scopes || [],
            userId: debugData.data?.user_id,
          })
        }
      } catch (error) {
        // Ignorar erro de debug
      }
    }
    
    // 2. Obter páginas do Facebook e encontrar Instagram Business Account
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${shortLivedToken}`
    )
    
    const pagesData = await pagesResponse.json()
    
    // Log completo da resposta para debug
    logger.info('Facebook pages API response', {
      status: pagesResponse.status,
      statusText: pagesResponse.statusText,
      hasData: !!pagesData.data,
      dataLength: pagesData.data?.length || 0,
      fullResponse: pagesData,
    })
    
    if (!pagesResponse.ok) {
      logger.error('Failed to get Facebook pages', { error: pagesData })
      return NextResponse.json(
        { error: 'Falha ao obter páginas do Facebook', code: 'PAGES_FETCH_FAILED', details: pagesData },
        { status: 400 }
      )
    }
    
    const typedPagesData = pagesData as FacebookPagesResponse
    
    // Log para debug - ver o que a API retornou
    logger.info('Facebook pages fetched', {
      pagesCount: typedPagesData.data?.length || 0,
      pages: typedPagesData.data?.map((page) => ({
        id: page.id,
        name: page.name,
        hasInstagramAccount: !!page.instagram_business_account,
      })),
    })
    
    // Se não retornou nenhuma página, o problema é que a página não está conectada ao app
    if (!typedPagesData.data || typedPagesData.data.length === 0) {
      logger.warn('No Facebook pages returned - possible causes', {
        hasPagesShowListPermission: true,
        appMode: 'Verify if app is in Live mode (not Development mode)',
        hint: 'If app is in Development mode, /me/accounts may return empty array even with permissions granted',
      })
      
      return NextResponse.json(
        {
          error: 'Nenhuma página do Facebook encontrada. Possíveis causas: 1) App em modo de desenvolvimento (precisa estar em Live), 2) Página não conectada ao app, 3) Permissões não propagadas ainda.',
          code: 'NO_PAGES_FOUND',
          hint: 'Verifique se o app está em modo Live (não Development) no painel do Facebook Developer. Em modo Development, o endpoint pode retornar vazio mesmo com permissões.',
          troubleshooting: [
            'Verifique o modo do app: https://developers.facebook.com/apps/ → Seu App → Settings → Basic → App Mode',
            'Se estiver em Development, adicione sua conta como Tester em Roles → Roles',
            'Ou coloque o app em modo Live (requer App Review)',
          ],
        },
        { status: 400 }
      )
    }
    
    // Encontrar a primeira página com Instagram Business Account
    const pageWithInstagram = typedPagesData.data.find(
      (page) => page.instagram_business_account
    )
    
    if (!pageWithInstagram || !pageWithInstagram.instagram_business_account) {
      logger.warn('No Instagram account found on any Facebook page', {
        pagesCount: typedPagesData.data?.length || 0,
        pagesIds: typedPagesData.data?.map((p) => p.id) || [],
        pages: typedPagesData.data?.map((p) => ({ id: p.id, name: p.name })),
      })
      
      return NextResponse.json(
        {
          error: 'Nenhuma conta Instagram Business/Creator encontrada nas suas páginas do Facebook. Verifique se: 1) Sua conta Instagram é Business ou Creator, 2) Está vinculada à sua Página do Facebook, 3) Você é administrador da página.',
          code: 'NO_INSTAGRAM_ACCOUNT',
          debug: process.env.NODE_ENV === 'development' ? {
            pagesFound: typedPagesData.data?.length || 0,
            pages: typedPagesData.data?.map((p) => ({ id: p.id, name: p.name })),
          } : undefined,
        },
        { status: 400 }
      )
    }
    
    const instagramAccountId = pageWithInstagram.instagram_business_account.id
    const pageAccessToken = pageWithInstagram.access_token
    
    logger.info('Found page with Instagram account', {
      pageId: pageWithInstagram.id,
      pageName: pageWithInstagram.name,
      instagramAccountId,
    })
    
    // 3. Obter informações do perfil do Instagram
    const profileResponse = await fetch(
      `https://graph.facebook.com/v21.0/${instagramAccountId}?fields=id,username&access_token=${pageAccessToken}`
    )
    
    if (!profileResponse.ok) {
      const errorData = await profileResponse.json()
      logger.error('Failed to get Instagram profile', { error: errorData })
      return NextResponse.json(
        { error: 'Falha ao obter perfil do Instagram', code: 'PROFILE_FETCH_FAILED' },
        { status: 400 }
      )
    }
    
    const profileData = await profileResponse.json() as InstagramProfile
    
    // 4. Trocar por token de longa duração
    const longLivedTokenResponse = await fetch(
      `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${shortLivedToken}`
    )
    
    if (!longLivedTokenResponse.ok) {
      const errorData = await longLivedTokenResponse.json()
      logger.error('Failed to get long-lived token', { error: errorData })
      // Continuar mesmo sem token de longa duração
    }
    
    let accessToken = pageAccessToken
    let tokenExpiresAt: Date | null = null
    
    if (longLivedTokenResponse.ok) {
      const longLivedTokenData = await longLivedTokenResponse.json() as LongLivedTokenResponse
      accessToken = longLivedTokenData.access_token
      tokenExpiresAt = new Date(Date.now() + longLivedTokenData.expires_in * 1000)
    }
    
    // 5. Salvar ou atualizar conta no banco de dados
    const existingAccount = await prisma.socialAccount.findFirst({
      where: {
        userId: user.id,
        platform: 'instagram',
        accountId: instagramAccountId,
      },
    })
    
    let account
    if (existingAccount) {
      // Atualizar conta existente
      account = await prisma.socialAccount.update({
        where: { id: existingAccount.id },
        data: {
          accessToken,
          tokenExpiresAt,
          accountUsername: profileData.username,
          isActive: true,
        },
      })
    } else {
      // Criar nova conta
      account = await prisma.socialAccount.create({
        data: {
          userId: user.id,
          platform: 'instagram',
          accountId: instagramAccountId,
          accountUsername: profileData.username,
          accessToken,
          tokenExpiresAt,
          isActive: true,
        },
      })
    }
    
    logger.info('Instagram account connected', {
      userId: user.id,
      accountId: instagramAccountId,
      username: profileData.username,
    })
    
    return NextResponse.json({
      message: 'Conta do Instagram conectada com sucesso',
      account: {
        id: account.id,
        platform: account.platform,
        accountId: account.accountId,
        accountUsername: account.accountUsername,
        isTokenExpired: false,
        createdAt: account.createdAt,
      },
    })
  } catch (error) {
    logger.error('Failed to complete Instagram OAuth', {
      userId: user.id,
      error: (error as Error).message,
    })
    return NextResponse.json(
      { error: 'Failed to connect Instagram account', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
})
