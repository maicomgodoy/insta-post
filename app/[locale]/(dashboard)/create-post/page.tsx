'use client'

import { useTranslations } from 'next-intl'
import { CreatePostForm } from '@/components/create-post/CreatePostForm'

export default function CreatePostPage() {
  const t = useTranslations('createPost')

  return (
    <div className="max-w-2xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('title')}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t('subtitle')}
        </p>
      </div>

      {/* Create post form */}
      <CreatePostForm />
    </div>
  )
}
