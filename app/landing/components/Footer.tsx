import Link from 'next/link'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-4">Insta Post</h3>
            <p className="text-sm text-gray-600">
              Gerador de posts para redes sociais com IA
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Produto</h4>
            <ul className="space-y-2">
              <li>
                <Link href="#como-funciona" className="text-sm text-gray-600 hover:text-primary transition-colors">
                  Como funciona
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="text-sm text-gray-600 hover:text-primary transition-colors">
                  Planos
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Empresa</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-gray-600 hover:text-primary transition-colors">
                  Sobre
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-sm text-gray-600 hover:text-primary transition-colors">
                  Suporte
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="text-sm text-gray-600 hover:text-primary transition-colors">
                  Termos
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-gray-600 hover:text-primary transition-colors">
                  Privacidade
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-200 pt-8 text-center">
          <p className="text-sm text-gray-600">
            © {currentYear} Insta Post. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
