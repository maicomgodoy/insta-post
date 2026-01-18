'use client'

import { useState, useEffect, useCallback } from 'react'
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
  isTokenExpired?: boolean
}

export function ConnectedAccountsSection() {
  const t = useTranslations('settings')
  const { addToast } = useToast()
  
  const [accounts, setAccounts] = useState<SocialAccount[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)

  // Buscar contas conectadas
  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      
      if (!token) {
        setLoading(false)
        return
      }

      const response = await fetch('/api/social-accounts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Falha ao carregar contas')
      }

      const data = await response.json()
      setAccounts(data.accounts || [])
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Erro',
        message: err instanceof Error ? err.message : 'Falha ao carregar contas conectadas',
      })
    } finally {
      setLoading(false)
    }
  }, [addToast])

  useEffect(() => {
    fetchAccounts()
  }, [fetchAccounts])

  const handleConnect = async () => {
    try {
      setConnecting(true)
      const token = localStorage.getItem('access_token')
      
      if (!token) {
        addToast({
          type: 'error',
          title: 'Erro',
          message: 'Você precisa estar logado',
        })
        return
      }

      // Obter URL de autorização do backend
      const response = await fetch('/api/social-accounts/connect/instagram', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Falha ao iniciar conexão')
      }

      const data = await response.json()
      
      // Redirecionar para página de autorização do Instagram
      // O Instagram redirecionará de volta para o callback configurado
      window.location.href = data.authUrl
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Erro',
        message: err instanceof Error ? err.message : 'Falha ao conectar conta do Instagram',
      })
      setConnecting(false)
    }
  }

  const handleDisconnect = async (accountId: string) => {
    if (!confirm('Tem certeza que deseja desconectar esta conta?')) {
      return
    }

    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        addToast({
          type: 'error',
          title: 'Erro',
          message: 'Você precisa estar logado',
        })
        return
      }

      const response = await fetch(`/api/social-accounts/${accountId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Falha ao desconectar conta')
      }

      addToast({
        type: 'success',
        title: 'Sucesso',
        message: 'Conta desconectada com sucesso',
      })
      
      // Atualizar lista
      await fetchAccounts()
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Erro',
        message: err instanceof Error ? err.message : 'Falha ao desconectar conta',
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
                  {account.isTokenExpired && (
                    <p className="text-xs text-orange-500 dark:text-orange-400 mt-1">
                      Token expirado - reconecte a conta
                    </p>
                  )}
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
