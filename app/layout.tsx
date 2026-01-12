import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Insta Post - Gerador de Posts para Redes Sociais com IA',
  description: 'Gere posts para redes sociais em segundos. Imagem + legenda criadas com IA. Uma ideia simples. Resultados profissionais.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  )
}
