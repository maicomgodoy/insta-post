export default function BenefitsSection() {
  const benefits = [
    {
      title: 'Em segundos',
      description: 'Gere imagem e legenda completas em poucos segundos. Sem espera. Sem complicação.',
      icon: '⚡',
    },
    {
      title: 'Uma ideia simples',
      description: 'Não precisa ser designer. Não precisa ser copywriter. Basta ter uma ideia.',
      icon: '💡',
    },
    {
      title: 'Imagem + Legenda',
      description: 'Tudo que você precisa para postar. Imagem profissional e legenda pronta.',
      icon: '✨',
    },
  ]

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid md:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-8 hover:shadow-lg transition-shadow"
            >
              <div className="text-4xl mb-4">{benefit.icon}</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">{benefit.title}</h3>
              <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
