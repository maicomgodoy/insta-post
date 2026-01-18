'use client'

import { useTranslations } from 'next-intl'
import { Card, Empty, Button } from '@/components/ui'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function MyPostsPage() {
  const t = useTranslations('nav')
  const tEmpty = useTranslations('empty')
  const params = useParams()
  const locale = params.locale as string

  // TODO: Fetch user's posts from API
  const posts: unknown[] = []

  return (
    <div className="space-y-8">
      {/* Page header */}
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

      {/* Posts list or empty state */}
      {posts.length === 0 ? (
        <Card padding="lg">
          <Empty
            title={tEmpty('noPosts')}
            message="Comece criando seu primeiro post com IA. É rápido e fácil!"
            action={{
              label: 'Criar Primeiro Post',
              onClick: () => window.location.href = `/${locale}/create-post`,
            }}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Posts would be mapped here */}
        </div>
      )}
    </div>
  )
}
