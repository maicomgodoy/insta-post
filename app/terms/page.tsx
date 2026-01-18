import Link from 'next/link'
import { Container } from '@/components/ui/Container'

export const metadata = {
  title: 'Termos de Serviço - Insta Post',
  description: 'Termos de Serviço do Insta Post. Leia nossos termos e condições de uso.',
}

export default function TermsOfServicePage() {
  const lastUpdated = '2024'

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Container size="md" className="py-12">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Termos de Serviço
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
            Última atualização: {lastUpdated}
          </p>

          <div className="space-y-8 text-gray-700 dark:text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                1. Aceitação dos Termos
              </h2>
              <p>
                Ao acessar ou usar o Insta Post (&quot;Serviço&quot;), você concorda em estar vinculado a estes 
                Termos de Serviço (&quot;Termos&quot;). Se você não concordar com qualquer parte destes termos, 
                não poderá acessar ou usar o Serviço.
              </p>
              <p>
                Estes Termos se aplicam a todos os visitantes, usuários e outras pessoas que acessam ou 
                usam o Serviço.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                2. Descrição do Serviço
              </h2>
              <p>
                O Insta Post é uma plataforma que permite aos usuários criar posts para redes sociais 
                utilizando inteligência artificial. Nosso serviço inclui:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Geração de imagens:</strong> Criação de imagens através de IA baseadas em suas instruções</li>
                <li><strong>Geração de legendas:</strong> Criação de textos e legendas com inteligência artificial</li>
                <li><strong>Edição de conteúdo:</strong> Ferramentas para editar e personalizar seus posts</li>
                <li><strong>Agendamento:</strong> Possibilidade de agendar publicações</li>
                <li><strong>Publicação direta:</strong> Integração com Instagram para publicação automática</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                3. Contas de Usuário
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-6">
                3.1. Registro
              </h3>
              <p>
                Para usar nosso Serviço, você deve criar uma conta fornecendo informações verdadeiras, 
                precisas e atualizadas. Você é responsável por manter a confidencialidade de sua conta 
                e senha.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-6">
                3.2. Responsabilidade
              </h3>
              <p>
                Você é responsável por todas as atividades que ocorram em sua conta. Notifique-nos 
                imediatamente sobre qualquer uso não autorizado de sua conta ou qualquer outra 
                violação de segurança.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-6">
                3.3. Idade Mínima
              </h3>
              <p>
                Você deve ter pelo menos 18 anos de idade para criar uma conta e usar o Serviço. 
                Ao criar uma conta, você declara que tem pelo menos 18 anos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                4. Assinaturas e Pagamentos
              </h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-6">
                4.1. Planos
              </h3>
              <p>
                O Serviço oferece diferentes planos de assinatura com variações de recursos e 
                créditos disponíveis. Os detalhes de cada plano estão disponíveis em nossa página 
                de preços.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-6">
                4.2. Sistema de Créditos
              </h3>
              <p>
                O uso do Serviço é baseado em um sistema de créditos. Cada operação (geração de imagem, 
                geração de legenda, edição, publicação) consome uma quantidade específica de créditos. 
                Os créditos são renovados de acordo com seu plano de assinatura.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-6">
                4.3. Cobrança
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li>Os pagamentos são processados através do Stripe</li>
                <li>As assinaturas são cobradas de forma recorrente (mensal ou anual)</li>
                <li>Você autoriza a cobrança automática no método de pagamento fornecido</li>
                <li>Os preços podem ser alterados com aviso prévio de 30 dias</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-6">
                4.4. Reembolsos
              </h3>
              <p>
                Oferecemos reembolso integral em até 7 dias após a primeira assinatura. Após este período, 
                não oferecemos reembolsos, mas você pode cancelar sua assinatura a qualquer momento para 
                evitar cobranças futuras.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-6">
                4.5. Cancelamento
              </h3>
              <p>
                Você pode cancelar sua assinatura a qualquer momento através das configurações da conta. 
                Após o cancelamento, você continuará tendo acesso ao Serviço até o final do período 
                de faturamento atual.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                5. Uso Aceitável
              </h2>
              <p className="mb-4">
                Ao usar nosso Serviço, você concorda em NÃO:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Violar leis ou regulamentações aplicáveis</li>
                <li>Criar conteúdo ilegal, prejudicial, ameaçador, abusivo, difamatório, vulgar, obsceno 
                    ou de qualquer outra forma censurável</li>
                <li>Criar conteúdo que viole direitos de propriedade intelectual de terceiros</li>
                <li>Criar conteúdo que contenha imagens de nudez, violência gráfica ou conteúdo sexual</li>
                <li>Criar conteúdo que promova ódio, discriminação ou violência contra qualquer grupo</li>
                <li>Criar conteúdo falso ou enganoso (fake news, desinformação)</li>
                <li>Usar o Serviço para spam ou marketing não solicitado</li>
                <li>Tentar acessar contas de outros usuários</li>
                <li>Interferir ou interromper o Serviço ou servidores</li>
                <li>Usar bots, scripts ou automação não autorizada</li>
                <li>Revender ou redistribuir o Serviço sem autorização</li>
              </ul>
              <p className="mt-4">
                Reservamo-nos o direito de suspender ou encerrar contas que violem estes termos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                6. Propriedade Intelectual
              </h2>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-6">
                6.1. Conteúdo do Usuário
              </h3>
              <p>
                Você mantém todos os direitos sobre o conteúdo que cria usando nosso Serviço. 
                Ao usar o Serviço, você nos concede uma licença limitada para processar, armazenar 
                e exibir seu conteúdo conforme necessário para fornecer o Serviço.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-6">
                6.2. Conteúdo Gerado por IA
              </h3>
              <p>
                As imagens e textos gerados pela IA através do Serviço são de sua propriedade para 
                uso pessoal e comercial, sujeito aos termos de uso das tecnologias de IA subjacentes.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-6">
                6.3. Propriedade do Serviço
              </h3>
              <p>
                O Serviço, incluindo seu design, código, funcionalidades e marca, é propriedade do 
                Insta Post e está protegido por leis de propriedade intelectual. Você não pode copiar, 
                modificar ou criar obras derivadas do Serviço.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                7. Integrações com Terceiros
              </h2>
              <p>
                Nosso Serviço integra-se com plataformas de terceiros (como Instagram). Ao conectar 
                suas contas de redes sociais:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Você é responsável por cumprir os termos de serviço dessas plataformas</li>
                <li>Autorizamos a publicação apenas quando você solicitar explicitamente</li>
                <li>Não nos responsabilizamos por alterações nas APIs ou políticas de terceiros</li>
                <li>Você pode desconectar suas contas a qualquer momento</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                8. Isenção de Garantias
              </h2>
              <p>
                O Serviço é fornecido &quot;como está&quot; e &quot;conforme disponível&quot;, sem garantias de qualquer tipo, 
                expressas ou implícitas. Não garantimos que:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>O Serviço atenderá às suas necessidades específicas</li>
                <li>O Serviço será ininterrupto, oportuno, seguro ou livre de erros</li>
                <li>Os resultados obtidos pelo uso do Serviço serão precisos ou confiáveis</li>
                <li>O conteúdo gerado por IA será adequado para todos os fins</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                9. Limitação de Responsabilidade
              </h2>
              <p>
                Em nenhuma circunstância o Insta Post, seus diretores, funcionários, parceiros ou 
                fornecedores serão responsáveis por quaisquer danos indiretos, incidentais, especiais, 
                consequenciais ou punitivos, incluindo, sem limitação, perda de lucros, dados, uso ou 
                outra perda intangível, resultantes de:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Uso ou incapacidade de usar o Serviço</li>
                <li>Acesso não autorizado ou alteração de suas transmissões ou dados</li>
                <li>Declarações ou conduta de terceiros no Serviço</li>
                <li>Qualquer outro assunto relacionado ao Serviço</li>
              </ul>
              <p className="mt-4">
                Nossa responsabilidade total não excederá o valor pago por você nos últimos 12 meses.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                10. Indenização
              </h2>
              <p>
                Você concorda em indenizar e isentar o Insta Post e seus afiliados de quaisquer 
                reivindicações, danos, obrigações, perdas, responsabilidades, custos ou dívidas 
                decorrentes de:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Seu uso e acesso ao Serviço</li>
                <li>Sua violação destes Termos</li>
                <li>Sua violação de direitos de terceiros</li>
                <li>Conteúdo que você criar ou publicar através do Serviço</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                11. Modificações do Serviço
              </h2>
              <p>
                Reservamo-nos o direito de modificar ou descontinuar, temporária ou permanentemente, 
                o Serviço (ou qualquer parte dele) com ou sem aviso prévio. Não seremos responsáveis 
                perante você ou terceiros por qualquer modificação, suspensão ou descontinuação do Serviço.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                12. Encerramento
              </h2>
              <p>
                Podemos encerrar ou suspender sua conta imediatamente, sem aviso prévio ou 
                responsabilidade, por qualquer motivo, incluindo, sem limitação, se você violar 
                estes Termos.
              </p>
              <p className="mt-4">
                Após o encerramento, seu direito de usar o Serviço cessará imediatamente. Se você 
                desejar encerrar sua conta, poderá simplesmente descontinuar o uso do Serviço ou 
                solicitar a exclusão através das configurações.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                13. Lei Aplicável
              </h2>
              <p>
                Estes Termos serão regidos e interpretados de acordo com as leis do Brasil, 
                independentemente de conflitos de disposições legais. Nossa falha em fazer cumprir 
                qualquer direito ou disposição destes Termos não será considerada uma renúncia 
                a esses direitos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                14. Resolução de Disputas
              </h2>
              <p>
                Qualquer disputa relacionada a estes Termos será resolvida através de negociação 
                amigável. Se não for possível resolver a disputa amigavelmente, ela será submetida 
                à arbitragem ou ao foro da comarca do Rio de Janeiro, Brasil.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                15. Alterações nos Termos
              </h2>
              <p>
                Reservamo-nos o direito de modificar ou substituir estes Termos a qualquer momento. 
                Se uma revisão for material, tentaremos fornecer aviso com pelo menos 30 dias de 
                antecedência antes de quaisquer novos termos entrarem em vigor.
              </p>
              <p className="mt-4">
                Ao continuar a acessar ou usar nosso Serviço após essas revisões entrarem em vigor, 
                você concorda em estar vinculado aos termos revisados.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                16. Contato
              </h2>
              <p>
                Se você tiver dúvidas sobre estes Termos de Serviço, entre em contato conosco:
              </p>
              <ul className="list-none pl-0 space-y-2 mt-4">
                <li><strong>Email:</strong> suporte@instapost.com</li>
                <li><strong>Página de Suporte:</strong> <Link href="/support" className="text-primary hover:underline">/support</Link></li>
              </ul>
            </section>

            <section className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-12">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Ao usar o Insta Post, você reconhece que leu, entendeu e concorda em estar vinculado 
                a estes Termos de Serviço.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700 flex gap-4">
            <Link 
              href="/" 
              className="text-primary hover:underline text-sm font-medium"
            >
              ← Voltar para a página inicial
            </Link>
            <span className="text-gray-400">|</span>
            <Link 
              href="/privacy" 
              className="text-primary hover:underline text-sm font-medium"
            >
              Política de Privacidade
            </Link>
          </div>
        </div>
      </Container>
    </div>
  )
}
