import { Card } from '@/components/ui'

export default function HowItWorksSection() {
  const steps = [
    {
      number: '1',
      title: 'Digite sua ideia',
      description: 'Informe o que você quer postar de forma simples e direta.',
    },
    {
      number: '2',
      title: 'IA cria imagem + legenda',
      description: 'Nossa IA gera automaticamente uma imagem profissional e uma legenda completa.',
    },
    {
      number: '3',
      title: 'Edite e publique',
      description: 'Ajuste o que quiser e publique diretamente no Instagram ou agende para depois.',
    },
  ]

  return (
    <section id="como-funciona" className="bg-gray-50 dark:bg-[#0A0A0A] py-20 lg:py-32">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-h1 font-bold text-gray-900 dark:text-gray-50 mb-4">Como funciona</h2>
          <p className="text-body-lg text-gray-500 dark:text-gray-400">Três passos simples para criar posts profissionais</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
          {steps.map((step, index) => (
            <Card key={index} padding="lg" className="text-center">
              <div className="w-16 h-16 bg-primary-500 text-white rounded-full flex items-center justify-center text-h2 font-bold mb-6 mx-auto">
                {step.number}
              </div>
              <h3 className="text-h3 font-semibold text-gray-900 dark:text-gray-50 mb-3">{step.title}</h3>
              <p className="text-body text-gray-500 dark:text-gray-400 leading-relaxed">{step.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
