'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Card, Empty, Button, Loading, Error as ErrorComponent } from '@/components/ui'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import { useToast } from '@/components/ui/Toast'

interface Post {
  id: string
  imageUrl: string
  caption: string
  status: string
  scheduledFor: string | null
  publishedAt: string | null
  createdAt: string
  socialAccount: { id: string; accountUsername: string; platform: string } | null
}

const LIMIT = 20

export default function MyPostsPage() {
  const t = useTranslations('nav')
  const tEmpty = useTranslations('empty')
  const { addToast } = useToast()
  const router = useRouter()
  const params = useParams()
  const locale = params.locale as string

  const [posts, setPosts] = useState<Post[]>([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [actionId, setActionId] = useState<string | null>(null)

  const fetchPosts = useCallback(
    async (append = false) => {
      const token = localStorage.getItem('access_token')
      if (!token) {
        setError('No authentication token')
        setIsLoading(false)
        return
      }

      const currentOffset = append ? offset : 0
      try {
        if (append) setIsLoadingMore(true)
        else setIsLoading(true)
        setError(null)

        const res = await fetch(
          `/api/posts?limit=${LIMIT}&offset=${currentOffset}&orderBy=createdAt&order=desc`,
          { headers: { Authorization: `Bearer ${token}` } }
        )

        if (!res.ok) throw new Error('Failed to fetch posts')

        const data = await res.json()
        const list: Post[] = data.posts ?? []
        const pagination = data.pagination ?? {}

        if (append) {
          setPosts((prev) => [...prev, ...list])
        } else {
          setPosts(list)
        }
        setOffset(currentOffset + list.length)
        setHasMore(pagination.hasMore ?? false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load posts')
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    },
    [offset]
  )

  useEffect(() => {
    fetchPosts(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetch only on mount; fetchPosts depends on offset
  }, [])

  const loadMore = () => {
    fetchPosts(true)
  }

  const handleReuse = async (post: Post) => {
    const token = localStorage.getItem('access_token')
    if (!token) return

    setActionId(post.id)
    try {
      const getRes = await fetch(`/api/posts/${post.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!getRes.ok) throw new Error('Failed to load post')
      const { post: full } = await getRes.json()

      const createRes = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          imageUrl: full.imageUrl,
          caption: full.caption || ' ',
        }),
      })
      if (!createRes.ok) {
        const err = await createRes.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to create post')
      }
      const { post: created } = await createRes.json()

      addToast({
        type: 'success',
        title: 'Post reutilizado',
        message: 'Um novo post foi criado a partir deste. Você pode editá-lo no editor.',
      })
      router.push(`/${locale}/editor/${created.id}`)
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Erro ao reutilizar',
        message: err instanceof Error ? err.message : 'Não foi possível reutilizar o post.',
      })
    } finally {
      setActionId(null)
    }
  }

  const handleDelete = async (post: Post) => {
    if (post.status === 'published') {
      addToast({
        type: 'error',
        title: 'Não permitido',
        message: 'Não é possível excluir um post já publicado.',
      })
      return
    }
    if (!confirm('Excluir este post? Esta ação não pode ser desfeita.')) return

    const token = localStorage.getItem('access_token')
    if (!token) return

    setActionId(post.id)
    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Failed to delete')
      }
      addToast({
        type: 'success',
        title: 'Post excluído',
        message: 'O post foi removido com sucesso.',
      })
      setPosts((prev) => prev.filter((p) => p.id !== post.id))
    } catch (err) {
      addToast({
        type: 'error',
        title: 'Erro ao excluir',
        message: err instanceof Error ? err.message : 'Não foi possível excluir o post.',
      })
    } finally {
      setActionId(null)
    }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loading size="lg" text="Carregando posts..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-h1 font-bold text-gray-900 dark:text-gray-50">
            {t('myPosts')}
          </h1>
          <p className="mt-2 text-body-lg text-gray-500 dark:text-gray-400">
            Veja e gerencie todos os seus posts criados.
          </p>
        </div>
        <ErrorComponent
          title="Erro ao carregar"
          message={error}
          onRetry={() => fetchPosts(false)}
          retryText="Tentar novamente"
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-h1 font-bold text-gray-900 dark:text-gray-50">
            {t('myPosts')}
          </h1>
          <p className="mt-2 text-body-lg text-gray-500 dark:text-gray-400">
            Veja e gerencie todos os seus posts criados.
          </p>
        </div>
        <Link href={`/${locale}/create-post`}>
          <Button variant="primary" size="lg">
            Criar Post
          </Button>
        </Link>
      </div>

      {posts.length === 0 ? (
        <Card padding="lg">
          <Empty
            title={tEmpty('noPosts')}
            message="Comece criando seu primeiro post com IA. É rápido e fácil!"
            action={{
              label: 'Criar Primeiro Post',
              onClick: () => (window.location.href = `/${locale}/create-post`),
            }}
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <Card key={post.id} padding="none" className="overflow-hidden">
                <Link
                  href={`/${locale}/editor/${post.id}`}
                  className="block group"
                >
                  <div className="relative aspect-square bg-gray-100 dark:bg-gray-800">
                    {post.imageUrl.startsWith('http') ? (
                      <Image
                        src={post.imageUrl}
                        alt=""
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                        sizes="(max-width: 768px) 100vw, 33vw"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-400 dark:text-gray-600">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" />
                        </svg>
                      </div>
                    )}
                    <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-medium rounded bg-black/50 text-white capitalize">
                      {post.status}
                    </span>
                  </div>
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-body-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-1">
                      {post.caption || 'Sem legenda'}
                    </p>
                    <p className="text-body-xs text-gray-500 dark:text-gray-400">
                      {formatDate(post.createdAt)}
                    </p>
                  </div>
                </Link>
                <div className="flex gap-2 p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <Link href={`/${locale}/editor/${post.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      Editar
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      handleReuse(post)
                    }}
                    disabled={!!actionId}
                    loading={actionId === post.id}
                  >
                    Reutilizar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault()
                      handleDelete(post)
                    }}
                    disabled={post.status === 'published' || !!actionId}
                    loading={actionId === post.id}
                  >
                    Excluir
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                size="lg"
                onClick={loadMore}
                loading={isLoadingMore}
              >
                Carregar mais
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
