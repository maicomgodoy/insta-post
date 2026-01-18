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

interface FacebookBusiness {
  id: string
  name: string
}

interface FacebookBusinessesResponse {
  data: FacebookBusiness[]
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
    
    // 2. FLUXO ATUALIZADO: Usar /me/businesses + /owned_pages (compatível com NPE + Business Manager)
    // Passo 2.1: Obter businesses que o usuário tem acesso
    const businessesResponse = await fetch(
      `https://graph.facebook.com/v21.0/me/businesses?fields=id,name&access_token=${shortLivedToken}`
    )
    
    let businessesData: FacebookBusinessesResponse
    try {
      const responseData = await businessesResponse.json()
      
      if (!businessesResponse.ok) {
        logger.error('Failed to get Facebook businesses', { error: responseData })
        return NextResponse.json(
          { error: 'Falha ao obter businesses do Facebook', code: 'BUSINESSES_FETCH_FAILED', details: responseData },
          { status: 400 }
        )
      }
      
      businessesData = responseData as FacebookBusinessesResponse
    } catch (parseError) {
      logger.error('Failed to parse businesses response', { error: parseError })
      return NextResponse.json(
        { error: 'Erro ao processar resposta da API do Facebook', code: 'BUSINESSES_PARSE_FAILED' },
        { status: 400 }
      )
    }
    
    // Validar estrutura da resposta
    if (!businessesData || !Array.isArray(businessesData.data)) {
      logger.error('Invalid businesses response structure', { response: businessesData })
      return NextResponse.json(
        { error: 'Resposta inválida da API do Facebook', code: 'BUSINESSES_INVALID_RESPONSE' },
        { status: 400 }
      )
    }
    
    logger.info('Facebook businesses fetched', {
      businessesCount: businessesData.data.length,
      businesses: businessesData.data.map((b) => ({ id: b.id, name: b.name })),
    })
    
    // Passo 2.2: Buscar páginas em cada business via /owned_pages
    let pageWithInstagram: FacebookPage | null = null
    
    if (businessesData.data.length > 0) {
      // Iterar sobre todos os businesses para encontrar páginas com Instagram
      for (const business of businessesData.data) {
        try {
          const ownedPagesResponse = await fetch(
            `https://graph.facebook.com/v21.0/${business.id}/owned_pages?fields=id,name,access_token,instagram_business_account&access_token=${shortLivedToken}`
          )
          
          let ownedPagesData: FacebookPagesResponse
          try {
            const responseData = await ownedPagesResponse.json()
            
            if (!ownedPagesResponse.ok) {
              logger.warn(`Failed to get owned_pages for business ${business.id}`, { error: responseData })
              continue // Tentar próximo business
            }
            
            ownedPagesData = responseData as FacebookPagesResponse
          } catch (parseError) {
            logger.warn(`Failed to parse owned_pages for business ${business.id}`, { error: parseError })
            continue
          }
          
          // Validar estrutura da resposta
          if (!ownedPagesData || !Array.isArray(ownedPagesData.data)) {
            logger.warn(`Invalid owned_pages response for business ${business.id}`, { response: ownedPagesData })
            continue
          }
          
          logger.info(`Owned pages for business ${business.id}`, {
            businessId: business.id,
            businessName: business.name,
            pagesCount: ownedPagesData.data.length,
          })
          
          // Encontrar página com Instagram Business Account
          const foundPage = ownedPagesData.data.find(
            (page) => page.instagram_business_account && page.instagram_business_account.id
          )
          
          if (foundPage) {
            pageWithInstagram = foundPage
            logger.info('Found page with Instagram account', {
              businessId: business.id,
              pageId: foundPage.id,
              pageName: foundPage.name,
              instagramAccountId: foundPage.instagram_business_account?.id,
            })
            break // Encontrou, pode parar
          }
        } catch (error) {
          logger.warn(`Error fetching owned_pages for business ${business.id}`, {
            error: (error as Error).message,
          })
          continue // Continuar para próximo business
        }
      }
    }
    
