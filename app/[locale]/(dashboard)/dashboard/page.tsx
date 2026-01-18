'use client'

import { useTranslations } from 'next-intl'
import { Card, Button, Empty } from '@/components/ui'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const tNav = useTranslations('nav')
  const params = useParams()
  const locale = params.locale as string

  // TODO: Fetch real data from API
  const stats = {
    creditsRemaining: 50,
    postsThisMonth: 0,
    postsScheduled: 0,
    accountsConnected: 1,
  }

  const recentPosts: unknown[] = []

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
              onClick: () => window.location.href = `/${locale}/create-post`,
            }}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Posts would be mapped here */}
          </div>
        )}
      </Card>
    </div>
  )
}
