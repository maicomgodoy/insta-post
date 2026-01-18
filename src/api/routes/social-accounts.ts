import { Router, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { validateParams } from '../middleware/validation'
import { authenticate, AuthenticatedRequest } from '../middleware/auth'
import { logger } from '../lib/logger'
import { ApiError } from '../middleware/error-handler'

const router = Router()

// ============================================
// CONFIGURAÇÕES DO INSTAGRAM/FACEBOOK
// ============================================
// IMPORTANTE: Para publicar posts no Instagram, é necessário usar a Instagram Graph API
// que requer:
// 1. Conta Instagram Business ou Creator
// 2. Conta vinculada a uma Página do Facebook
// 3. App do Facebook configurado com permissões: instagram_basic, pages_show_list, instagram_content_publish
// 4. OAuth via Facebook (não diretamente via Instagram)

const INSTAGRAM_CLIENT_ID = process.env.INSTAGRAM_CLIENT_ID || process.env.FACEBOOK_APP_ID
const INSTAGRAM_CLIENT_SECRET = process.env.INSTAGRAM_CLIENT_SECRET || process.env.FACEBOOK_APP_SECRET
const INSTAGRAM_REDIRECT_URI = process.env.INSTAGRAM_REDIRECT_URI || 'http://localhost:3000/auth/callback/instagram'

// ============================================
// SCHEMAS DE VALIDAÇÃO
// ============================================

const socialAccountIdParamSchema = z.object({
  id: z.string().uuid('ID da conta inválido'),
})

// ============================================
// TIPOS PARA API DO INSTAGRAM
// ============================================

interface InstagramTokenResponse {
  access_token: string
  user_id: string | number
  token_type?: string
  expires_in?: number
}

interface InstagramProfileResponse {
  id: string
  username: string
}

interface InstagramLongLivedTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface InstagramRefreshTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

// ============================================
// ENDPOINTS
// ============================================

/**
 * GET /api/social-accounts
 * Lista todas as contas sociais conectadas do usuário
 */
router.get('/', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id

  const accounts = await prisma.socialAccount.findMany({
    where: {
      userId,
      isActive: true,
    },
    select: {
      id: true,
      platform: true,
      accountId: true,
      accountUsername: true,
      tokenExpiresAt: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  res.json({
    accounts: accounts.map((account) => ({
      ...account,
      isTokenExpired: account.tokenExpiresAt ? account.tokenExpiresAt < new Date() : false,
    })),
  })
})

/**
 * GET /api/social-accounts/:id
 * Busca uma conta social por ID
 */
router.get(
  '/:id',
  authenticate,
  validateParams(socialAccountIdParamSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id
    const { id } = req.params

    const account = await prisma.socialAccount.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
        platform: true,
        accountId: true,
        accountUsername: true,
        tokenExpiresAt: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!account) {
      const error: ApiError = new Error('Conta social não encontrada')
      error.statusCode = 404
      error.code = 'SOCIAL_ACCOUNT_NOT_FOUND'
      throw error
    }

    res.json({
      account: {
        ...account,
        isTokenExpired: account.tokenExpiresAt ? account.tokenExpiresAt < new Date() : false,
      },
    })
  }
)

/**
 * GET /api/social-accounts/connect/instagram
 * Inicia o fluxo OAuth do Instagram
 * Retorna a URL de autorização
 */
router.get('/connect/instagram', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id

  if (!INSTAGRAM_CLIENT_ID) {
    const error: ApiError = new Error('Instagram OAuth não está configurado')
    error.statusCode = 503
    error.code = 'INSTAGRAM_NOT_CONFIGURED'
    throw error
  }

  // Gerar state para segurança (prevenir CSRF)
  const state = Buffer.from(JSON.stringify({
    userId,
    timestamp: Date.now(),
  })).toString('base64')

  // URL de autorização do Facebook (para Instagram Graph API)
  // Para publicar posts, precisamos usar Facebook OAuth com permissões do Instagram
  const authUrl = new URL('https://www.facebook.com/v21.0/dialog/oauth')
  authUrl.searchParams.set('client_id', INSTAGRAM_CLIENT_ID)
  authUrl.searchParams.set('redirect_uri', INSTAGRAM_REDIRECT_URI)
  // Permissões necessárias para publicar no Instagram:
  // - instagram_basic: Acesso básico ao Instagram
  // - pages_show_list: Listar páginas do Facebook vinculadas
  // - instagram_content_publish: Publicar conteúdo no Instagram
  // - pages_read_engagement: Ler engajamento das páginas
  authUrl.searchParams.set('scope', 'instagram_basic,pages_show_list,instagram_content_publish,pages_read_engagement')
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('state', state)

  logger.info('Instagram OAuth initiated', { userId })

  res.json({
    authUrl: authUrl.toString(),
    state,
  })
})

/**
 * POST /api/social-accounts/callback/instagram
 * Processa o callback do OAuth do Instagram
 */
router.post(
  '/callback/instagram',
  authenticate,
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id
    const { code, state } = req.body

    if (!code) {
      const error: ApiError = new Error('Código de autorização não fornecido')
      error.statusCode = 400
      error.code = 'MISSING_AUTH_CODE'
      throw error
    }

    if (!INSTAGRAM_CLIENT_ID || !INSTAGRAM_CLIENT_SECRET) {
      const error: ApiError = new Error('Instagram OAuth não está configurado')
      error.statusCode = 503
      error.code = 'INSTAGRAM_NOT_CONFIGURED'
      throw error
    }

    // Validar state (opcional mas recomendado)
    if (state) {
      try {
        const stateData = JSON.parse(Buffer.from(state, 'base64').toString())
        if (stateData.userId !== userId) {
          const error: ApiError = new Error('State inválido')
          error.statusCode = 400
          error.code = 'INVALID_STATE'
          throw error
        }
      } catch {
        logger.warn('Failed to parse OAuth state', { userId })
      }
    }

    try {
      // Trocar code por access_token via Facebook OAuth
      // Para Instagram Graph API, usamos Facebook OAuth
      const tokenUrl = new URL('https://graph.facebook.com/v21.0/oauth/access_token')
      tokenUrl.searchParams.set('client_id', INSTAGRAM_CLIENT_ID)
      tokenUrl.searchParams.set('client_secret', INSTAGRAM_CLIENT_SECRET)
      tokenUrl.searchParams.set('redirect_uri', INSTAGRAM_REDIRECT_URI)
      tokenUrl.searchParams.set('code', code)

      const tokenResponse = await fetch(tokenUrl.toString(), {
        method: 'GET',
      })

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json()
        logger.error('Instagram token exchange failed', { error: errorData })
        const error: ApiError = new Error('Falha ao obter token do Instagram')
        error.statusCode = 400
        error.code = 'TOKEN_EXCHANGE_FAILED'
        throw error
      }

      const tokenData = await tokenResponse.json() as InstagramTokenResponse
      const { access_token } = tokenData

      // Para Instagram Graph API, o fluxo completo requer:
      // 1. Obter páginas do Facebook vinculadas
      // 2. Para cada página, obter o Instagram Business Account ID
      // 3. Usar o token da página para acessar o Instagram
      // 
      // Por enquanto, vamos tentar obter diretamente o perfil do Instagram
      // Se o token já for do tipo correto (long-lived token do Instagram), funcionará
      
      // Tentar obter perfil diretamente do Instagram
      let profileData: InstagramProfileResponse | null = null
      let instagramUserId: string | null = null
      let finalAccessToken = access_token
      
      const profileResponse = await fetch(
        `https://graph.instagram.com/me?fields=id,username&access_token=${access_token}`
      )

      if (profileResponse.ok) {
        profileData = await profileResponse.json() as InstagramProfileResponse
        instagramUserId = profileData.id
      } else {
        // Se não funcionou diretamente, tentar via páginas do Facebook
        const pagesResponse = await fetch(
          `https://graph.facebook.com/v21.0/me/accounts?access_token=${access_token}`
        )

        if (pagesResponse.ok) {
          const pagesData = await pagesResponse.json() as { data: Array<{ id: string; access_token: string }> }
          
          // Para cada página, tentar obter o Instagram Business Account
          for (const page of pagesData.data) {
            const igAccountResponse = await fetch(
              `https://graph.facebook.com/v21.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token}`
            )
            
            if (igAccountResponse.ok) {
              const igAccountData = await igAccountResponse.json() as { instagram_business_account?: { id: string } }
              
              if (igAccountData.instagram_business_account) {
                instagramUserId = igAccountData.instagram_business_account.id
                
                // Obter informações do perfil do Instagram usando token da página
                const igProfileResponse = await fetch(
                  `https://graph.instagram.com/${instagramUserId}?fields=id,username&access_token=${page.access_token}`
                )
                
                if (igProfileResponse.ok) {
                  profileData = await igProfileResponse.json() as InstagramProfileResponse
                  finalAccessToken = page.access_token // Usar token da página
                  break
                }
              }
            }
          }
        }
      }

      if (!profileData || !instagramUserId) {
        const error: ApiError = new Error('Falha ao obter perfil do Instagram. Certifique-se de que a conta está vinculada a uma Página do Facebook e que o app tem as permissões necessárias.')
        error.statusCode = 400
        error.code = 'PROFILE_FETCH_FAILED'
        throw error
      }

      // Obter token de longa duração (60 dias) se possível
      // Nota: Para tokens de página, isso pode não ser necessário
      let tokenExpiresAt: Date | null = null
      
      try {
        const longLivedTokenResponse = await fetch(
          `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${INSTAGRAM_CLIENT_SECRET}&access_token=${finalAccessToken}`
        )

        if (longLivedTokenResponse.ok) {
          const longLivedData = await longLivedTokenResponse.json() as InstagramLongLivedTokenResponse
          finalAccessToken = longLivedData.access_token
          tokenExpiresAt = new Date(Date.now() + longLivedData.expires_in * 1000)
        }
      } catch (error) {
        // Se falhar ao obter long-lived token, usar o token atual
        logger.warn('Failed to exchange for long-lived token', { error })
      }

      // Verificar se a conta já está conectada
      const existingAccount = await prisma.socialAccount.findFirst({
        where: {
          userId,
          accountId: instagramUserId,
          platform: 'instagram',
        },
      })

      let account

      if (existingAccount) {
        // Atualizar tokens da conta existente
        account = await prisma.socialAccount.update({
          where: { id: existingAccount.id },
          data: {
            accessToken: finalAccessToken,
            tokenExpiresAt,
            accountUsername: profileData.username,
            isActive: true,
          },
        })
        logger.info('Instagram account reconnected', { userId, accountId: account.id })
      } else {
        // Criar nova conta
        account = await prisma.socialAccount.create({
          data: {
            userId,
            platform: 'instagram',
            accountId: instagramUserId,
            accountUsername: profileData.username,
            accessToken: finalAccessToken,
            tokenExpiresAt,
            isActive: true,
          },
        })
        logger.info('Instagram account connected', { userId, accountId: account.id })
      }

      res.json({
        message: 'Conta do Instagram conectada com sucesso',
        account: {
          id: account.id,
          platform: account.platform,
          accountUsername: account.accountUsername,
          isActive: account.isActive,
        },
      })
    } catch (error: any) {
      if (error.statusCode) throw error
      
      logger.error('Instagram OAuth error', { error: error.message })
      const apiError: ApiError = new Error('Erro ao conectar conta do Instagram')
      apiError.statusCode = 500
      apiError.code = 'INSTAGRAM_OAUTH_ERROR'
      throw apiError
    }
  }
)

