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
    <section id="como-funciona" className="bg-gray-50 py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Como funciona</h2>
          <p className="text-xl text-gray-600">Três passos simples para criar posts profissionais</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 relative">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mb-6 relative z-10">
                  {step.number}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
