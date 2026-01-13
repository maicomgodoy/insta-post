# Insta Post - Gerador de Posts para Redes Sociais com IA

Aplicação SaaS que facilita ao máximo a criação de posts para redes sociais através de IA, permitindo gerar **imagem + legenda** em segundos com uma ideia simples.

## 🎯 Objetivo

Facilitar ao máximo a vida do assinante na criação de posts para redes sociais. O usuário deve conseguir:

- Entrar no app
- Informar uma ideia simples
- Gerar **imagem + legenda** com IA
- Copiar ou baixar

Tudo isso **em segundos**, sem curva de aprendizado.

> **Princípio central:** Se o usuário precisar pensar demais, o produto falhou.

## 🔄 Fluxo do Usuário

Após o usuário fazer login e ter plano ativo ou estar no período de teste grátis:

1. **Criar Post**
   - Usuário informa uma ideia simples
   - Sistema gera imagem + legenda com IA (processamento assíncrono)
   - Post inicial é criado

2. **Tela de Editor (Tipo Canva)**
   - Abre automaticamente após a geração ou pode ser acessada pelo histórico
   - Usuário pode:
     - **Editar manualmente**: Ajustar imagem e/ou legenda diretamente na interface
     - **Solicitar alterações via IA**: Pedir para a IA alterar a imagem e/ou a legenda
   - Interface focada e limpa, similar ao Canva

3. **Ação Final**
   - Botão **Postar/Agendar Post**
   - Usuário escolhe:
     - Publicar imediatamente (se conta conectada)
     - Agendar para data/hora específica
   - Posts são vinculados à conta social configurada

4. **Configurações**
   - Tela dedicada para conectar conta social (Instagram)
   - Login OAuth com a plataforma
   - Posts gerados são vinculados à conta conectada

## ✨ Funcionalidades do MVP

### ✅ O que o MVP faz

- **Internacionalização (i18n)**
  - Interface disponível em Português, Espanhol e Inglês
  - Detecção automática do idioma do navegador
  - Seleção manual de idioma preferido nas Configurações
  - Preferência de idioma salva no perfil do usuário
- Gera texto (legenda) usando LLM
- Gera imagem usando IA
- Edita imagem criada utilizando IA (modelo próprio via Fal.ai)
- Editor tipo Canva para edição manual de imagem e legenda
- Reutiliza posts existentes (usar como base/template ou dar continuidade)
- Executa geração de forma assíncrona (não bloqueia UI)
- Salva posts gerados
- Exibe histórico de posts
- Agenda posts para publicação
- Conexão de conta social (Instagram) nas configurações
- **Temas Light e Dark mode** (alternância fácil via botão no Header)
- Sistema de assinatura mensal com créditos
  - 4 planos: Starter, Pro, Premium, Agência
  - Cada interação com IA consome créditos (custo específico por modelo)
  - Agendamento: Pro (10 posts), Premium/Agência (ilimitado), Starter (não permite)
  - Plano Agência: múltiplas contas, dashboard unificado, filtros por conta
  - 14 dias grátis com todas as funcionalidades

### ❌ O que o MVP não faz

- Não edita texto avançadamente
- Não publica automaticamente (apenas agenda)
- Não tem carrossel
- Não tem vídeo

## 🎨 Design e UX

### Princípios

- Uma ação principal por tela
- Zero ruído visual
- Poucas opções
- Interface silenciosa
- Design funcional > bonito

### Layout

- App desktop-first
- Sidebar fixa e mínima
- Área principal focada em uma tarefa

### Telas

1. **Create Post** (tela principal - geração inicial)
2. **Editor** (tela de edição tipo Canva - edição manual ou IA)
3. **My Posts** (histórico)
4. **Calendário** (visualização de posts publicados e agendados)
5. **Dashboard simples** (visão geral)
6. **Configurações** (conexão de conta social)

### Tema

