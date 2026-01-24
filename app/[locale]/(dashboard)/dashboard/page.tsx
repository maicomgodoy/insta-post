'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Card, Button, Empty, Loading, Error as ErrorComponent } from '@/components/ui'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import Image from 'next/image'

interface Post {
  id: string
  imageUrl: string
  caption: string
  status: string
  scheduledFor: string | null
  publishedAt: string | null
  createdAt: string
  socialAccount: { id: string; accountUsername: string; platform: string } | null
}

interface DashboardData {
  creditsRemaining: number
  postsThisMonth: number
  postsScheduled: number
  accountsConnected: number
  recentPosts: Post[]
}

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const tNav = useTranslations('nav')
  const params = useParams()
  const locale = params.locale as string

  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboard = useCallback(async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setError('No authentication token')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const [creditsRes, postsRes, accountsRes] = await Promise.all([
        fetch('/api/credits/balance', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/posts?limit=100&orderBy=createdAt&order=desc', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/social-accounts', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (!creditsRes.ok) throw new Error('Failed to fetch credits')
      if (!postsRes.ok) throw new Error('Failed to fetch posts')
      if (!accountsRes.ok) throw new Error('Failed to fetch accounts')

      const [creditsJson, postsJson, accountsJson] = await Promise.all([
        creditsRes.json(),
        postsRes.json(),
        accountsRes.json(),
      ])

      const posts: Post[] = postsJson.posts ?? []
      const accounts = accountsJson.accounts ?? []
      const now = new Date()
      const thisMonth = now.getMonth()
      const thisYear = now.getFullYear()

      const postsThisMonth = posts.filter((p) => {
        if (p.status !== 'published' || !p.publishedAt) return false
        const d = new Date(p.publishedAt)
        return d.getMonth() === thisMonth && d.getFullYear() === thisYear
      }).length

      const postsScheduled = posts.filter((p) => p.status === 'scheduled').length
      const recentPosts = posts.slice(0, 6)

      setData({
        creditsRemaining: creditsJson.available ?? 0,
        postsThisMonth,
        postsScheduled,
        accountsConnected: accounts.length,
        recentPosts,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loading size="lg" text="Carregando..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-h1 font-bold text-gray-900 dark:text-gray-50">
            {t('title')}
          </h1>
          <p className="mt-2 text-body-lg text-gray-500 dark:text-gray-400">
            {t('welcome')}
          </p>
        </div>
        <ErrorComponent
          title="Erro ao carregar"
          message={error}
          onRetry={fetchDashboard}
          retryText="Tentar novamente"
        />
      </div>
    )
  }

  const stats = data!
  const recentPosts = stats.recentPosts

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-h1 font-bold text-gray-900 dark:text-gray-50">
            {t('title')}
          </h1>
          <p className="mt-2 text-body-lg text-gray-500 dark:text-gray-400">
            {t('welcome')}
          </p>
        </div>
        <Link href={`/${locale}/create-post`}>
          <Button variant="primary" size="lg">
            {tNav('createPost')}
          </Button>
        </Link>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card padding="lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-body-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('creditsRemaining')}
              </p>
              <p className="text-h1 font-bold text-gray-900 dark:text-gray-50">
                {stats.creditsRemaining}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-body-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {t('postsThisMonth')}
              </p>
              <p className="text-h1 font-bold text-gray-900 dark:text-gray-50">
                {stats.postsThisMonth}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-success-50 dark:bg-success-900/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-body-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Agendados
              </p>
              <p className="text-h1 font-bold text-gray-900 dark:text-gray-50">
                {stats.postsScheduled}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-warning-50 dark:bg-warning-900/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-warning-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card padding="lg">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-body-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                Contas Conectadas
              </p>
              <p className="text-h1 font-bold text-gray-900 dark:text-gray-50">
                {stats.accountsConnected}
              </p>
            </div>
            <div className="w-12 h-12 rounded-lg bg-info-50 dark:bg-info-900/20 flex items-center justify-center">
              <svg className="w-6 h-6 text-info-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent posts */}
      <Card padding="lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-h3 font-semibold text-gray-900 dark:text-gray-50">
            {t('recentPosts')}
          </h2>
          {recentPosts.length > 0 && (
            <Link href={`/${locale}/my-posts`}>
              <Button variant="ghost" size="sm">
                Ver todos
              </Button>
            </Link>
          )}
        </div>

        {recentPosts.length === 0 ? (
          <Empty
            title="Nenhum post criado ainda"
            message="Comece criando seu primeiro post com IA. É rápido e fácil!"
            action={{
              label: 'Criar Primeiro Post',
              onClick: () => (window.location.href = `/${locale}/create-post`),
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentPosts.map((post) => (
              <Link
                key={post.id}
                href={`/${locale}/editor/${post.id}`}
                className="group block rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-colors"
              >
                <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
                  {post.imageUrl.startsWith('http') ? (
                    <Image
                      src={post.imageUrl}
                      alt=""
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                      sizes="(max-width: 768px) 100vw, 33vw"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600">
                      <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                      </svg>
                    </div>
                  )}
                  <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-medium rounded bg-black/50 text-white capitalize">
                    {post.status}
                  </span>
                </div>
                <div className="p-3 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-body-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                    {post.caption || 'Sem legenda'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
