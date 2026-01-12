import Link from 'next/link'

export default function CTASection() {
  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Pronto para criar seus posts?
          </h2>
          <p className="text-xl text-gray-600">
            Comece agora. 14 dias grátis. Sem cartão de crédito.
          </p>
          <Link
            href="/signup"
            className="inline-block bg-primary text-white px-10 py-5 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors"
          >
            Começar grátis
          </Link>
        </div>
      </div>
    </section>
  )
}
