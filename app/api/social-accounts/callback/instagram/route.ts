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
    
    // 2. Obter páginas do Facebook e encontrar Instagram Business Account
    const pagesResponse = await fetch(
      `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${shortLivedToken}`
    )
    
    if (!pagesResponse.ok) {
      const errorData = await pagesResponse.json()
      logger.error('Failed to get Facebook pages', { error: errorData })
      return NextResponse.json(
        { error: 'Falha ao obter páginas do Facebook', code: 'PAGES_FETCH_FAILED' },
        { status: 400 }
      )
    }
    
    const pagesData = await pagesResponse.json() as FacebookPagesResponse
    
    // Encontrar a primeira página com Instagram Business Account
    const pageWithInstagram = pagesData.data.find(
      (page) => page.instagram_business_account
    )
    
    if (!pageWithInstagram || !pageWithInstagram.instagram_business_account) {
      return NextResponse.json(
        {
          error: 'Nenhuma conta Instagram Business/Creator encontrada. Conecte uma conta Instagram à sua Página do Facebook.',
          code: 'NO_INSTAGRAM_ACCOUNT',
        },
        { status: 400 }
      )
    }
    
    const instagramAccountId = pageWithInstagram.instagram_business_account.id
    const pageAccessToken = pageWithInstagram.access_token
    
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
