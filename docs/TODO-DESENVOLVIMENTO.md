# TODO LIST - DESENVOLVIMENTO INSTA POST

Lista estruturada de tarefas para desenvolvimento do MVP, organizadas por ordem de execução e responsabilidade.

---

## 📋 LEGENDA

- 👤 **Você faz:** Tarefas que você (usuário) precisa executar (setup, configurações, etc)
- 🤖 **IA desenvolve:** Tarefas que a IA vai implementar (código)
- ⚠️ **Depende de:** Tarefas anteriores necessárias
- ✅ **Checkpoint:** Ponto de validação antes de continuar

---

## FASE 1: SETUP INICIAL E INFRAESTRUTURA

### 1.1. Configuração do Repositório
- 👤 **Você faz:**
  - [x] Criar repositório Git (GitHub/GitLab)
  - [x] Inicializar repositório local
  - [x] Criar estrutura básica de pastas conforme planejamento
  - [x] Adicionar .gitignore apropriado

- 🤖 **IA desenvolve:**
  - [x] Estrutura de pastas completa do projeto
  - [x] package.json com dependências base
  - [x] .gitignore configurado
  - [x] README.md de desenvolvimento (se necessário)

**Checkpoint:** Repositório configurado e estrutura base criada

---

### 1.2. Configuração de Contas e Serviços
- 👤 **Você faz:**
  - [x] Criar conta Supabase (auto-hospedado) e configurar
  - [ ] Criar conta Stripe e obter chaves (teste e produção)
  - [ ] Criar conta Trigger.dev e configurar
  - [ ] Criar conta OpenAI e obter API key (modelo LLM inicial)
  - [ ] Criar conta Fal.ai e obter API key
  - [ ] Criar conta Cloudflare R2 e configurar bucket
  - [ ] Criar conta Instagram Developer (para OAuth)
  - [ ] Documentar todas as credenciais (de forma segura)

**Checkpoint:** Todas as contas criadas e credenciais documentadas

---

### 1.3. Configuração de Variáveis de Ambiente
- 🤖 **IA desenvolve:**
  - [x] Criar arquivo .env.example com todas as variáveis necessárias
  - [x] Documentar cada variável no README ou arquivo específico

- 👤 **Você faz:**
  - [x] Criar .env.local (desenvolvimento) baseado no .env.example
  - [x] Preencher todas as variáveis com credenciais reais
  - [ ] Configurar .env de produção (quando necessário)

**Checkpoint:** Variáveis de ambiente configuradas

---

## FASE 2: BANCO DE DADOS E SCHEMA

### 2.1. Configuração do Prisma
- 🤖 **IA desenvolve:**
  - [x] Instalar e configurar Prisma
  - [x] Configurar conexão com Supabase PostgreSQL
  - [x] Criar schema.prisma inicial

**Checkpoint:** Prisma configurado e conectado

---

### 2.2. Schema do Banco de Dados
- 🤖 **IA desenvolve:**
  - [x] Schema de Usuários (users)
  - [x] Schema de Assinaturas (subscriptions)
  - [x] Schema de Planos (plans)
  - [x] Schema de Créditos (credits/usage)
  - [x] Schema de Posts (posts)
  - [x] Schema de Contas Sociais Conectadas (social_accounts)
  - [x] Schema de Posts Agendados (scheduled_posts)
  - [x] Relacionamentos entre tabelas
  - [x] Índices necessários para performance
  - [x] Migração inicial do Prisma

**Checkpoint:** Schema criado e migrado com sucesso

---

### 2.3. Row Level Security (RLS) - Supabase
- 🤖 **IA desenvolve:**
  - [x] Configurar políticas RLS no Supabase
  - [x] Políticas de acesso para cada tabela
  - [ ] Testes de segurança básicos (pode ser feito depois)

**Checkpoint:** RLS configurado e testado

---

## FASE 3: BACKEND - BASE E AUTENTICAÇÃO

### 3.1. Estrutura Base do Backend
- 🤖 **IA desenvolve:**
  - [x] Configurar Next.js API Routes (ao invés de Express)
  - [x] Estrutura de pastas do backend (app/api, src/middleware, etc)
  - [x] Middleware de tratamento de erros
  - [x] Middleware de validação (Zod)
  - [x] Configuração de logger
  - [x] Health check endpoint

**Checkpoint:** Backend base funcionando

---

### 3.2. Autenticação com Supabase
- 🤖 **IA desenvolve:**
  - [x] Integração com Supabase Auth
  - [x] Middleware de autenticação
  - [x] Endpoints de login/logout/registro
  - [x] Refresh token handling
  - [x] Proteção de rotas autenticadas

