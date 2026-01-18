import Link from 'next/link'
import { Button } from '@/components/ui'

export default function HeroSection() {
  return (
    <section className="bg-white dark:bg-[#0A0A0A] py-20 md:py-32 lg:py-40">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="space-y-8">
            <h1 className="text-display font-bold text-gray-900 dark:text-gray-50 leading-tight">
              Gere posts para redes sociais em segundos
            </h1>
            <p className="text-body-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-xl">
              Imagem + legenda criadas com IA. Uma ideia simples. Resultados profissionais.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth">
                <Button variant="primary" size="lg" className="w-full sm:w-auto">
                  Começar grátis
                </Button>
              </Link>
              <a href="#como-funciona">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Ver como funciona
                </Button>
              </a>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-[#1F1F1F] dark:to-[#262626] rounded-xl aspect-video flex items-center justify-center shadow-xl">
              <div className="text-center space-y-2">
                <div className="w-16 h-16 mx-auto bg-primary-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-h2">I</span>
                </div>
                <span className="text-body-sm text-gray-500 dark:text-gray-400 block">Preview da interface</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