- **Light e Dark mode**
  - Alternância fácil através de botão no Header/Navbar
  - Botão visível e acessível em todas as telas
  - Alternância instantânea com um único clique
  - Transição suave entre os modos
  - Preferência salva no perfil do usuário
  - Preferência mantida entre sessões
- Cor principal: **Azul (#2563EB)**
- Azul usado SOMENTE para:
  - Botão principal
  - Item ativo da sidebar

### Internacionalização

- **Idiomas Suportados:** Português, Espanhol, Inglês
- **Detecção Automática:** Baseada no idioma do navegador
- **Seleção Manual:** Disponível nas Configurações
- **Persistência:** Preferência salva no perfil do usuário

## 🛠 Stack Técnica

### Frontend

- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**

### Backend

- **Node.js**
- **TypeScript**
- **Express.js** (framework web)
- **Prisma** (ORM, apenas no backend)
- **Zod** (validação de schemas)

### Banco de Dados e Auth

- **Supabase** (auto-hospedado)
- **PostgreSQL**
- **Auth do Supabase**
- **Row Level Security (RLS)**

### Jobs Assíncronos

- **Trigger.dev**
  - Geração de texto (LLM)
  - Geração de imagem
  - Edição de imagem
  - Processos longos

### Serviços de IA

- **Modelo LLM** (texto)
  - Inicialmente configurado com OpenAI
  - No futuro: retry automático com outros modelos (GPT, Gemini, etc.) em caso de falha
  - Reduz lock-in e aumenta confiabilidade
- **Fal.ai** (imagem)
  - Geração de imagem
  - Edição de imagem (modelo próprio)
  - Rápido
  - Bom custo para MVP

### Armazenamento

- **Cloudflare R2**
  - Imagens geradas por IA
  - Zero custo de egress

### Email Transacional e Marketing

- **SendPulse** (recomendado)
  - 12.000 emails/mês (plano gratuito)
  - Emails transacionais (welcome, recuperação de senha, notificações)
  - Emails de marketing/conquista (lead nurturing, conversão)
  - Automação e sequências de emails
  - API robusta para integração
  - Suporte disponível
  - Para análise detalhada, consulte [`ANALISE-EMAIL-TRANSACIONAL.md`](./docs/ANALISE-EMAIL-TRANSACIONAL.md)

### Pagamentos e Assinaturas

- **Stripe**
  - Gerenciamento de assinaturas mensais
  - Processamento de pagamentos
  - Gestão de planos (Starter, Pro, Premium)
  - Webhooks para eventos de assinatura

### Infraestrutura

- **Hostinger** (VPS / Cloud Hosting)
- Frontend e Backend rodam na mesma infraestrutura
- Build standalone do Next.js

## 📐 Arquitetura

```
[Frontend – Next.js]
        ↓
[Backend – Node.js API]
        ↓
[Supabase – Postgres + Auth]
        ↓
[Trigger.dev – Jobs]
        ↓
[Modelo LLM / Fal.ai]
        ↓
[Cloudflare R2 – Imagens]
        ↓
[SendPulse – Emails Transacionais]
```

## 🚀 Como Começar

### Pré-requisitos

- Node.js 18+
- PostgreSQL (via Supabase auto-hospedado)
- Contas/configurações:
  - Supabase (auto-hospedado)
  - Trigger.dev
  - OpenAI (modelo LLM)
  - Fal.ai
  - Cloudflare R2
  - SendPulse (email transacional)
  - Stripe (assinaturas e pagamentos)

### Instalação

```bash
# Clone o repositório
git clone <repository-url>

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# Execute as migrações do Prisma
npx prisma migrate dev

# Inicie o servidor de desenvolvimento
npm run dev
```

### Variáveis de Ambiente

Veja `.env.example` para as variáveis necessárias (configuração completa será adicionada conforme desenvolvimento).

## 📁 Estrutura do Projeto

```
insta-post/
├── app/                 # Next.js App Router
├── src/
│   ├── api/            # Backend API
│   ├── components/     # Componentes React
│   ├── lib/            # Utilitários
│   └── types/          # TypeScript types
├── prisma/             # Schema e migrações
└── public/             # Arquivos estáticos
```

## 🎯 Status do Projeto

- ✅ Produto: definido
- ✅ UX: validado
- ✅ Stack: fechada
- 🚧 **Próximo passo: implementação real**

## 🚀 Funcionalidades Futuras

### V1 (Pós-MVP)

Planejamento de funcionalidades para a versão 1.0 (pós-MVP):

- **Biblioteca de Personagens:** Salvar e reutilizar personagens principais (imagem do usuário, personagens criados, elementos visuais)
- **Perfis de Estilo Visual:** Criar e aplicar instruções temáticas consistentes (ex: "Desenho", "Estilo Filme", "Quente", "Sobrio")
- **Agente/Assistente de Dicas:** Chat integrado que fornece dicas personalizadas sobre como e quando postar, baseado no nicho e objetivos do usuário, com opção de salvar instruções para tornar os posts mais acertivos
- **Integração Completa:** Combinar personagens salvos + perfis de estilo + instruções do agente para criar posts altamente personalizados e estratégicos

Para mais detalhes, consulte [`Especificacoes-Funcionais.md`](./docs/Especificacoes-Funcionais.md) - Seção 8.

### V2 (Futuro)

Planejamento de funcionalidades para versões futuras que agregarão valor e diferenciais competitivos:

- **Analytics e Performance:** Métricas de engajamento, sugestões de melhor horário, biblioteca de hashtags inteligente
- **Templates e Recursos:** Biblioteca de templates, Brand Kit, biblioteca de assets
- **Agendamento Avançado:** Agendamento recorrente, agendamento em massa, calendário editorial
- **Multi-plataforma:** Integração com TikTok, LinkedIn, Facebook, Twitter/X
- **Colaboração:** Gerenciamento de equipes, workflow de aprovação
- **Inteligência Avançada:** A/B testing, sugestões baseadas em sucesso, geração em lote
- **Editor Avançado:** Ferramentas de design mais completas, editor de vídeo básico

Para mais detalhes, consulte [`Especificacoes-Funcionais.md`](./docs/Especificacoes-Funcionais.md) - Seção 9.

## 📝 Decisões Importantes

- Supabase NÃO roda em Vercel
- Serverless NÃO é usado para workloads stateful
- Tudo centralizado na Hostinger por custo e controle
- Simplicidade tem prioridade sobre flexibilidade
- MVP primeiro, escala depois

## 👨‍💻 Desenvolvimento

Este projeto segue os princípios:

- **Planning** - Defina componentes, fluxos e estrutura antes de iniciar
- **D.R.Y.** - Don't Repeat Yourself
- **K.I.S.S.** - Keep It Simple Stupid
- **Y.A.G.N.I** - You Aren't Gonna Need It
- **Feature-Based Folders** - Organize por funcionalidade
- **Separation of Concerns** - Separe responsabilidades

## 📄 Documentação Adicional

- **[Especificacoes-Funcionais.md](./docs/Especificacoes-Funcionais.md)** - Detalhes funcionais e fluxos
- **[TODO-DESENVOLVIMENTO.md](./docs/TODO-DESENVOLVIMENTO.md)** - Lista de tarefas para desenvolvimento
- **[INSTRUCOES-DESENVOLVIMENTO.md](./docs/INSTRUCOES-DESENVOLVIMENTO.md)** - Princípios e padrões de código (Clean Code, Martin Fowler)
- **[ANALISE-EMAIL-TRANSACIONAL.md](./docs/ANALISE-EMAIL-TRANSACIONAL.md)** - Análise comparativa de fornecedores de email transacional

## 📄 Licença

[Adicionar licença conforme necessário]