**Checkpoint:** Autenticação funcionando

---

### 3.3. Integração com Stripe
- 🤖 **IA desenvolve:**
  - [ ] Instalar e configurar SDK do Stripe
  - [ ] Criar produtos e preços no Stripe (Starter, Pro, Premium, Agência)
  - [ ] Webhook handler para eventos do Stripe
  - [ ] Endpoints para criar checkout session
  - [ ] Sincronização de assinaturas com banco de dados
  - [ ] Lógica de verificação de plano ativo

**Checkpoint:** Stripe integrado e webhooks funcionando

---

### 3.4. Sistema de Créditos e Planos
- 🤖 **IA desenvolve:**
  - [x] Lógica de gerenciamento de créditos
  - [x] Verificação de créditos disponíveis
  - [x] Consumo de créditos por operação
  - [x] Renovação mensal de créditos
  - [x] Validação de limites por plano
  - [x] Endpoints para consultar créditos

**Checkpoint:** Sistema de créditos funcionando

---

## FASE 4: BACKEND - INTEGRAÇÕES COM IA

### 4.1. Configuração do Trigger.dev
- 👤 **Você faz:**
  - [ ] Configurar projeto no Trigger.dev
  - [ ] Obter credenciais e configurar

- 🤖 **IA desenvolve:**
  - [ ] Configurar Trigger.dev no projeto
  - [ ] Estrutura base para jobs assíncronos

**Checkpoint:** Trigger.dev configurado

---

### 4.2. Integração OpenRouter (Geração de Texto)
- 🤖 **IA desenvolve:**
  - [ ] Integração com API OpenRouter
  - [ ] Job Trigger.dev para geração de texto (legenda)
  - [ ] Tratamento de erros e retry
  - [ ] Cálculo de custo em créditos por modelo
  - [ ] Endpoint para disparar geração de texto

**Checkpoint:** Geração de texto funcionando

---

### 4.3. Integração Fal.ai (Geração de Imagem)
- 🤖 **IA desenvolve:**
  - [ ] Integração com API Fal.ai
  - [ ] Job Trigger.dev para geração de imagem
  - [ ] Tratamento de erros e retry
  - [ ] Cálculo de custo em créditos por modelo
  - [ ] Endpoint para disparar geração de imagem

**Checkpoint:** Geração de imagem funcionando

---

### 4.4. Integração Fal.ai (Edição de Imagem)
- 🤖 **IA desenvolve:**
  - [ ] Integração com modelo próprio de edição (Fal.ai)
  - [ ] Job Trigger.dev para edição de imagem
  - [ ] Processamento de instruções de edição
  - [ ] Cálculo de custo em créditos
  - [ ] Endpoint para disparar edição de imagem

**Checkpoint:** Edição de imagem funcionando

---

### 4.5. Integração Cloudflare R2
- 🤖 **IA desenvolve:**
  - [ ] Configurar SDK do Cloudflare R2
  - [ ] Upload de imagens geradas para R2
  - [ ] Geração de URLs públicas/assinadas
  - [ ] Funções de gerenciamento de arquivos

**Checkpoint:** R2 configurado e upload funcionando

---

## FASE 5: BACKEND - APIs DE NEGÓCIO

### 5.1. API de Posts
- 🤖 **IA desenvolve:**
  - [ ] Endpoint: Criar post (dispara geração de texto + imagem)
  - [ ] Endpoint: Listar posts do usuário
  - [ ] Endpoint: Buscar post por ID
  - [ ] Endpoint: Atualizar post
  - [ ] Endpoint: Deletar post
  - [ ] Validações e permissões

**Checkpoint:** CRUD de posts funcionando

---

### 5.2. API de Reutilização de Posts
- 🤖 **IA desenvolve:**
  - [ ] Endpoint: Reutilizar post
  - [ ] Lógica de análise do post original + novas instruções
  - [ ] Integração com IA para reutilização
  - [ ] Criação de novo post baseado no anterior

**Checkpoint:** Reutilização de posts funcionando

---

### 5.3. API de Agendamento
- 🤖 **IA desenvolve:**
  - [ ] Endpoint: Agendar post
  - [ ] Validação de limites por plano
  - [ ] Validação de data/hora futura
  - [ ] Job Trigger.dev para publicação agendada
  - [ ] Endpoint: Listar posts agendados
  - [ ] Endpoint: Cancelar/editar agendamento

**Checkpoint:** Sistema de agendamento funcionando

---

