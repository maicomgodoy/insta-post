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
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('myPosts')}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Veja e gerencie todos os seus posts criados.
        </p>
      </div>

      {/* Posts list or empty state */}
      {posts.length === 0 ? (
        <Card>
          <Empty
            title={tEmpty('noPosts')}
            message="Comece criando seu primeiro post com IA."
            action={{
              label: 'Criar Post',
              onClick: () => {},
            }}
          />
          <div className="flex justify-center -mt-4 mb-4">
            <Link href={`/${locale}/create-post`}>
              <Button variant="primary">Criar Post</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Posts would be mapped here */}
        </div>
      )}
    </div>
  )
}
