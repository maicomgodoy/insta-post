import { logger } from '../logger'
import { createApiError } from '../errors'

/**
 * Interfaces para respostas da Instagram Graph API
 */
interface InstagramMediaContainerResponse {
  id: string
}

interface InstagramMediaPublishResponse {
  id: string
}

interface InstagramErrorResponse {
  error: {
    message: string
    type: string
    code: number
    error_subcode?: number
  }
}

interface InstagramApiError extends Error {
  instagramError?: InstagramErrorResponse['error']
}

/**
 * Service para integração com Instagram Graph API
 */
export class InstagramService {
  /**
   * Publica uma imagem no Instagram
   * 
   * Fluxo:
   * 1. Criar container de mídia
   * 2. Publicar o container
   * 
   * @param accessToken Token de acesso do Instagram
   * @param instagramUserId ID do usuário do Instagram (IG User ID)
   * @param imageUrl URL da imagem (deve ser acessível publicamente)
   * @param caption Legenda do post
   * @returns ID do post publicado no Instagram
   */
  async publishPost(
    accessToken: string,
    instagramUserId: string,
    imageUrl: string,
    caption: string
  ): Promise<string> {
    try {
      // Passo 1: Criar container de mídia
      const containerId = await this.createMediaContainer(
        accessToken,
        instagramUserId,
        imageUrl,
        caption
      )

      logger.info('Instagram media container created', {
        containerId,
        instagramUserId,
      })

      // Passo 2: Publicar o container
      const postId = await this.publishMediaContainer(
        accessToken,
        instagramUserId,
        containerId
      )

      logger.info('Instagram post published', {
        postId,
        instagramUserId,
      })

      return postId
    } catch (error: unknown) {
      const instagramError = error as InstagramApiError
      logger.error('Instagram publish error', {
        error: instagramError.message || 'Unknown error',
        instagramUserId,
      })

      // Se for um erro da API do Instagram, extrair mensagem
      if (instagramError.instagramError) {
        throw createApiError(
          `Erro ao publicar no Instagram: ${instagramError.instagramError.message}`,
          400,
          'INSTAGRAM_PUBLISH_ERROR'
        )
      }

      if (error instanceof Error) {
        throw createApiError(
          `Erro ao publicar no Instagram: ${error.message}`,
          500,
          'INSTAGRAM_PUBLISH_ERROR'
        )
      }

      throw createApiError(
        'Erro desconhecido ao publicar no Instagram',
        500,
        'INSTAGRAM_PUBLISH_ERROR'
      )
    }
  }

  /**
   * Cria um container de mídia no Instagram
   */
  private async createMediaContainer(
    accessToken: string,
    instagramUserId: string,
    imageUrl: string,
    caption: string
  ): Promise<string> {
    const url = `https://graph.facebook.com/v21.0/${instagramUserId}/media`

    const params = new URLSearchParams({
      image_url: imageUrl,
      caption: caption,
      access_token: accessToken,
    })

    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'POST',
    })

    const data = await response.json()

    if (!response.ok) {
      const errorData = data as InstagramErrorResponse
      logger.error('Instagram container creation failed', {
        error: errorData.error,
        instagramUserId,
      })

      const error: InstagramApiError = new Error('Falha ao criar container de mídia no Instagram')
      error.instagramError = errorData.error
      throw error
    }

    const containerData = data as InstagramMediaContainerResponse
    return containerData.id
  }

  /**
   * Publica um container de mídia no Instagram
   */
  private async publishMediaContainer(
    accessToken: string,
    instagramUserId: string,
    containerId: string
  ): Promise<string> {
    const url = `https://graph.facebook.com/v21.0/${instagramUserId}/media_publish`

    const params = new URLSearchParams({
      creation_id: containerId,
      access_token: accessToken,
    })

    const response = await fetch(`${url}?${params.toString()}`, {
      method: 'POST',
    })

    const data = await response.json()

    if (!response.ok) {
      const errorData = data as InstagramErrorResponse
      logger.error('Instagram publish failed', {
        error: errorData.error,
        containerId,
        instagramUserId,
      })

      const error: InstagramApiError = new Error('Falha ao publicar no Instagram')
      error.instagramError = errorData.error
      throw error
    }

    const publishData = data as InstagramMediaPublishResponse
    return publishData.id
  }

  /**
   * Verifica se um token de acesso é válido
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(
        `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
      )

      return response.ok
    } catch {
      return false
    }
  }

  /**
   * Obtém informações do perfil do Instagram
   */
  async getProfile(accessToken: string): Promise<{ id: string; username: string }> {
    const response = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
    )

    if (!response.ok) {
      const errorData = await response.json() as InstagramErrorResponse
      throw createApiError(
        `Erro ao obter perfil: ${errorData.error.message}`,
        400,
        'INSTAGRAM_PROFILE_ERROR'
      )
    }

    const profileData = await response.json() as { id: string; username: string }
    return profileData
  }
}

// Exportar instância singleton
export const instagramService = new InstagramService()
