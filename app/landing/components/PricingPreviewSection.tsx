import Link from 'next/link'

export default function PricingPreviewSection() {
  const plans = [
    {
      name: 'Starter',
      description: 'Ideal para uso pessoal',
    },
    {
      name: 'Pro',
      description: 'Para profissionais e marcas',
    },
    {
      name: 'Premium',
      description: 'Para uso intensivo',
    },
    {
      name: 'Agência',
      description: 'Múltiplas contas e equipes',
    },
  ]

  return (
    <section className="bg-gray-50 py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full font-semibold mb-4">
            14 dias grátis
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Teste todas as funcionalidades sem compromisso
          </h2>
          <p className="text-xl text-gray-600">
            Experimente todos os planos durante 14 dias grátis
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className="bg-white border border-gray-200 rounded-lg p-6 text-center"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
              <div className="text-sm text-primary font-semibold">Incluído no teste grátis</div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link
            href="/auth"
            className="inline-block bg-primary text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary/90 transition-colors"
          >
            Começar teste grátis
          </Link>
        </div>
      </div>
    </section>
  )
}
