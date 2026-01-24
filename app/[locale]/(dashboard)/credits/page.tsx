'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Card, Button, Loading, Error as ErrorComponent } from '@/components/ui'
import Link from 'next/link'
import { useParams } from 'next/navigation'

interface CreditEntry {
  id: string
  amount: number
  type: string
  description: string | null
  createdAt: string
}

export default function CreditsPage() {
  const t = useTranslations('credits')
  const params = useParams()
  const locale = params.locale as string

  const [available, setAvailable] = useState<number | null>(null)
  const [history, setHistory] = useState<CreditEntry[]>([])
  const [historyTotal, setHistoryTotal] = useState(0)
  const [historyHasMore, setHistoryHasMore] = useState(false)
  const [historyOffset, setHistoryOffset] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCredits = useCallback(async () => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      setError('No authentication token')
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const [balanceRes, historyRes] = await Promise.all([
        fetch('/api/credits/balance', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/credits/history?limit=20&offset=0', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      if (!balanceRes.ok) throw new Error('Failed to fetch balance')
      if (!historyRes.ok) throw new Error('Failed to fetch history')

      const [balanceJson, historyJson] = await Promise.all([
        balanceRes.json(),
        historyRes.json(),
      ])

      setAvailable(balanceJson.available ?? 0)
      setHistory(historyJson.credits ?? [])
      const pagination = historyJson.pagination ?? {}
      setHistoryTotal(pagination.total ?? 0)
      setHistoryOffset((pagination.offset ?? 0) + (historyJson.credits?.length ?? 0))
      setHistoryHasMore(pagination.hasMore ?? false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load credits')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadMoreHistory = useCallback(async () => {
    const token = localStorage.getItem('access_token')
    if (!token || !historyHasMore) return

    setIsLoadingMore(true)
    try {
      const res = await fetch(
        `/api/credits/history?limit=20&offset=${historyOffset}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      if (!res.ok) throw new Error('Failed to fetch history')
      const data = await res.json()
      const list: CreditEntry[] = data.credits ?? []
      const pagination = data.pagination ?? {}

      setHistory((prev) => [...prev, ...list])
      setHistoryOffset((pagination.offset ?? 0) + list.length)
      setHistoryHasMore(pagination.hasMore ?? false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more')
    } finally {
      setIsLoadingMore(false)
    }
  }, [historyHasMore, historyOffset])

  useEffect(() => {
    fetchCredits()
  }, [fetchCredits])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatType = (type: string) => {
    const map: Record<string, string> = {
      monthly_renewal: 'Renovação mensal',
      purchase: 'Compra',
      bonus: 'Bônus',
      usage: 'Uso',
    }
    return map[type] ?? type
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loading size="lg" text="Carregando créditos..." />
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
            Gerencie seus créditos e veja seu histórico de uso.
          </p>
        </div>
        <ErrorComponent
          title="Erro ao carregar"
          message={error}
          onRetry={fetchCredits}
          retryText="Tentar novamente"
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-h1 font-bold text-gray-900 dark:text-gray-50">
          {t('title')}
        </h1>
        <p className="mt-2 text-body-lg text-gray-500 dark:text-gray-400">
          Gerencie seus créditos e veja seu histórico de uso.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card padding="lg">
          <div className="text-center">
            <p className="text-body-sm font-medium text-gray-500 dark:text-gray-400">
              {t('available')}
            </p>
            <p className="text-h1 font-bold text-primary mt-2">
              {available ?? 0}
            </p>
          </div>
        </Card>

        <Card padding="lg">
          <div className="text-center">
            <p className="text-body-sm font-medium text-gray-500 dark:text-gray-400">
              Transações
            </p>
            <p className="text-body-lg font-bold text-gray-900 dark:text-gray-50 mt-2">
              {historyTotal} no histórico
            </p>
          </div>
        </Card>

        <Card padding="lg">
          <div className="text-center">
            <p className="text-body-sm font-medium text-gray-500 dark:text-gray-400">
              {t('monthlyRenewal')}
            </p>
            <p className="text-body-lg font-medium text-gray-900 dark:text-gray-50 mt-2">
              Em 30 dias
            </p>
          </div>
        </Card>
      </div>

      <Card padding="lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-h3 font-semibold text-gray-900 dark:text-gray-50">
              Precisa de mais créditos?
            </h2>
            <p className="mt-1 text-body text-gray-500 dark:text-gray-400">
              Faça upgrade do seu plano para ter mais créditos mensais.
            </p>
          </div>
          <Link href={`/${locale}/settings`}>
            <Button variant="primary">{t('purchase')}</Button>
          </Link>
        </div>
      </Card>

      <Card padding="lg">
        <h2 className="text-h3 font-semibold text-gray-900 dark:text-gray-50 mb-4">
          {t('history')}
        </h2>

        {history.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p>Nenhum histórico de uso ainda.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 text-body-sm font-medium text-gray-500 dark:text-gray-400">
                      Data
                    </th>
                    <th className="pb-3 text-body-sm font-medium text-gray-500 dark:text-gray-400">
                      Tipo
                    </th>
                    <th className="pb-3 text-body-sm font-medium text-gray-500 dark:text-gray-400 text-right">
                      Valor
                    </th>
                    <th className="pb-3 text-body-sm font-medium text-gray-500 dark:text-gray-400">
                      Descrição
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((entry) => (
                    <tr
                      key={entry.id}
                      className="border-b border-gray-100 dark:border-gray-800"
                    >
                      <td className="py-3 text-body-sm text-gray-700 dark:text-gray-300">
                        {formatDate(entry.createdAt)}
                      </td>
                      <td className="py-3 text-body-sm text-gray-700 dark:text-gray-300">
                        {formatType(entry.type)}
                      </td>
                      <td
                        className={`py-3 text-body-sm text-right font-medium ${
                          entry.amount >= 0
                            ? 'text-success-600 dark:text-success-500'
                            : 'text-gray-900 dark:text-gray-100'
                        }`}
                      >
                        {entry.amount >= 0 ? '+' : ''}
                        {entry.amount}
                      </td>
                      <td className="py-3 text-body-sm text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
                        {entry.description ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {historyHasMore && (
              <div className="flex justify-center pt-6">
                <Button
                  variant="outline"
                  size="md"
                  onClick={loadMoreHistory}
                  loading={isLoadingMore}
                >
                  Carregar mais
                </Button>
              </div>
            )}
          </>
        )}
      </Card>
    </div>
  )
}