### 5.4. Integração Instagram OAuth
- 👤 **Você faz:**
  - [ ] Configurar app no Instagram Developer
  - [ ] Obter Client ID e Client Secret
  - [ ] Configurar redirect URIs

- 🤖 **IA desenvolve:**
  - [ ] Implementar fluxo OAuth do Instagram
  - [ ] Endpoint: Iniciar OAuth
  - [ ] Endpoint: Callback OAuth
  - [ ] Armazenar tokens de acesso
  - [ ] Refresh de tokens
  - [ ] Endpoint: Listar contas conectadas
  - [ ] Endpoint: Desconectar conta

**Checkpoint:** OAuth Instagram funcionando

---

### 5.5. API de Publicação
- 🤖 **IA desenvolve:**
  - [ ] Integração com Instagram Graph API
  - [ ] Endpoint: Publicar post imediatamente
  - [ ] Job para publicar posts agendados
  - [ ] Tratamento de erros de publicação
  - [ ] Atualização de status do post

**Checkpoint:** Publicação no Instagram funcionando

---

### 5.6. API de Dashboard e Estatísticas
- 🤖 **IA desenvolve:**
  - [ ] Endpoint: Dashboard geral
  - [ ] Endpoint: Estatísticas de créditos
  - [ ] Endpoint: Estatísticas de posts (para V2)
  - [ ] Filtros por conta (plano Agência)

**Checkpoint:** Dashboard funcionando

---

### 5.7. API de Calendário
- 🤖 **IA desenvolve:**
  - [ ] Endpoint: Posts por período (calendário)
  - [ ] Agrupamento por data
  - [ ] Diferenciação entre publicado e agendado
  - [ ] Filtros por conta (plano Agência)

**Checkpoint:** Calendário funcionando

---

## FASE 6: FRONTEND - ESTRUTURA BASE

### 6.1. Configuração Next.js
- 🤖 **IA desenvolve:**
  - [x] Configurar Next.js com TypeScript
  - [x] Configurar Tailwind CSS
  - [x] Estrutura de pastas (app router)
  - [x] Configuração de tema (dark/light mode)
  - [x] Sistema de tema com Context/Provider
  - [x] Hook para alternância de tema
  - [x] Layout base com Sidebar
  - [ ] Persistir preferência de tema no perfil do usuário (opcional para MVP)

**Checkpoint:** Next.js configurado e tema funcionando

---

### 6.2. Autenticação Frontend
- 🤖 **IA desenvolve:**
  - [x] Página de login
  - [x] Página de registro
  - [x] Context/Provider de autenticação
  - [x] Hook de autenticação
  - [x] Proteção de rotas
  - [x] Middleware de autenticação Next.js

**Checkpoint:** Autenticação frontend funcionando

---

### 6.3. Componentes Base UI
- 🤖 **IA desenvolve:**
  - [x] Sidebar navegável
  - [x] Botões e componentes base (UI components)
  - [x] Loading states
  - [x] Error states
  - [x] Toast/Notifications
  - [ ] Header/Navbar completo (com botão de tema)
  - [ ] Botão de alternância de tema (Light/Dark) no Header/Navbar

**Checkpoint:** Componentes base criados

---

### 6.4. Internacionalização (i18n)
- 🤖 **IA desenvolve:**
  - [x] Configurar biblioteca de i18n (next-intl)
  - [x] Criar arquivos de tradução (pt-BR, es, en)
  - [x] Implementar detecção automática de idioma do navegador
  - [x] Aplicar traduções em telas principais
  - [ ] Seletor de idioma na tela de Configurações
  - [ ] Persistir preferência de idioma no perfil do usuário
  - [ ] Validar traduções em todos os idiomas

**Checkpoint:** Internacionalização funcionando (pt-BR, es, en)

---

## FASE 7: FRONTEND - TELAS PRINCIPAIS

### 7.1. Tela de Configurações (Assinatura e Contas)
- 🤖 **IA desenvolve:**
  - [ ] Tela de planos/assinatura
  - [ ] Integração com Stripe Checkout
  - [ ] Seção de conexão de contas Instagram
  - [ ] Fluxo OAuth integrado
  - [ ] Listagem de contas conectadas
  - [ ] Desconectar conta
  - [ ] Seletor de idioma (Português, Espanhol, Inglês)
  - [ ] Integração com sistema de i18n
  - [ ] Alternância de tema (Light/Dark mode) também disponível

**Checkpoint:** Configurações funcionando

---
<｜tool▁calls▁begin｜><｜tool▁call▁begin｜>
read_file