/**
 * POST /api/social-accounts/:id/refresh
 * Atualiza o token de acesso de uma conta
 */
router.post(
  '/:id/refresh',
  authenticate,
  validateParams(socialAccountIdParamSchema),
  async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.user!.id
    const { id } = req.params

    const account = await prisma.socialAccount.findFirst({
      where: {
        id,
        userId,
      },
    })

    if (!account) {
      const error: ApiError = new Error('Conta social não encontrada')
      error.statusCode = 404
      error.code = 'SOCIAL_ACCOUNT_NOT_FOUND'
      throw error
    }

    if (account.platform !== 'instagram') {
      const error: ApiError = new Error('Refresh de token não suportado para esta plataforma')
      error.statusCode = 400
      error.code = 'REFRESH_NOT_SUPPORTED'
      throw error
    }

    try {
      // Refresh do token de longa duração do Instagram
      const refreshResponse = await fetch(
        `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${account.accessToken}`
      )

      if (!refreshResponse.ok) {
        const error: ApiError = new Error('Falha ao atualizar token. Reconecte a conta.')
        error.statusCode = 400
        error.code = 'TOKEN_REFRESH_FAILED'
        throw error
      }

      const refreshData = await refreshResponse.json() as InstagramRefreshTokenResponse
      const newExpiresAt = new Date(Date.now() + refreshData.expires_in * 1000)

      await prisma.socialAccount.update({
        where: { id },
        data: {
          accessToken: refreshData.access_token,
          tokenExpiresAt: newExpiresAt,
        },
      })

      logger.info('Instagram token refreshed', { userId, accountId: id })

      res.json({
        message: 'Token atualizado com sucesso',
        tokenExpiresAt: newExpiresAt,
      })
    } catch (error: any) {
      if (error.statusCode) throw error

      logger.error('Token refresh error', { error: error.message })
      const apiError: ApiError = new Error('Erro ao atualizar token')
      apiError.statusCode = 500
      apiError.code = 'TOKEN_REFRESH_ERROR'
      throw apiError
    }
  }
)

