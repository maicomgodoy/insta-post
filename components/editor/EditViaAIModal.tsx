'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button, Card, Textarea } from '@/components/ui'

interface EditViaAIModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (editType: string, instructions?: string, keepImage?: boolean) => Promise<void>
}

type EditType = 'regenerate_image' | 'regenerate_caption' | 'regenerate_all' | 'edit_caption_only'

export function EditViaAIModal({ isOpen, onClose, onSubmit }: EditViaAIModalProps) {
  const t = useTranslations('editor')
  const [editType, setEditType] = useState<EditType>('edit_caption_only')
  const [instructions, setInstructions] = useState('')
  const [keepImage, setKeepImage] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      await onSubmit(editType, instructions || undefined, keepImage)
      // Reset form
      setEditType('edit_caption_only')
      setInstructions('')
      setKeepImage(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const editTypeOptions: { value: EditType; label: string; description: string }[] = [
    {
      value: 'edit_caption_only',
      label: t('editTypes.editCaptionOnly'),
      description: t('editTypes.editCaptionOnlyDesc'),
    },
    {
      value: 'regenerate_caption',
      label: t('editTypes.regenerateCaption'),
      description: t('editTypes.regenerateCaptionDesc'),
    },
    {
      value: 'regenerate_image',
      label: t('editTypes.regenerateImage'),
      description: t('editTypes.regenerateImageDesc'),
    },
    {
      value: 'regenerate_all',
      label: t('editTypes.regenerateAll'),
      description: t('editTypes.regenerateAllDesc'),
    },
  ]

  const showKeepImageOption = editType === 'regenerate_image' || editType === 'regenerate_all'

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
                ✨ {t('editViaAI')}
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

            {/* Edit type selection */}
            <div className="space-y-3 mb-6">
              <label className="text-body-sm font-medium text-gray-700 dark:text-gray-200">
                {t('selectEditType')}
              </label>
              {editTypeOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    editType === option.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="editType"
                    value={option.value}
                    checked={editType === option.value}
                    onChange={(e) => setEditType(e.target.value as EditType)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {option.label}
                    </p>
                    <p className="text-body-sm text-gray-500 dark:text-gray-400">
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            {/* Instructions */}
            <div className="mb-6">
              <label className="block text-body-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                {t('aiInstructions')} ({t('optional')})
              </label>
              <Textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder={t('aiInstructionsPlaceholder')}
                rows={3}
              />
            </div>

            {/* Keep image option */}
            {showKeepImageOption && (
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={keepImage}
                    onChange={(e) => setKeepImage(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-body-sm text-gray-700 dark:text-gray-200">
                    {t('saveCurrentImage')}
                  </span>
                </label>
                <p className="mt-1 text-body-xs text-gray-500 dark:text-gray-400 ml-6">
                  {t('saveCurrentImageHint')}
                </p>
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
                className="flex-1"
              >
                {t('applyEdit')}
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