### 7.2. Tela Create Post
- 🤖 **IA desenvolve:**
  - [ ] Formulário de criação (input de ideia)
  - [ ] Integração com API de criação de post
  - [ ] Loading state durante geração
  - [ ] Redirecionamento para Editor após criação
  - [ ] Tratamento de erros

**Checkpoint:** Criação de post funcionando

---

### 7.3. Tela Editor (Tipo Canva)
- 🤖 **IA desenvolve:**
  - [ ] Layout do editor
  - [ ] Visualização de imagem
  - [ ] Editor de texto/legenda
  - [ ] Botões de ação (Editar via IA, Salvar, Postar/Agendar)
  - [ ] Modal/formulário para edição via IA
  - [ ] Preview em tempo real
  - [ ] Salvamento automático

**Checkpoint:** Editor básico funcionando

---

### 7.4. Edição Manual no Editor
- 🤖 **IA desenvolve:**
  - [ ] Editor de texto inline
  - [ ] Ferramentas básicas de edição de imagem (se necessário)
  - [ ] Preview das alterações
  - [ ] Salvamento manual

**Checkpoint:** Edição manual funcionando

---

### 7.5. Edição via IA no Editor
- 🤖 **IA desenvolve:**
  - [ ] Formulário para solicitar alterações
  - [ ] Opções: alterar imagem, alterar legenda, ambos
  - [ ] Integração com API de edição via IA
  - [ ] Loading state
  - [ ] Atualização do preview após edição

**Checkpoint:** Edição via IA funcionando

---

### 7.6. Modal Postar/Agendar
- 🤖 **IA desenvolve:**
  - [ ] Modal de ação final
  - [ ] Opção: Postar imediatamente
  - [ ] Opção: Agendar (date/time picker)
  - [ ] Validação de conta conectada
  - [ ] Validação de limites de agendamento
  - [ ] Seleção de conta (plano Agência)
  - [ ] Integração com APIs

**Checkpoint:** Postar/Agendar funcionando

---

### 7.7. Tela My Posts (Histórico)
- 🤖 **IA desenvolve:**
  - [ ] Listagem de posts
  - [ ] Grid/List view
  - [ ] Filtros e busca
  - [ ] Paginação
  - [ ] Ações: Editar, Reutilizar, Deletar
  - [ ] Modal de reutilização

**Checkpoint:** Histórico funcionando

---

### 7.8. Tela Calendário
- 🤖 **IA desenvolve:**
  - [ ] Componente de calendário
  - [ ] Marcações de posts publicados
  - [ ] Marcações de posts agendados
  - [ ] Navegação por meses
  - [ ] Modal de detalhes do dia
  - [ ] Filtros por conta (plano Agência)

**Checkpoint:** Calendário funcionando

---

### 7.9. Tela Dashboard
- 🤖 **IA desenvolve:**
  - [ ] Visão geral (estatísticas básicas)
  - [ ] Cards de informações (créditos, posts, etc)
  - [ ] Gráficos básicos (se necessário)
  - [ ] Filtros por conta (plano Agência)
  - [ ] Layout responsivo

**Checkpoint:** Dashboard funcionando

---

## FASE 8: FUNCIONALIDADES ESPECÍFICAS

### 8.1. Reutilização de Posts
- 🤖 **IA desenvolve:**
  - [ ] Modal/formulário de reutilização
  - [ ] Input para novas instruções
  - [ ] Preview do post original
  - [ ] Integração com API de reutilização
  - [ ] Loading state
  - [ ] Redirecionamento para Editor com novo post

**Checkpoint:** Reutilização completa funcionando

---

### 8.2. Sistema de Créditos (UI)
- 🤖 **IA desenvolve:**
  - [ ] Exibição de créditos disponíveis
  - [ ] Indicador de consumo
  - [ ] Avisos quando créditos baixos
  - [ ] Modal de upgrade quando necessário
  - [ ] Histórico de uso (opcional)

**Checkpoint:** UI de créditos funcionando

---

### 8.3. Validações e Limites por Plano
- 🤖 **IA desenvolve:**
  - [ ] Validação de plano antes de agendar (Starter bloqueado)
  - [ ] Validação de limite de agendamentos (Pro: 10)
  - [ ] Mensagens de erro apropriadas
  - [ ] CTAs para upgrade quando necessário
  - [ ] Bloqueios visuais de funcionalidades

**Checkpoint:** Validações de plano funcionando

---

