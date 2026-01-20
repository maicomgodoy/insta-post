'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useToast } from '@/components/ui/Toast'
import { PostPreview } from './PostPreview'
import { CaptionEditor } from './CaptionEditor'
import { EditActions } from './EditActions'

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

interface PostEditorProps {
  post: Post
  onSave: (updates: Partial<Post>) => Promise<void>
  onRefresh: () => Promise<void>
  isSaving?: boolean
}

export function PostEditor({ post, onSave, onRefresh, isSaving = false }: PostEditorProps) {
  const t = useTranslations('editor')
  const { addToast } = useToast()
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale as string

  // Local state for editing
  const [caption, setCaption] = useState(post.caption)
  const [hashtags, setHashtags] = useState(post.hashtags)
  const [hasChanges, setHasChanges] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  // Sync with post prop
  useEffect(() => {
    setCaption(post.caption)
    setHashtags(post.hashtags)
    setHasChanges(false)
  }, [post.caption, post.hashtags])

  // Track changes
  useEffect(() => {
    const changed = caption !== post.caption || hashtags !== post.hashtags
    setHasChanges(changed)
  }, [caption, hashtags, post.caption, post.hashtags])

  // Auto-save with debounce
  useEffect(() => {
    if (!hasChanges) return

    const timeoutId = setTimeout(() => {
      handleSaveChanges()
    }, 2000) // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId)
  }, [caption, hashtags, hasChanges])

  // Get auth token
  const getToken = () => localStorage.getItem('access_token')

  // Save caption/hashtags changes
  const handleSaveChanges = useCallback(async () => {
    if (!hasChanges) return
    await onSave({ caption, hashtags })
    setHasChanges(false)
  }, [caption, hashtags, hasChanges, onSave])

  // Handle edit via AI
  const handleEditViaAI = async (editType: string, instructions?: string, keepImage?: boolean) => {
    try {
      setIsProcessing(true)

      const token = getToken()
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`/api/posts/${post.id}/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          editType,
          instructions,
          keepImage,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to edit post')
      }

      addToast({
        type: 'success',
        title: t('editStarted'),
        message: t('editStartedMessage'),
      })

      // Refresh post data
      await onRefresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to edit post'
      addToast({
        type: 'error',
        title: t('editError'),
        message,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle regenerate post
  const handleRegenerate = async (instructions?: string, saveCurrentAsRejected: boolean = true) => {
    try {
      setIsProcessing(true)

      const token = getToken()
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`/api/posts/${post.id}/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          instructions,
          saveCurrentAsRejected,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to regenerate post')
      }

      const data = await response.json()

      addToast({
        type: 'success',
        title: t('regenerateSuccess'),
        message: t('regenerateSuccessMessage'),
      })

      // Redirect to new post if a new one was created
      if (data.post?.id && data.post.id !== post.id) {
        router.push(`/${locale}/editor/${data.post.id}`)
      } else {
        await onRefresh()
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to regenerate post'
      addToast({
        type: 'error',
        title: t('regenerateError'),
        message,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle approve
  const handleApprove = async () => {
    // Save any pending changes first
    if (hasChanges) {
      await handleSaveChanges()
    }

    // Update status to ready
    await onSave({ status: 'ready' })

    addToast({
      type: 'success',
      title: t('approvedSuccess'),
      message: t('approvedSuccessMessage'),
    })
  }

  // Handle publish
  const handlePublish = async (socialAccountId: string) => {
    try {
      setIsProcessing(true)

      const token = getToken()
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`/api/posts/${post.id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ socialAccountId }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to publish post')
      }

      addToast({
        type: 'success',
        title: t('publishSuccess'),
        message: t('publishSuccessMessage'),
      })

      await onRefresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to publish post'
      addToast({
        type: 'error',
        title: t('publishError'),
        message,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle schedule
  const handleSchedule = async (socialAccountId: string, scheduledFor: string) => {
    try {
      setIsProcessing(true)

      const token = getToken()
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`/api/posts/${post.id}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ socialAccountId, scheduledFor }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to schedule post')
      }

      addToast({
        type: 'success',
        title: t('scheduleSuccess'),
        message: t('scheduleSuccessMessage'),
      })

      await onRefresh()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to schedule post'
      addToast({
        type: 'error',
        title: t('scheduleError'),
        message,
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left column: Preview */}
      <div className="space-y-6">
        <PostPreview
          imageUrl={post.imageUrl}
          caption={caption}
          hashtags={hashtags}
        />

        {/* Unsaved changes indicator */}
        {hasChanges && (
          <div className="text-center">
            <span className="text-body-sm text-yellow-600 dark:text-yellow-400">
              {t('unsavedChanges')}
            </span>
          </div>
        )}
      </div>

      {/* Right column: Editor & Actions */}
      <div className="space-y-6">
        <CaptionEditor
          caption={caption}
          hashtags={hashtags}
          onCaptionChange={setCaption}
          onHashtagsChange={setHashtags}
          disabled={isProcessing || isSaving}
        />

        <EditActions
          postId={post.id}
          status={post.status}
          onEditViaAI={handleEditViaAI}
          onRegenerate={handleRegenerate}
          onApprove={handleApprove}
          onPublish={handlePublish}
          onSchedule={handleSchedule}
          disabled={isSaving}
          isProcessing={isProcessing}
        />
      </div>
    </div>
  )
}
