import Link from 'next/link'

export default function HeroSection() {
  return (
    <section className="bg-white py-20 md:py-32">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Gere posts para redes sociais em segundos
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 leading-relaxed">
              Imagem + legenda criadas com IA. Uma ideia simples. Resultados profissionais.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth"
                className="bg-primary text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors text-center"
              >
                Começar grátis
              </Link>
              <a
                href="#como-funciona"
                className="text-gray-700 px-8 py-4 rounded-lg font-semibold text-lg hover:text-primary transition-colors text-center border border-gray-300 hover:border-primary"
              >
                Ver como funciona
              </a>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="bg-gray-100 rounded-lg aspect-video flex items-center justify-center">
              <span className="text-gray-400 text-sm">Preview da interface</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
