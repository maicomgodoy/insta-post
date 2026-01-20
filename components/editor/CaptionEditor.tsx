'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Card, Textarea, Button, FormField } from '@/components/ui'
import { INSTAGRAM_LIMITS, countHashtags } from '@/lib/utils/caption-parser'

interface CaptionEditorProps {
  caption: string
  hashtags: string
  onCaptionChange: (caption: string) => void
  onHashtagsChange: (hashtags: string) => void
  disabled?: boolean
}

export function CaptionEditor({
  caption,
  hashtags,
  onCaptionChange,
  onHashtagsChange,
  disabled = false,
}: CaptionEditorProps) {
  const t = useTranslations('editor')
  const [localCaption, setLocalCaption] = useState(caption)
  const [localHashtags, setLocalHashtags] = useState(hashtags)

  // Sync with external props
  useEffect(() => {
    setLocalCaption(caption)
  }, [caption])

  useEffect(() => {
    setLocalHashtags(hashtags)
  }, [hashtags])

  // Calculate character counts
  const fullLength = localCaption.length + (localHashtags ? localHashtags.length + 2 : 0) // +2 for \n\n
  const hashtagCount = countHashtags(localHashtags)
  const isOverLimit = fullLength > INSTAGRAM_LIMITS.MAX_CAPTION_LENGTH
  const isTooManyHashtags = hashtagCount > INSTAGRAM_LIMITS.MAX_HASHTAGS

  // Handle caption change with debounce
  const handleCaptionChange = (value: string) => {
    setLocalCaption(value)
    onCaptionChange(value)
  }

  // Handle hashtags change
  const handleHashtagsChange = (value: string) => {
    setLocalHashtags(value)
    onHashtagsChange(value)
  }

  return (
    <Card padding="lg">
      <div className="space-y-4">
        {/* Caption field */}
        <FormField>
          <div className="flex items-center justify-between mb-2">
            <label className="text-body-sm font-medium text-gray-700 dark:text-gray-200">
              {t('caption')}
            </label>
            <span
              className={`text-body-xs ${
                isOverLimit ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {fullLength}/{INSTAGRAM_LIMITS.MAX_CAPTION_LENGTH}
            </span>
          </div>
          <Textarea
            value={localCaption}
            onChange={(e) => handleCaptionChange(e.target.value)}
            placeholder={t('captionPlaceholder')}
            rows={6}
            disabled={disabled}
            className={isOverLimit ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          />
          <p className="mt-1 text-body-xs text-gray-500 dark:text-gray-400">
            {t('captionHint')}
          </p>
        </FormField>

        {/* Hashtags field */}
        <FormField>
          <div className="flex items-center justify-between mb-2">
            <label className="text-body-sm font-medium text-gray-700 dark:text-gray-200">
              {t('hashtags')}
            </label>
            <span
              className={`text-body-xs ${
                isTooManyHashtags ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              {hashtagCount}/{INSTAGRAM_LIMITS.MAX_HASHTAGS} hashtags
            </span>
          </div>
          <Textarea
            value={localHashtags}
            onChange={(e) => handleHashtagsChange(e.target.value)}
            placeholder={t('hashtagsPlaceholder')}
            rows={3}
            disabled={disabled}
            className={isTooManyHashtags ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          />
          <p className="mt-1 text-body-xs text-gray-500 dark:text-gray-400">
            {t('hashtagsHint')}
          </p>
        </FormField>

        {/* Validation warnings */}
        {(isOverLimit || isTooManyHashtags) && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <ul className="text-body-sm text-red-600 dark:text-red-400 space-y-1">
              {isOverLimit && (
                <li>• {t('captionTooLong', { max: INSTAGRAM_LIMITS.MAX_CAPTION_LENGTH })}</li>
              )}
              {isTooManyHashtags && (
                <li>• {t('tooManyHashtags', { max: INSTAGRAM_LIMITS.MAX_HASHTAGS })}</li>
              )}
            </ul>
          </div>
        )}

        {/* Research buttons (placeholders for future integration) */}
        <div className="flex flex-wrap gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {/* TODO: Open hashtag research */}}
            disabled={disabled}
          >
            🔍 {t('searchHashtags')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {/* TODO: Open caption terms research */}}
            disabled={disabled}
          >
            💡 {t('searchTerms')}
          </Button>
        </div>
      </div>
    </Card>
  )
}
