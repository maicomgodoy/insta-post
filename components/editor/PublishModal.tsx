'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Button, Card, Select, Input, FormField } from '@/components/ui'
import { useAuth } from '@/hooks/useAuth'

interface SocialAccount {
  id: string
  accountUsername: string
  platform: string
}

interface PublishModalProps {
  isOpen: boolean
  onClose: () => void
  onPublish: (socialAccountId: string) => Promise<void>
  onSchedule: (socialAccountId: string, scheduledFor: string) => Promise<void>
}

type PublishMode = 'now' | 'schedule'

export function PublishModal({ isOpen, onClose, onPublish, onSchedule }: PublishModalProps) {
  const t = useTranslations('editor')
  const { user } = useAuth()
  const [mode, setMode] = useState<PublishMode>('now')
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [scheduledDate, setScheduledDate] = useState('')
  const [scheduledTime, setScheduledTime] = useState('')
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch social accounts
  useEffect(() => {
    if (isOpen && user) {
      fetchSocialAccounts()
    }
  }, [isOpen, user])

  const fetchSocialAccounts = async () => {
    try {
      setIsLoading(true)
      const token = localStorage.getItem('access_token')
      if (!token) return

      const response = await fetch('/api/social-accounts', {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.ok) {
        const data = await response.json()
        setSocialAccounts(data.accounts || [])
        if (data.accounts?.length > 0) {
          setSelectedAccountId(data.accounts[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch social accounts:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!selectedAccountId) return

    setIsSubmitting(true)
    try {
      if (mode === 'now') {
        await onPublish(selectedAccountId)
      } else {
        if (!scheduledDate || !scheduledTime) return
        const scheduledFor = new Date(`${scheduledDate}T${scheduledTime}`).toISOString()
        await onSchedule(selectedAccountId, scheduledFor)
      }
      onClose()
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get minimum date/time for scheduling (now + 5 minutes)
  const minDate = new Date()
  minDate.setMinutes(minDate.getMinutes() + 5)
  const minDateStr = minDate.toISOString().split('T')[0]
  const minTimeStr = minDate.toTimeString().slice(0, 5)

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <Card className="relative w-full max-w-lg bg-white dark:bg-gray-900 shadow-xl">
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-h3 font-bold text-gray-900 dark:text-gray-100">
                🚀 {t('publishOrSchedule')}
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Social account selection */}
            {isLoading ? (
              <div className="py-8 text-center text-gray-500">
                {t('loadingAccounts')}...
              </div>
            ) : socialAccounts.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 mb-4">
                  {t('noAccountsConnected')}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    onClose()
                    // Navigate to settings
                    window.location.href = '/settings'
                  }}
                >
                  {t('connectAccount')}
                </Button>
              </div>
            ) : (
              <>
                <FormField>
                  <Select
                    label={t('selectAccount')}
                    value={selectedAccountId}
                    onChange={(e) => setSelectedAccountId(e.target.value)}
                    options={socialAccounts.map((account) => ({
                      value: account.id,
                      label: `@${account.accountUsername} (${account.platform})`,
                    }))}
                  />
                </FormField>

                {/* Mode selection */}
                <div className="flex gap-2 mb-6">
                  <button
                    type="button"
                    onClick={() => setMode('now')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      mode === 'now'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {t('publishNow')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('schedule')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      mode === 'schedule'
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {t('schedulePost')}
                  </button>
                </div>

                {/* Schedule options */}
                {mode === 'schedule' && (
                  <div className="space-y-4 mb-6">
                    <FormField>
                      <Input
                        type="date"
                        label={t('selectDate')}
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        min={minDateStr}
                      />
                    </FormField>
                    <FormField>
                      <Input
                        type="time"
                        label={t('selectTime')}
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        min={scheduledDate === minDateStr ? minTimeStr : undefined}
                      />
                    </FormField>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    loading={isSubmitting}
                    disabled={!selectedAccountId || (mode === 'schedule' && (!scheduledDate || !scheduledTime))}
                    className="flex-1"
                  >
                    {mode === 'now' ? t('publishNow') : t('schedulePost')}
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}
