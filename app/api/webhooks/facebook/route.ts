import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

/**
 * GET /api/webhooks/facebook
 * Endpoint para validação de webhook do Facebook/Instagram
 * 
 * O Facebook envia um GET request com hub.mode, hub.challenge e hub.verify_token
 * quando você configura o webhook. Você deve retornar o hub.challenge para validar.
 * 
 * Para configurar no Facebook Developer:
 * 1. Vá em Products > Messenger ou Instagram > Webhooks
 * 2. Configure a URL do webhook: https://seudominio.com/api/webhooks/facebook
 * 3. Configure o Verify Token (pode ser qualquer string segura)
 * 4. Adicione as permissões/subscriptions que deseja
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const mode = searchParams.get('hub.mode')
    const token = searchParams.get('hub.verify_token')
    const challenge = searchParams.get('hub.challenge')
    
    // Configurar o verify token nas variáveis de ambiente (opcional)
    const verifyToken = process.env.FACEBOOK_WEBHOOK_VERIFY_TOKEN || 'my_verify_token'
    
    // Verificar se é uma solicitação de validação do Facebook
    if (mode === 'subscribe' && token === verifyToken) {
      logger.info('Facebook webhook verified', {
        mode,
        challenge: challenge?.substring(0, 20) + '...',
      })
      
      // IMPORTANTE: Retornar APENAS o valor do hub.challenge como texto puro
      // O Facebook/Meta espera exatamente o valor do challenge, sem JSON, sem HTML, apenas texto
      // Este é o mesmo comportamento que o n8n usa para validar webhooks do Facebook
      if (!challenge) {
        logger.error('Facebook webhook challenge missing')
        return NextResponse.json(
          { error: 'Challenge missing' },
          { status: 400 }
        )
      }
      
      // Retornar o challenge como texto puro (Content-Type: text/plain)
      // A resposta deve ser APENAS o valor do challenge, nada mais
      return new NextResponse(challenge, {
        status: 200,
        headers: {
          'Content-Type': 'text/plain',
        },
      })
    }
    
    // Se não for validação ou token inválido
    logger.warn('Facebook webhook verification failed', {
      mode,
      tokenProvided: !!token,
      tokenMatch: token === verifyToken,
    })
    
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    )
  } catch (error) {
    logger.error('Facebook webhook error', {
      error: (error as Error).message,
    })
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/webhooks/facebook
 * Endpoint para receber notificações do Facebook/Instagram
 * 
 * O Facebook envia notificações via POST quando eventos configurados ocorrem.
 * Por exemplo: mudanças de permissões, tokens revogados, etc.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Log da notificação recebida
    logger.info('Facebook webhook notification received', {
      object: body.object,
      entryCount: body.entry?.length || 0,
    })
    
    // Processar notificações do Facebook
    if (body.object === 'instagram' || body.object === 'page') {
      // Processar cada entrada
      if (body.entry && Array.isArray(body.entry)) {
        for (const entry of body.entry) {
          // Processar mudanças relacionadas a permissões ou tokens
          if (entry.changes) {
            for (const change of entry.changes) {
              logger.info('Facebook webhook change detected', {
                field: change.field,
                value: change.value,
              })
              
              // Aqui você pode processar mudanças específicas
              // Por exemplo, quando um usuário revoga permissões
              if (change.field === 'permissions') {
                logger.warn('Permissions changed', {
                  userId: entry.id,
                  permissions: change.value,
                })
              }
            }
          }
          
          // Processar eventos específicos se necessário
          if (entry.messaging) {
            // Processar mensagens do Messenger (se configurado)
            logger.debug('Messenger event received', {
              senderId: entry.sender?.id,
            })
          }
        }
      }
    }
    
    // Sempre retornar 200 para o Facebook
    // O Facebook espera uma resposta rápida
    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    logger.error('Facebook webhook POST error', {
      error: (error as Error).message,
    })
    
    // Retornar 200 mesmo em caso de erro
    // para evitar que o Facebook tente reenviar
    return NextResponse.json({ status: 'ok' })
  }
}
