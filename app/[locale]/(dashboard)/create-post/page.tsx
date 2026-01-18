'use client'

import { useTranslations } from 'next-intl'
import { CreatePostForm } from '@/components/create-post/CreatePostForm'

export default function CreatePostPage() {
  const t = useTranslations('createPost')

  return (
    <div className="max-w-3xl">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-h1 font-bold text-gray-900 dark:text-gray-50">
          {t('title')}
        </h1>
        <p className="mt-2 text-body-lg text-gray-500 dark:text-gray-400">
          {t('subtitle')}
        </p>
      </div>

      {/* Create post form */}
      <CreatePostForm />
    </div>
  )
}
