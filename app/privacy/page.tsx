import Link from 'next/link'
import { Container } from '@/components/ui/Container'

export const metadata = {
  title: 'Política de Privacidade - Insta Post',
  description: 'Política de privacidade do Insta Post. Saiba como coletamos, usamos e protegemos seus dados.',
}

export default function PrivacyPolicyPage() {
  const lastUpdated = '2024'

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Container size="md" className="py-12">
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Política de Privacidade
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-8">
            Última atualização: {lastUpdated}
          </p>

          <div className="space-y-8 text-gray-700 dark:text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                1. Introdução
              </h2>
              <p>
                Esta Política de Privacidade descreve como o Insta Post (&quot;nós&quot;, &quot;nosso&quot; ou &quot;aplicativo&quot;) 
                coleta, usa e protege suas informações pessoais quando você utiliza nosso serviço de 
                geração de posts para redes sociais com inteligência artificial.
              </p>
              <p>
                Ao usar nosso serviço, você concorda com a coleta e uso de informações de acordo com 
                esta política. Se você não concordar, por favor, não utilize nosso serviço.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                2. Informações que Coletamos
              </h2>
              
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-6">
                2.1. Informações de Conta
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Email:</strong> Usado para autenticação e comunicação</li>
                <li><strong>Senha:</strong> Armazenada de forma criptografada e segura</li>
                <li><strong>Preferências:</strong> Idioma e tema (claro/escuro) selecionados</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-6">
                2.2. Conteúdo Criado
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Posts gerados:</strong> Imagens e legendas criadas através de IA</li>
                <li><strong>Histórico de edições:</strong> Alterações feitas nos posts</li>
                <li><strong>Agendamentos:</strong> Data e hora de posts agendados</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-6">
                2.3. Contas Sociais Conectadas
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Tokens de acesso:</strong> Necessários para publicar posts no Instagram</li>
                <li><strong>Informações da conta:</strong> Nome de usuário e ID da conta conectada</li>
                <li>Estes dados são armazenados de forma criptografada e usados apenas para publicar seus posts</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3 mt-6">
                2.4. Informações de Assinatura
              </h3>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Dados de pagamento:</strong> Processados pelo Stripe (não armazenamos dados de cartão)</li>
                <li><strong>Plano selecionado:</strong> Tipo de assinatura e créditos disponíveis</li>
                <li><strong>Histórico de uso:</strong> Consumo de créditos e operações realizadas</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                3. Como Usamos suas Informações
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Fornecer o serviço:</strong> Gerar posts, editar conteúdo e publicar nas redes sociais</li>
                <li><strong>Processar pagamentos:</strong> Gerenciar assinaturas e renovações</li>
                <li><strong>Comunicação:</strong> Enviar emails transacionais (confirmações, notificações, suporte)</li>
                <li><strong>Melhorar o serviço:</strong> Analisar uso para aprimorar funcionalidades</li>
                <li><strong>Segurança:</strong> Detectar e prevenir fraudes ou uso indevido</li>
                <li><strong>Cumprimento legal:</strong> Atender obrigações legais e regulatórias</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                4. Serviços de Terceiros
              </h2>
              <p className="mb-4">
                Utilizamos os seguintes serviços de terceiros que podem ter acesso às suas informações:
              </p>
              
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Supabase:</strong> Banco de dados e autenticação. 
                  Seus dados são armazenados de forma segura e protegidos por políticas de segurança rigorosas.
                </li>
                <li>
                  <strong>Stripe:</strong> Processamento de pagamentos. 
                  Dados de cartão de crédito são processados diretamente pelo Stripe e nunca armazenados em nossos servidores.
                </li>
                <li>
                  <strong>Fal.ai:</strong> Geração e edição de imagens com IA. 
                  As instruções de geração são enviadas para criar suas imagens.
                </li>
                <li>
                  <strong>OpenAI:</strong> Geração de legendas com inteligência artificial. 
                  Seus prompts são processados para criar o conteúdo textual.
                </li>
                <li>
                  <strong>Cloudflare R2:</strong> Armazenamento de imagens geradas. 
                  Suas imagens são armazenadas de forma segura e privada.
                </li>
                <li>
                  <strong>SendPulse:</strong> Envio de emails transacionais e de marketing. 
                  Usado apenas para comunicação com você sobre o serviço.
                </li>
                <li>
                  <strong>Instagram API:</strong> Publicação de posts. 
                  Usado apenas quando você autoriza e solicita a publicação.
                </li>
              </ul>
              
              <p className="mt-4">
                Todos esses serviços são contratados com empresas que seguem padrões rigorosos de segurança 
                e privacidade de dados.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                5. Segurança dos Dados
              </h2>
              <p className="mb-4">
                Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Criptografia de dados sensíveis (senhas, tokens de acesso)</li>
                <li>Autenticação segura através do Supabase Auth</li>
                <li>Row Level Security (RLS) no banco de dados para isolar dados por usuário</li>
                <li>Acesso restrito a dados pessoais apenas para funcionários autorizados</li>
                <li>Monitoramento contínuo de segurança e detecção de ameaças</li>
                <li>Backups regulares dos dados</li>
              </ul>
              <p className="mt-4">
                Apesar de nossos esforços, nenhum método de transmissão ou armazenamento é 100% seguro. 
                Não podemos garantir segurança absoluta, mas nos comprometemos a proteger seus dados da melhor forma possível.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                6. Seus Direitos
              </h2>
              <p className="mb-4">
                Você tem os seguintes direitos em relação aos seus dados pessoais:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Acesso:</strong> Solicitar uma cópia dos dados que temos sobre você</li>
                <li><strong>Correção:</strong> Solicitar correção de dados incorretos ou desatualizados</li>
                <li><strong>Exclusão:</strong> Solicitar a exclusão de seus dados pessoais</li>
                <li><strong>Portabilidade:</strong> Solicitar exportação dos seus dados em formato legível</li>
                <li><strong>Oposição:</strong> Opor-se ao processamento de seus dados para certas finalidades</li>
                <li><strong>Revogação de consentimento:</strong> Retirar consentimento para processamento de dados</li>
              </ul>
              <p className="mt-4">
                Para exercer esses direitos, entre em contato conosco através do email de suporte 
                ou pelas configurações da sua conta.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                7. Retenção de Dados
              </h2>
              <p>
                Mantemos seus dados pessoais apenas pelo tempo necessário para fornecer o serviço, 
                cumprir obrigações legais ou resolver disputas. Quando você exclui sua conta, 
                seus dados são removidos de nossos sistemas, exceto quando a retenção for necessária 
                por motivos legais ou de segurança.
              </p>
              <p className="mt-4">
                Posts criados podem ser mantidos por um período após a exclusão da conta para fins 
                de backup e recuperação, mas serão permanentemente excluídos após o período de retenção.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                8. Cookies e Tecnologias Similares
              </h2>
              <p>
                Utilizamos cookies e tecnologias similares para melhorar sua experiência, autenticação 
                e funcionalidades do serviço. Você pode configurar seu navegador para recusar cookies, 
                mas isso pode afetar algumas funcionalidades do aplicativo.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                9. Privacidade de Menores
              </h2>
              <p>
                Nosso serviço não é direcionado a menores de 18 anos. Não coletamos intencionalmente 
                informações de menores. Se você é pai/mãe ou responsável e acredita que seu filho 
                nos forneceu informações pessoais, entre em contato conosco para removermos essas informações.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                10. Alterações nesta Política
              </h2>
              <p>
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre 
                mudanças significativas publicando a nova política nesta página e atualizando a data 
                de &quot;Última atualização&quot;. Recomendamos que você revise esta política periodicamente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                11. Contato
              </h2>
              <p>
                Se você tiver dúvidas sobre esta Política de Privacidade ou sobre como tratamos seus dados, 
                entre em contato conosco:
              </p>
              <ul className="list-none pl-0 space-y-2 mt-4">
                <li><strong>Email:</strong> suporte@instapost.com</li>
                <li><strong>Página de Suporte:</strong> <Link href="/support" className="text-primary hover:underline">/support</Link></li>
              </ul>
            </section>

            <section className="border-t border-gray-200 dark:border-gray-700 pt-8 mt-12">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD) do Brasil 
                e outras regulamentações aplicáveis de proteção de dados.
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
            <Link 
              href="/" 
              className="text-primary hover:underline text-sm font-medium"
            >
              ← Voltar para a página inicial
            </Link>
          </div>
        </div>
      </Container>
    </div>
  )
}
