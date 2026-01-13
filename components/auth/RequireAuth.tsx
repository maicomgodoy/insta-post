'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { LoadingPage } from '@/components/ui'

interface RequireAuthProps {
  children: React.ReactNode
}

/**
 * RequireAuth - Componente que protege rotas autenticadas
 * Redireciona para /auth se o usuário não estiver autenticado
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && !user) {
      // Preservar a rota atual para redirecionar após login
      const returnUrl = pathname ? encodeURIComponent(pathname) : ''
      router.push(`/auth?returnUrl=${returnUrl}`)
    }
  }, [user, loading, router, pathname])

  // Show loading while checking authentication
  if (loading) {
    return <LoadingPage text="Verificando autenticação..." />
  }

  // Don't render children if not authenticated (will redirect)
  if (!user) {
    return <LoadingPage text="Redirecionando para login..." />
  }

  return <>{children}</>
}
