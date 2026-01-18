import { Card } from '@/components/ui'

export default function BenefitsSection() {
  const benefits = [
    {
      title: 'Em segundos',
      description: 'Gere imagem e legenda completas em poucos segundos. Sem espera. Sem complicação.',
      icon: (
        <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      title: 'Uma ideia simples',
      description: 'Não precisa ser designer. Não precisa ser copywriter. Basta ter uma ideia.',
      icon: (
        <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      title: 'Imagem + Legenda',
      description: 'Tudo que você precisa para postar. Imagem profissional e legenda pronta.',
      icon: (
        <svg className="w-8 h-8 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ]

  return (
    <section className="bg-gray-50 dark:bg-[#0A0A0A] py-20 lg:py-32">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {benefits.map((benefit, index) => (
            <Card
              key={index}
              padding="lg"
              className="hover:shadow-lg transition-all duration-fast"
            >
              <div className="w-12 h-12 rounded-lg bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-6">
                {benefit.icon}
              </div>
              <h3 className="text-h3 font-semibold text-gray-900 dark:text-gray-50 mb-3">{benefit.title}</h3>
              <p className="text-body text-gray-500 dark:text-gray-400 leading-relaxed">{benefit.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
