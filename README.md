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
- Possui temas claro e escuro
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

- Light e Dark mode
- Cor principal: **Azul (#2563EB)**
- Azul usado SOMENTE para:
  - Botão principal
  - Item ativo da sidebar

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

- **OpenRouter** (texto)
  - Permite trocar modelos (GPT, Gemini, etc.)
  - Reduz lock-in
- **Fal.ai** (imagem)
  - Geração de imagem
  - Edição de imagem (modelo próprio)
  - Rápido
  - Bom custo para MVP

### Armazenamento

- **Cloudflare R2**
  - Imagens geradas por IA
  - Zero custo de egress

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
[OpenRouter / Fal.ai]
        ↓
[Cloudflare R2 – Imagens]
```

## 🚀 Como Começar

### Pré-requisitos

- Node.js 18+
- PostgreSQL (via Supabase auto-hospedado)
- Contas/configurações:
  - Supabase (auto-hospedado)
  - Trigger.dev
  - OpenRouter
  - Fal.ai
  - Cloudflare R2
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

## 🚀 Funcionalidades Futuras (V2)

Planejamento de funcionalidades para versões futuras que agregarão valor e diferenciais competitivos:

- **Analytics e Performance:** Métricas de engajamento, sugestões de melhor horário, biblioteca de hashtags inteligente
- **Templates e Recursos:** Biblioteca de templates, Brand Kit, biblioteca de assets
- **Agendamento Avançado:** Agendamento recorrente, agendamento em massa, calendário editorial
- **Multi-plataforma:** Integração com TikTok, LinkedIn, Facebook, Twitter/X
- **Colaboração:** Gerenciamento de equipes, workflow de aprovação
- **Inteligência Avançada:** A/B testing, sugestões baseadas em sucesso, geração em lote
- **Editor Avançado:** Ferramentas de design mais completas, editor de vídeo básico

Para mais detalhes, consulte [`Especificacoes-Funcionais.md`](./Especificacoes-Funcionais.md) - Seção 9.

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

- **[Sistema.md](../Sistema.md)** - Fonte única de verdade para decisões técnicas
- **[Especificacoes-Funcionais.md](./Especificacoes-Funcionais.md)** - Detalhes funcionais e fluxos
- **[TODO-DESENVOLVIMENTO.md](./TODO-DESENVOLVIMENTO.md)** - Lista de tarefas para desenvolvimento
- **[INSTRUCOES-DESENVOLVIMENTO.md](./INSTRUCOES-DESENVOLVIMENTO.md)** - Princípios e padrões de código (Clean Code, Martin Fowler)

## 📄 Licença

[Adicionar licença conforme necessário]
