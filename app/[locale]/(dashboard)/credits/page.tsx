'use client'

import { useTranslations } from 'next-intl'
import { Card, Button } from '@/components/ui'

export default function CreditsPage() {
  const t = useTranslations('credits')

  // TODO: Fetch user's credit info from API
  const credits = {
    available: 50,
    monthlyLimit: 50,
    used: 0,
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('title')}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Gerencie seus créditos e veja seu histórico de uso.
        </p>
      </div>

      {/* Credits overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('available')}
            </p>
            <p className="text-4xl font-bold text-primary mt-2">
              {credits.available}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('usage')}
            </p>
            <p className="text-4xl font-bold text-gray-900 dark:text-white mt-2">
              {credits.used}/{credits.monthlyLimit}
            </p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('monthlyRenewal')}
            </p>
            <p className="text-lg font-medium text-gray-900 dark:text-white mt-2">
              Em 30 dias
            </p>
          </div>
        </Card>
      </div>

      {/* Purchase more credits */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Precisa de mais créditos?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Faça upgrade do seu plano para ter mais créditos mensais.
            </p>
          </div>
          <Button variant="primary">{t('purchase')}</Button>
        </div>
      </Card>

      {/* Credit history */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          {t('history')}
        </h2>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>Nenhum histórico de uso ainda.</p>
        </div>
      </Card>
    </div>
  )
}
