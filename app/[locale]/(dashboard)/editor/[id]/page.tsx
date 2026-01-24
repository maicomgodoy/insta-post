'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Button, Loading, Error as ErrorComponent } from '@/components/ui'
import { PostEditor } from '@/components/editor'
import { useToast } from '@/components/ui/Toast'

interface Post {
  id: string
  imageUrl: string
  caption: string
  hashtags: string
  status: string
  version: number
  scheduledFor: string | null
  publishedAt: string | null
  instagramPostId: string | null
  socialAccount: {
    id: string
    accountUsername: string
    platform: string
  } | null
  createdAt: string
  updatedAt: string
}

export default function EditorPage() {
  const t = useTranslations('editor')
  const { addToast } = useToast()
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale as string
  const postId = params?.id as string

  const [post, setPost] = useState<Post | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Fetch post data
  const fetchPost = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`/api/posts/${postId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch post')
      }

      const data = await response.json()
      setPost(data.post)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load post'
      setError(message)
      addToast({
        type: 'error',
        title: t('errorLoadingPost'),
        message,
      })
    } finally {
      setIsLoading(false)
    }
  }, [postId, addToast, t])

  useEffect(() => {
    if (postId) {
      fetchPost()
    }
  }, [postId, fetchPost])

  // Save post changes
  const handleSave = async (updates: Partial<Post>) => {
    if (!post) return

    try {
      setIsSaving(true)

      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to save post')
      }

      const data = await response.json()
      setPost(data.post)

      addToast({
        type: 'success',
        title: t('savedSuccessfully'),
        message: t('changesSaved'),
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save post'
      addToast({
        type: 'error',
        title: t('errorSaving'),
        message,
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle back navigation
  const handleBack = () => {
    router.push(`/${locale}/my-posts`)
  }

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loading size="lg" text={t('loadingPost')} />
      </div>
    )
  }

  // Render error state
  if (error || !post) {
    return (
      <ErrorComponent
        title={t('postNotFound')}
        message={error || t('postNotFoundMessage')}
        onRetry={handleBack}
        retryText={t('backToMyPosts')}
      />
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
          >
            ← {t('back')}
          </Button>
          <div>
            <h1 className="text-h2 font-bold text-gray-900 dark:text-gray-50">
              {t('title')}
            </h1>
            <p className="text-body-sm text-gray-500 dark:text-gray-400">
              {t('version')} {post.version} • {t('status')}: {t(`statuses.${post.status}`)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="text-body-sm text-gray-500 dark:text-gray-400">
              {t('saving')}...
            </span>
          )}
        </div>
      </div>

      {/* Post Editor */}
      <PostEditor
        post={post}
        onSave={handleSave}
        onRefresh={fetchPost}
        isSaving={isSaving}
      />
    </div>
  )
}
