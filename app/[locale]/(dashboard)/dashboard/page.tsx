'use client'

import { useTranslations } from 'next-intl'
import { Card, Button } from '@/components/ui'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function DashboardPage() {
  const t = useTranslations('dashboard')
  const tNav = useTranslations('nav')
  const params = useParams()
  const locale = params.locale as string

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('title')}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t('welcome')}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('creditsRemaining')}
            </p>
            <p className="text-3xl font-bold text-primary mt-2">50</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('postsThisMonth')}
            </p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">0</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('quickActions')}
            </p>
            <div className="mt-4">
              <Link href={`/${locale}/create-post`}>
                <Button variant="primary" size="sm">
                  {tNav('createPost')}
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent posts */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('recentPosts')}
        </h2>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>Nenhum post criado ainda.</p>
          <Link href={`/${locale}/create-post`} className="text-primary hover:underline mt-2 inline-block">
            Criar seu primeiro post
          </Link>
        </div>
      </Card>
    </div>
  )
}
