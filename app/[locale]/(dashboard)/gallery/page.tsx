'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Card, Button, Loading, Empty, Error as ErrorComponent } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import Image from 'next/image'

interface RejectedImage {
  id: string
  imageUrl: string
  caption: string | null
  hashtags: string | null
  rejectedAt: string
  createdAt: string
  originalPost: {
    id: string
    status: string
  } | null
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
  hasMore: boolean
}

export default function GalleryPage() {
  const t = useTranslations('gallery')
  const { addToast } = useToast()
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale as string

  const [images, setImages] = useState<RejectedImage[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<RejectedImage | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  // Fetch images
  const fetchImages = useCallback(async (page = 1) => {
    try {
      setIsLoading(true)
      setError(null)

      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`/api/rejected-images?page=${page}&limit=20`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to fetch images')
      }

      const data = await response.json()
      setImages(data.images)
      setPagination(data.pagination)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load images'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  // Handle reuse image
  const handleReuse = async (imageId: string) => {
    try {
      setIsProcessing(true)

      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`/api/rejected-images/${imageId}/reuse`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to reuse image')
      }

      const data = await response.json()

      addToast({
        type: 'success',
        title: t('reuseSuccess'),
        message: t('reuseSuccessMessage'),
      })

      // Redirect to editor
      router.push(`/${locale}/editor/${data.post.id}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to reuse image'
      addToast({
        type: 'error',
        title: t('reuseError'),
        message,
      })
    } finally {
      setIsProcessing(false)
      setSelectedImage(null)
    }
  }

  // Handle delete image
  const handleDelete = async (imageId: string) => {
    if (!confirm(t('confirmDelete'))) return

    try {
      setIsProcessing(true)

      const token = localStorage.getItem('access_token')
      if (!token) {
        throw new Error('No authentication token')
      }

      const response = await fetch(`/api/rejected-images/${imageId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || 'Failed to delete image')
      }

      addToast({
        type: 'success',
        title: t('deleteSuccess'),
        message: t('deleteSuccessMessage'),
      })

      // Refresh list
      await fetchImages(pagination?.page || 1)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete image'
      addToast({
        type: 'error',
        title: t('deleteError'),
        message,
      })
    } finally {
      setIsProcessing(false)
      setSelectedImage(null)
    }
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // Render loading state
  if (isLoading && images.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loading size="lg" text={t('loading')} />
      </div>
    )
  }

  // Render error state
  if (error && images.length === 0) {
    return (
      <ErrorComponent
        title={t('errorTitle')}
        message={error}
        onRetry={() => fetchImages()}
        retryText={t('retry')}
      />
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-h1 font-bold text-gray-900 dark:text-gray-50">
          {t('title')}
        </h1>
        <p className="mt-2 text-body-lg text-gray-500 dark:text-gray-400">
          {t('subtitle')}
        </p>
      </div>

      {/* Empty state */}
      {images.length === 0 && !isLoading && (
        <Empty
          title={t('emptyTitle')}
          message={t('emptyDescription')}
          icon={
            <svg
              className="w-16 h-16 text-gray-300 dark:text-gray-600"
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
          }
        />
      )}

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => (
            <div
              key={image.id}
              onClick={() => setSelectedImage(image)}
              className="cursor-pointer"
            >
              <Card
                padding="none"
                className="overflow-hidden group"
              >
                <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={image.imageUrl}
                    alt={t('rejectedImage')}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-white font-medium">
                      {t('clickToView')}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-body-xs text-gray-500 dark:text-gray-400">
                    {formatDate(image.rejectedAt)}
                  </p>
                </div>
              </Card>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchImages(pagination.page - 1)}
            disabled={pagination.page === 1 || isLoading}
          >
            {t('previousPage')}
          </Button>
          <span className="px-4 py-2 text-body-sm text-gray-600 dark:text-gray-400">
            {t('pageInfo', { current: pagination.page, total: pagination.totalPages })}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchImages(pagination.page + 1)}
            disabled={!pagination.hasMore || isLoading}
          >
            {t('nextPage')}
          </Button>
        </div>
      )}

      {/* Image detail modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/70 transition-opacity"
            onClick={() => setSelectedImage(null)}
          />
          <div className="flex min-h-full items-center justify-center p-4">
            <Card className="relative w-full max-w-2xl bg-white dark:bg-gray-900 shadow-xl">
              <div className="p-4">
                {/* Close button */}
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Image */}
                <div className="relative aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden mb-4">
                  <Image
                    src={selectedImage.imageUrl}
                    alt={t('rejectedImage')}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>

                {/* Info */}
                <div className="space-y-2 mb-4">
                  <p className="text-body-sm text-gray-500 dark:text-gray-400">
                    <span className="font-medium">{t('rejectedOn')}:</span>{' '}
                    {formatDate(selectedImage.rejectedAt)}
                  </p>
                  {selectedImage.caption && (
                    <p className="text-body-sm text-gray-700 dark:text-gray-300">
                      <span className="font-medium">{t('originalCaption')}:</span>{' '}
                      {selectedImage.caption}
                    </p>
                  )}
                  {selectedImage.hashtags && (
                    <p className="text-body-sm text-blue-600 dark:text-blue-400">
                      {selectedImage.hashtags}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleDelete(selectedImage.id)}
                    disabled={isProcessing}
                    className="flex-1"
                  >
                    🗑️ {t('delete')}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => handleReuse(selectedImage.id)}
                    loading={isProcessing}
                    className="flex-1"
                  >
                    ♻️ {t('reuseImage')}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
