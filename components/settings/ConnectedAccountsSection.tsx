'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Card, Button, Loading, Empty } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'

interface SocialAccount {
  id: string
  platform: string
  accountId: string
  accountUsername: string
  isActive: boolean
  createdAt: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export function ConnectedAccountsSection() {
  const t = useTranslations('settings')
  const { addToast } = useToast()
  
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)

  // TODO: Implementar quando backend OAuth estiver pronto (Fase 5.4)
  // Por enquanto, apenas estrutura visual
  useEffect(() => {
    // Simular loading
    setTimeout(() => {
      setLoading(false)
      // Por enquanto, não há contas (quando OAuth estiver pronto, buscar do backend)
      setAccounts([])
    }, 500)
  }, [])

  // TODO: Implementar quando backend OAuth estiver pronto
  const handleConnect = async () => {
    setConnecting(true)
    addToast({
      type: 'info',
      title: 'OAuth não implementado',
      message: 'A integração OAuth do Instagram será implementada na Fase 5.4 do backend.',
    })
    setConnecting(false)
    
    // Quando implementado:
    // 1. Redirecionar para endpoint OAuth do backend
    // 2. Backend redireciona para Instagram OAuth
    // 3. Instagram redireciona de volta para callback
    // 4. Backend processa e retorna
    // 5. Atualizar lista de contas
  }

  // TODO: Implementar quando backend OAuth estiver pronto
  const handleDisconnect = async (accountId: string) => {
    if (!confirm('Tem certeza que deseja desconectar esta conta?')) {
      return
    }

    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        addToast({
          type: 'error',
          title: 'Error',
          message: 'Você precisa estar logado',
        })
        return
      }

      // TODO: Chamar endpoint DELETE /api/social-accounts/:id
      // const response = await fetch(`${API_URL}/api/social-accounts/${accountId}`, {
      //   method: 'DELETE',
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // })
      
      addToast({
        type: 'info',
        title: 'OAuth não implementado',
        message: 'A desconexão será implementada na Fase 5.4 do backend.',
      })
      
      // Atualizar lista
      // setAccounts(accounts.filter(acc => acc.id !== accountId))
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Error',
        message: err instanceof Error ? err.message : 'Failed to disconnect account',
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
          {t('connectedAccounts')}
        </h2>
        <Loading text="Carregando contas..." />
      </Card>
    )
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {t('connectedAccounts')}
        </h2>
        <Button
          variant="primary"
          size="sm"
          onClick={handleConnect}
          disabled={connecting}
        >
          {connecting ? 'Conectando...' : 'Conectar Instagram'}
        </Button>
      </div>

      {accounts.length === 0 ? (
        <Empty
          title="Nenhuma conta conectada"
          message="Conecte sua conta do Instagram para publicar posts diretamente."
        />
      ) : (
        <div className="space-y-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold">IG</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">
                    @{account.accountUsername}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Conectado em {new Date(account.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDisconnect(account.id)}
              >
                Desconectar
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}
