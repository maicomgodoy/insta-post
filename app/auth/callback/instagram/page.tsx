'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

type CallbackStatus = 'processing' | 'success' | 'error'

function InstagramCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<CallbackStatus>('processing')
  const [errorMessage, setErrorMessage] = useState<string>('')

  useEffect(() => {
    const processCallback = async () => {
      // Obter parâmetros da URL (code e state do OAuth)
      const code = searchParams.get('code')
      const state = searchParams.get('state')
      const error = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      // Se o usuário cancelou ou houve erro do Instagram
      if (error) {
        setStatus('error')
        setErrorMessage(errorDescription || 'Autorização cancelada pelo usuário')
        return
      }

      // Verificar se temos o código de autorização
      if (!code) {
        setStatus('error')
        setErrorMessage('Código de autorização não encontrado')
        return
      }

      // Obter token do usuário
      const token = localStorage.getItem('access_token')
      if (!token) {
        setStatus('error')
        setErrorMessage('Você precisa estar logado para conectar uma conta')
        return
      }

      try {
        // Enviar código para o backend processar
        const response = await fetch(`${API_URL}/api/social-accounts/callback/instagram`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ code, state }),
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.message || 'Falha ao conectar conta do Instagram')
        }

        setStatus('success')
        
        // Redirecionar para configurações após 2 segundos
        setTimeout(() => {
          // Detectar locale atual ou usar pt-BR como padrão
          const locale = document.documentElement.lang || 'pt-BR'
          router.push(`/${locale}/settings`)
        }, 2000)
      } catch (err) {
        setStatus('error')
        setErrorMessage(err instanceof Error ? err.message : 'Erro ao processar callback')
      }
    }

    processCallback()
  }, [searchParams, router])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Conectando conta...
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Aguarde enquanto processamos a conexão com o Instagram
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-green-600 dark:text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Conta conectada!
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sua conta do Instagram foi conectada com sucesso. Redirecionando...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-red-600 dark:text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Erro ao conectar
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {errorMessage}
            </p>
            <button
              onClick={() => {
                const locale = document.documentElement.lang || 'pt-BR'
                router.push(`/${locale}/settings`)
              }}
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
            >
              Voltar para Configurações
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function InstagramCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Carregando...
            </h1>
          </div>
        </div>
      }
    >
      <InstagramCallbackContent />
    </Suspense>
  )
}