/**
 * DELETE /api/social-accounts/:id
 * Desconecta uma conta social
 */
router.delete(
  '/:id',
  authenticate,
  validateParams(socialAccountIdParamSchema),
  async (req: AuthenticatedRequest, res: Response, next) => {
    try {
      const userId = req.user!.id
      const { id } = req.params

      const account = await prisma.socialAccount.findFirst({
        where: {
          id,
          userId,
        },
      })

      if (!account) {
        const error: ApiError = new Error('Conta social não encontrada')
        error.statusCode = 404
        error.code = 'SOCIAL_ACCOUNT_NOT_FOUND'
        throw error
      }

      // Verificar se há posts agendados para esta conta
      const scheduledPosts = await prisma.post.count({
        where: {
          socialAccountId: id,
          status: 'scheduled',
        },
      })

      if (scheduledPosts > 0) {
        const error: ApiError = new Error(
          `Existem ${scheduledPosts} post(s) agendados para esta conta. Cancele os agendamentos antes de desconectar.`
        )
        error.statusCode = 400
        error.code = 'HAS_SCHEDULED_POSTS'
        throw error
      }

      // Soft delete - marca como inativa
      await prisma.socialAccount.update({
        where: { id },
        data: { isActive: false },
      })

      logger.info('Social account disconnected', { userId, accountId: id })

      res.json({
        message: 'Conta desconectada com sucesso',
      })
    } catch (error) {
      next(error)
    }
  }
)

/**
 * POST /api/social-accounts/mock
 * Cria uma conta mock para testes (apenas em desenvolvimento)
 */
router.post('/mock', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id

  if (process.env.NODE_ENV === 'production') {
    const error: ApiError = new Error('Endpoint disponível apenas em desenvolvimento')
    error.statusCode = 403
    error.code = 'DEV_ONLY'
    throw error
  }

  const { username } = req.body

  const account = await prisma.socialAccount.create({
    data: {
      userId,
      platform: 'instagram',
      accountId: `mock_${Date.now()}`,
      accountUsername: username || `test_user_${Date.now()}`,
      accessToken: 'mock_token_for_testing',
      tokenExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 dias
      isActive: true,
    },
  })

  logger.info('Mock social account created', { userId, accountId: account.id })

  res.status(201).json({
    message: 'Conta mock criada para testes',
    account: {
      id: account.id,
      platform: account.platform,
      accountUsername: account.accountUsername,
      isActive: account.isActive,
    },
  })
})

export { router as socialAccountRoutes }
