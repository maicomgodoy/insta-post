import Link from 'next/link'
import { Card, Button } from '@/components/ui'

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
    <section className="bg-gray-50 dark:bg-[#0A0A0A] py-20 lg:py-32">
      <div className="container mx-auto px-4 max-w-7xl">
        <div className="text-center mb-12">
          <div className="inline-block bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-4 py-2 rounded-full font-semibold mb-6 text-body-sm">
            14 dias grátis
          </div>
          <h2 className="text-h1 font-bold text-gray-900 dark:text-gray-50 mb-4">
            Teste todas as funcionalidades sem compromisso
          </h2>
          <p className="text-body-lg text-gray-500 dark:text-gray-400">
            Experimente todos os planos durante 14 dias grátis
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan, index) => (
            <Card
              key={index}
              padding="lg"
              className="text-center"
            >
              <h3 className="text-h3 font-semibold text-gray-900 dark:text-gray-50 mb-2">{plan.name}</h3>
              <p className="text-body-sm text-gray-500 dark:text-gray-400 mb-4">{plan.description}</p>
              <div className="text-body-sm text-primary-600 dark:text-primary-400 font-medium">Incluído no teste grátis</div>
            </Card>
          ))}
        </div>
        <div className="text-center">
          <Link href="/auth">
            <Button variant="primary" size="lg">
              Começar teste grátis
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
