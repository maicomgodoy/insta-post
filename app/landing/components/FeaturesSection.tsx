export default function FeaturesSection() {
  const features = [
    {
      title: 'Geração com IA',
      description: 'Imagem e legenda geradas automaticamente',
      icon: '✨',
    },
    {
      title: 'Editor Intuitivo',
      description: 'Edite manualmente ou peça ajustes à IA',
      icon: '✏️',
    },
    {
      title: 'Agendamento',
      description: 'Publique agora ou agende para depois',
      icon: '📅',
    },
    {
      title: 'Integração Instagram',
      description: 'Conecte e publique direto',
      icon: '📱',
    },
    {
      title: 'Sem Curva de Aprendizado',
      description: 'Interface simples e direta',
      icon: '🎨',
    },
    {
      title: 'Histórico Completo',
      description: 'Todos os seus posts organizados',
      icon: '💾',
    },
  ]

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Tudo que você precisa</h2>
          <p className="text-xl text-gray-600">Funcionalidades pensadas para facilitar sua vida</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-4">
              <div className="text-3xl flex-shrink-0">{feature.icon}</div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
