'use client'

import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui'
import Image from 'next/image'

interface PostPreviewProps {
  imageUrl: string
  caption: string
  hashtags: string
}

export function PostPreview({ imageUrl, caption, hashtags }: PostPreviewProps) {
  const t = useTranslations('editor')

  // Combine caption and hashtags for preview
  const fullCaption = hashtags ? `${caption}\n\n${hashtags}` : caption

  return (
    <Card padding="none" className="overflow-hidden">
      {/* Instagram-style post preview */}
      <div className="bg-white dark:bg-gray-900">
        {/* Post header (mock) */}
        <div className="flex items-center gap-3 p-3 border-b border-gray-100 dark:border-gray-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
          <div>
            <p className="text-body-sm font-semibold text-gray-900 dark:text-gray-100">
              @your_account
            </p>
          </div>
        </div>

        {/* Post image */}
        <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
          {imageUrl.startsWith('http') ? (
            <Image
              src={imageUrl}
              alt={t('postImage')}
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600">
              <svg
                className="w-16 h-16"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Post actions (mock) */}
        <div className="flex items-center gap-4 p-3 border-b border-gray-100 dark:border-gray-800">
          <button className="text-gray-900 dark:text-gray-100 hover:opacity-60">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
          <button className="text-gray-900 dark:text-gray-100 hover:opacity-60">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </button>
          <button className="text-gray-900 dark:text-gray-100 hover:opacity-60">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
              />
            </svg>
          </button>
        </div>

        {/* Post caption */}
        <div className="p-3">
          <p className="text-body-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words">
            <span className="font-semibold">@your_account</span>{' '}
            {fullCaption}
          </p>
        </div>
      </div>
    </Card>
  )
}