### 8.4. Múltiplas Contas (Plano Agência)
- 🤖 **IA desenvolve:**
  - [ ] Seletor de conta no Create Post
  - [ ] Seletor de conta no Editor
  - [ ] Filtros por conta no Dashboard
  - [ ] Filtros por conta no Calendário
  - [ ] Filtros por conta no My Posts
  - [ ] Gerenciamento de múltiplas contas na configuração

**Checkpoint:** Múltiplas contas funcionando

---

## FASE 9: POLIMENTO E TESTES

### 9.1. Tratamento de Erros Completo
- 🤖 **IA desenvolve:**
  - [ ] Tratamento de erros em todas as telas
  - [ ] Mensagens de erro amigáveis
  - [ ] Fallbacks apropriados
  - [ ] Retry mechanisms onde necessário

**Checkpoint:** Erros tratados adequadamente

---

### 9.2. Loading States e Feedback
- 🤖 **IA desenvolve:**
  - [ ] Loading states em todas as operações assíncronas
  - [ ] Progress indicators
  - [ ] Feedback visual de ações
  - [ ] Toasts/notifications consistentes

**Checkpoint:** Feedback visual adequado

---

### 9.3. Responsividade
- 🤖 **IA desenvolve:**
  - [ ] Testar e ajustar todas as telas para mobile
  - [ ] Ajustar layout para tablets
  - [ ] Otimizar sidebar para mobile
  - [ ] Testar em diferentes tamanhos de tela

**Checkpoint:** Aplicativo responsivo

---

### 9.4. Validações Finais
- 👤 **Você faz:**
  - [ ] Testar fluxo completo de criação de post
  - [ ] Testar todos os planos e limites
  - [ ] Testar OAuth e múltiplas contas
  - [ ] Testar agendamento e publicação
  - [ ] Testar reutilização
  - [ ] Validar UX/UI

**Checkpoint:** Validações completas

---

## FASE 10: DEPLOY E PRODUÇÃO

### 10.1. Preparação para Deploy
- 👤 **Você faz:**
  - [ ] Configurar ambiente de produção (Hostinger)
  - [ ] Configurar domínio
  - [ ] Configurar SSL/HTTPS

- 🤖 **IA desenvolve:**
  - [ ] Configuração de build para produção
  - [ ] Variáveis de ambiente de produção
  - [ ] Otimizações de build
  - [ ] Scripts de deploy

**Checkpoint:** Ambiente de produção configurado

---

### 10.2. Deploy Backend
- 👤 **Você faz:**
  - [ ] Deploy do backend na Hostinger
  - [ ] Configurar processo/PM2
  - [ ] Testar endpoints em produção

**Checkpoint:** Backend em produção

---

### 10.3. Deploy Frontend
- 👤 **Você faz:**
  - [ ] Deploy do frontend na Hostinger
  - [ ] Configurar servidor web (Nginx/Apache)
  - [ ] Testar aplicação completa

**Checkpoint:** Frontend em produção

---

### 10.4. Configurações Finais
- 👤 **Você faz:**
  - [ ] Configurar Stripe em modo produção
  - [ ] Configurar webhooks em produção
  - [ ] Configurar Trigger.dev em produção
  - [ ] Testar fluxo completo em produção
  - [ ] Configurar monitoramento básico

**Checkpoint:** Aplicação em produção funcionando

---

## 📝 NOTAS IMPORTANTES

1. **Ordem de Execução:** Siga a ordem das fases, mas algumas tarefas podem ser feitas em paralelo quando não há dependências.

2. **Checkpoints:** Valide cada checkpoint antes de prosseguir. Isso evita problemas cascata.

3. **Testes:** Teste cada funcionalidade após implementação. Não acumule testes para o final.

4. **Commits:** Faça commits frequentes e descritivos. Isso facilita rollback se necessário.

5. **Documentação:** Documente decisões importantes e configurações complexas.

6. **Segurança:** Sempre valide inputs, use variáveis de ambiente, não commite credenciais.

7. **Performance:** Considere performance desde o início (índices no banco, cache, etc).

---

## 🎯 PRIORIDADES PARA MVP

**Must Have (MVP completo):**
- Fases 1 a 7 (tudo básico funcionando)
- Fase 8.1 e 8.2 (Reutilização e Créditos)
- Fase 9.1 e 9.2 (Tratamento de erros e feedback)

**Nice to Have (se sobrar tempo):**
- Fase 8.3 e 8.4 (Validações completas e múltiplas contas - pode simplificar)
- Fase 9.3 (Responsividade completa - pode focar desktop primeiro)

**Pode Deixar para Depois:**
- Fase 10 (Deploy pode ser feito depois de testar localmente)

---

**Última atualização:** Criado com base na documentação atual do projeto
