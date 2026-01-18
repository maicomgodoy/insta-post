import Link from 'next/link'
import { Button } from '@/components/ui'

export default function CTASection() {
  return (
    <section className="bg-primary-500 dark:bg-primary-600 py-20 lg:py-32">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center space-y-8">
          <h2 className="text-h1 font-bold text-white">
            Pronto para criar seus posts?
          </h2>
          <p className="text-body-lg text-white/90">
            Comece agora. 14 dias grátis. Sem cartão de crédito.
          </p>
          <Link href="/auth">
            <Button variant="secondary" size="lg" className="bg-white text-primary-600 hover:bg-gray-100">
              Começar grátis
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
