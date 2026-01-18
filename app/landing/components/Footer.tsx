import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#171717] dark:bg-[#0A0A0A] border-t border-gray-800 py-12 lg:py-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid md:grid-cols-4 gap-8 lg:gap-12 mb-8">
          <div>
            <h3 className="text-h4 font-bold text-gray-50 mb-4">Insta Post</h3>
            <p className="text-body-sm text-gray-400">
              Gerador de posts para redes sociais com IA
            </p>
          </div>
          <div>
            <h4 className="text-body-sm font-semibold text-gray-50 mb-4">Produto</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#como-funciona" className="text-body-sm text-gray-400 hover:text-gray-50 transition-colors">
                  Como funciona
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-body-sm text-gray-400 hover:text-gray-50 transition-colors">
                  Planos
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-body-sm font-semibold text-gray-50 mb-4">Empresa</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-body-sm text-gray-400 hover:text-gray-50 transition-colors">
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-body-sm text-gray-400 hover:text-gray-50 transition-colors">
                  Suporte
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-body-sm font-semibold text-gray-50 mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-body-sm text-gray-400 hover:text-gray-50 transition-colors">
                  Termos
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-body-sm text-gray-400 hover:text-gray-50 transition-colors">
                  Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 text-center">
          <p className="text-body-sm text-gray-400">
            © {currentYear} Insta Post. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
