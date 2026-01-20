'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button, Card } from '@/components/ui'
import { EditViaAIModal } from './EditViaAIModal'
import { PublishModal } from './PublishModal'

interface EditActionsProps {
  postId: string
  status: string
  onEditViaAI: (editType: string, instructions?: string, keepImage?: boolean) => Promise<void>
  onRegenerate: (instructions?: string, saveCurrentAsRejected?: boolean) => Promise<void>
  onApprove: () => Promise<void>
  onPublish: (socialAccountId: string) => Promise<void>
  onSchedule: (socialAccountId: string, scheduledFor: string) => Promise<void>
  disabled?: boolean
  isProcessing?: boolean
}

export function EditActions({
  postId,
  status,
  onEditViaAI,
  onRegenerate,
  onApprove,
  onPublish,
  onSchedule,
  disabled = false,
  isProcessing = false,
}: EditActionsProps) {
  const t = useTranslations('editor')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [isApproving, setIsApproving] = useState(false)

  const handleApprove = async () => {
    setIsApproving(true)
    try {
      await onApprove()
    } finally {
      setIsApproving(false)
    }
  }

  const handleEditViaAI = async (editType: string, instructions?: string, keepImage?: boolean) => {
    setShowEditModal(false)
    await onEditViaAI(editType, instructions, keepImage)
  }

  const canEdit = status === 'draft' || status === 'editing' || status === 'ready'
  const canApprove = status === 'draft' || status === 'editing'
  const canPublish = status === 'ready'
  const isPublished = status === 'published'
  const isScheduled = status === 'scheduled'

  return (
    <>
      <Card padding="lg">
        <h3 className="text-body-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          {t('actions')}
        </h3>

        <div className="space-y-3">
          {/* Edit via AI */}
          {canEdit && (
            <Button
              variant="outline"
              fullWidth
              onClick={() => setShowEditModal(true)}
              disabled={disabled || isProcessing}
            >
              ✨ {t('editViaAI')}
            </Button>
          )}

          {/* Generate New */}
          {canEdit && (
            <Button
              variant="outline"
              fullWidth
              onClick={() => onRegenerate()}
              disabled={disabled || isProcessing}
            >
              🔄 {t('generateNew')}
            </Button>
          )}

          {/* Divider */}
          {canEdit && <div className="border-t border-gray-200 dark:border-gray-700 my-4" />}

          {/* Approve */}
          {canApprove && (
            <Button
              variant="secondary"
              fullWidth
              onClick={handleApprove}
              disabled={disabled || isProcessing || isApproving}
              loading={isApproving}
            >
              ✓ {t('approve')}
            </Button>
          )}

          {/* Publish / Schedule */}
          {canPublish && (
            <Button
              variant="primary"
              fullWidth
              onClick={() => setShowPublishModal(true)}
              disabled={disabled || isProcessing}
            >
              🚀 {t('publishOrSchedule')}
            </Button>
          )}

          {/* Status messages */}
          {isPublished && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <p className="text-body-sm text-green-700 dark:text-green-400 text-center">
                ✓ {t('alreadyPublished')}
              </p>
            </div>
          )}

          {isScheduled && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-body-sm text-blue-700 dark:text-blue-400 text-center">
                📅 {t('scheduled')}
              </p>
            </div>
          )}

          {/* Processing indicator */}
          {isProcessing && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <p className="text-body-sm text-yellow-700 dark:text-yellow-400 text-center">
                ⏳ {t('processing')}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Edit via AI Modal */}
      <EditViaAIModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        onSubmit={handleEditViaAI}
      />

      {/* Publish Modal */}
      <PublishModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onPublish={onPublish}
        onSchedule={onSchedule}
      />
    </>
  )
}
