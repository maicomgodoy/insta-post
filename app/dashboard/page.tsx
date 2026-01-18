'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<{ id: string; email: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token')
      
      if (!token) {
        router.push('/auth')
        return
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          router.push('/auth')
          return
        }

        const data = await response.json()
        setUser(data.user)
      } catch (error) {
        console.error('Auth check failed:', error)
        router.push('/auth')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    router.push('/auth')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] flex items-center justify-center">
        <div className="text-body text-gray-500 dark:text-gray-400">Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A]">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-white dark:bg-[#141414] rounded-lg shadow-md p-8 border border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-h1 font-bold text-gray-900 dark:text-gray-50">Dashboard</h1>
              <p className="text-body-lg text-gray-500 dark:text-gray-400 mt-1">Bem-vindo, {user.email}!</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-body text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-50 px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 hover:border-primary-500 transition-colors"
            >
              Sair
            </button>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
            <p className="text-body text-gray-500 dark:text-gray-400">
              Dashboard em construção. Autenticação funcionando! ✅
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