    // Fallback: Se não encontrou via businesses, tentar /me/accounts (para compatibilidade com casos antigos)
    // NOTA: Este é um fallback e pode retornar vazio com NPE + Business Manager
    if (!pageWithInstagram) {
      logger.info('No page found via businesses, trying fallback /me/accounts')
      try {
        const fallbackPagesResponse = await fetch(
          `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${shortLivedToken}`
        )
        
        if (fallbackPagesResponse.ok) {
          try {
            const fallbackPagesData = await fallbackPagesResponse.json() as FacebookPagesResponse
            if (fallbackPagesData && Array.isArray(fallbackPagesData.data)) {
              pageWithInstagram = fallbackPagesData.data.find(
                (page) => page.instagram_business_account && page.instagram_business_account.id
              ) || null
            }
          } catch (parseError) {
            logger.warn('Failed to parse fallback /me/accounts response', { error: parseError })
          }
        }
      } catch (error) {
        logger.warn('Fallback /me/accounts failed', { error: (error as Error).message })
      }
    }
    
    // Validação final: verificar se encontrou página com Instagram
    if (!pageWithInstagram || !pageWithInstagram.instagram_business_account || !pageWithInstagram.instagram_business_account.id) {
      logger.warn('No Instagram account found via businesses or fallback', {
        businessesChecked: businessesData.data.length,
        businesses: businessesData.data.map((b) => ({ id: b.id, name: b.name })),
      })
      
      return NextResponse.json(
        {
          error: 'Nenhuma conta Instagram Business/Creator encontrada. Verifique se: 1) Sua conta Instagram é Business ou Creator, 2) Está vinculada à sua Página do Facebook através de um Business Manager, 3) Você tem acesso ao Business Manager, 4) Permissões business_management foram concedidas.',
          code: 'NO_INSTAGRAM_ACCOUNT',
          hint: 'O fluxo atualizado usa /me/businesses + /owned_pages. Se você não vê seus businesses, verifique as permissões no painel da Meta.',
          troubleshooting: [
            'Verifique se o app tem a permissão business_management',
            'Confirme que sua página está conectada a um Business Manager',
            'Verifique se você tem acesso administrativo ao Business Manager',
            'Se necessário, reconecte a conta para garantir que todas as permissões foram concedidas',
          ],
          debug: process.env.NODE_ENV === 'development' ? {
            businessesFound: businessesData.data.length,
            businesses: businessesData.data.map((b) => ({ id: b.id, name: b.name })),
          } : undefined,
        },
        { status: 400 }
      )
    }
    
    const instagramAccountId = pageWithInstagram.instagram_business_account.id
    const pageAccessToken = pageWithInstagram.access_token
    
    // Log final: página encontrada com Instagram
    logger.info('Instagram Business Account discovered via new flow', {
      pageId: pageWithInstagram.id,
      pageName: pageWithInstagram.name,
      instagramAccountId,
      flow: 'me/businesses -> owned_pages',
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
    
    let accessToken = pageAccessToken
    let tokenExpiresAt: Date | null = null
    
    if (longLivedTokenResponse.ok) {
      try {
        const longLivedTokenData = await longLivedTokenResponse.json() as LongLivedTokenResponse
        
        if (longLivedTokenData.access_token) {
          accessToken = longLivedTokenData.access_token
        }
        
        // Validar expires_in antes de criar Date
        if (longLivedTokenData.expires_in && typeof longLivedTokenData.expires_in === 'number' && longLivedTokenData.expires_in > 0) {
          const expirationTimestamp = Date.now() + longLivedTokenData.expires_in * 1000
          const expirationDate = new Date(expirationTimestamp)
          
          // Validar se a data foi criada corretamente
          if (!isNaN(expirationDate.getTime())) {
            tokenExpiresAt = expirationDate
          } else {
            logger.warn('Invalid expiration date calculated', {
              expires_in: longLivedTokenData.expires_in,
              calculatedTimestamp: expirationTimestamp,
            })
          }
        }
      } catch (parseError) {
        logger.warn('Failed to parse long-lived token response', { error: parseError })
        // Continuar com pageAccessToken mesmo se falhar
      }
    } else {
      try {
        const errorData = await longLivedTokenResponse.json()
        logger.warn('Failed to get long-lived token', { error: errorData })
      } catch {
        // Ignorar erro ao parsear resposta de erro
      }
      // Continuar mesmo sem token de longa duração (usando pageAccessToken)
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    
    logger.error('Failed to complete Instagram OAuth', {
      userId: user.id,
      error: errorMessage,
      stack: errorStack,
      errorDetails: process.env.NODE_ENV === 'development' ? error : undefined,
    })
    
    return NextResponse.json(
      { 
        error: 'Falha ao conectar conta do Instagram', 
        code: 'INTERNAL_ERROR',
        message: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    )
  }
})
