'use client'

import { useState } from 'react'
import AuthForm from './components/AuthForm'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('signup')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Insta Post</h1>
          <p className="mt-2 text-sm text-gray-600">
            Gere posts para redes sociais em segundos
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-3 px-4 text-center font-semibold transition-colors ${
                mode === 'signup'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Criar conta
            </button>
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-3 px-4 text-center font-semibold transition-colors ${
                mode === 'login'
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Entrar
            </button>
          </div>

          {/* Form */}
          <AuthForm mode={mode} />
        </div>

        <p className="text-center text-sm text-gray-600">
          Ao continuar, você concorda com nossos{' '}
          <a href="/terms" className="text-primary hover:underline">
            Termos de Uso
          </a>{' '}
          e{' '}
          <a href="/privacy" className="text-primary hover:underline">
            Política de Privacidade
          </a>
        </p>
      </div>
    </div>
  )
}
