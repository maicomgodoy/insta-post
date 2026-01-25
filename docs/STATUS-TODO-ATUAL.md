# Status do TODO – Insta Post (Atualizado)

Documento de acompanhamento do desenvolvimento. Compara o **TODO-DESENVOLVIMENTO.md** com o **estado real** do código e indica próximos passos.

**Data:** Janeiro 2025

---

## Resumo executivo

| Área | Status | Observação |
|------|--------|------------|
| **Backend – Base & Auth** | ✅ Pronto | API Routes, Supabase Auth, créditos |
| **Backend – Stripe** | ⚠️ Código pronto | Falta config manual (produtos, webhook, env) |
| **Backend – Instagram** | ⚠️ Código pronto | Falta app Facebook + env |
| **Backend – Posts** | ✅ CRUD + generate mock | Edição/regeneração ainda mock |
| **IA (Trigger.dev, Fal, OpenRouter, R2)** | ❌ Não integrado | Generate/edit usam mock |
| **Frontend – Telas** | ⚠️ Parcial | Várias telas com dados **mock** |
| **Dashboard / My Posts / Credits** | ✅ Integrado | Opção A concluída – consomem APIs reais |

---

## O que já está implementado (além do TODO)

### Backend – Já feito

- **Posts:** `GET/POST /api/posts`, `GET/PUT/DELETE /api/posts/:id`, `POST /api/posts/generate` (mock), `edit`, `regenerate`, `publish`, `schedule`, `unschedule`
- **Créditos:** `GET /api/credits/balance`, `GET /api/credits/history`
- **Stripe:** checkout, webhooks, planos, assinatura, cancelamento (ver **STATUS-STRIPE.md**)
- **Instagram:** OAuth, publicação, contas conectadas (ver **INTEGRACAO-INSTAGRAM-STATUS.md**)
- **Social accounts:** listagem, connect, disconnect, refresh, validate, callback
- **Rejected images:** listagem, reuse (Gallery)

### Frontend – Já feito

- **Create Post:** formulário (nicho, tipo, tom, ideia) → `POST /api/posts/generate` → redirect para editor
- **Editor:** carrega post, salva, editar via IA (modal), publicar, agendar (PublishModal com contas)
- **Settings:** tema, idioma, assinatura (Stripe), contas conectadas (Instagram), logout
- **Gallery:** imagens rejeitadas + reuse, integrada com API

### Frontend – Antes com mock, **agora integrado (Opção A)**

- **Dashboard:** busca créditos (`/api/credits/balance`), posts (`/api/posts`), contas (`/api/social-accounts`); exibe stats e posts recentes com links para o editor
- **My Posts:** lista `GET /api/posts` com paginação; grid com ações Editar, Reutilizar, Excluir
- **Credits:** usa `GET /api/credits/balance` e `GET /api/credits/history`; tabela de histórico e “Comprar” linkando para Settings

---

## O que ainda falta (priorizado)

### 1. Quick wins – Conectar frontend às APIs existentes ✅ **FEITO (Opção A)**

| Tarefa | Onde | Esforço |
|--------|------|---------|
| ~~Dashboard consumir dados reais~~ | `dashboard/page.tsx` | ✅ |
| ~~Buscar créditos, posts, contas~~ | Dashboard | ✅ |
| ~~My Posts: `GET /api/posts` + grid + ações~~ | `my-posts/page.tsx` | ✅ |
| ~~Credits: `balance` + `history`~~ | `credits/page.tsx` | ✅ |

### 2. Configurações manuais (você faz) – **Guia: [CONFIG-OPCAO-B.md](./CONFIG-OPCAO-B.md)**

- Stripe: criar produtos/preços, webhook, `STRIPE_*` e `STRIPE_PRICE_*` no `.env` (ver **STATUS-STRIPE.md**)
- Instagram: app Facebook, OAuth redirect, `INSTAGRAM_*` no `.env` (ver **INTEGRACAO-INSTAGRAM-STATUS.md**)
- Contas: Trigger.dev, Fal.ai, OpenRouter, Cloudflare R2 (Fase 1.2 do TODO)

### 3. Integrações de IA (Fase 4 do TODO)

- Trigger.dev: config + jobs
- OpenRouter: geração de legenda
- Fal.ai: geração e edição de imagem
- Cloudflare R2: upload de imagens
- Trocar mock em `generate` / `edit` / `regenerate` por essas integrações

### 4. Outros

- **Calendário:** tela + API (Fase 5.7 / 7.8) – ainda não existe
- **Job agendados:** Trigger.dev para publicar posts agendados (citado em **INTEGRACAO-INSTAGRAM-STATUS.md**)
- **Reutilização de post:** API `reuse` existe em `rejected-images`; fluxo “reutilizar post” na UI pode precisar de ajustes
- **Validações por plano:** limites de agendamento, Starter bloqueado etc. (Fase 8.3)
- **Múltiplas contas (Agência):** backend suporta; UI (seleção de conta) já em parte no PublishModal

---

## Recomendação para “andamento”

**Opção A – Fechar lacunas de UX** ✅ **CONCLUÍDA**  
1. Dashboard: busca créditos, posts recentes e contas conectadas das APIs.  
2. My Posts: lista `GET /api/posts`, grid, ações Editar / Reutilizar / Excluir, paginação “Carregar mais”.  
3. Credits: usa `GET /api/credits/balance` e `GET /api/credits/history`; tabela de histórico e link “Comprar” para Settings.

**Opção B – Configurações** ✅ **Preparado**  
- `.env.example` criado; `prisma/seed` usa `STRIPE_PRICE_*` via env.  
- `pnpm run config:check` valida variáveis; [CONFIG-OPCAO-B.md](./CONFIG-OPCAO-B.md) descreve o passo a passo para Stripe + Instagram.  
- Falta **você**: criar produtos no Stripe, configurar webhook, criar app no Facebook, preencher `.env` e rodar `db:seed`.

**Trigger.dev** ✅ **Conexão preparada**  
- SDK + build instalados; `trigger.config.ts` e `trigger/` com task de exemplo; `GET /api/trigger-test`; scripts `trigger:dev` e `trigger:deploy`. Ver [CONFIG-TRIGGER-DEV.md](./CONFIG-TRIGGER-DEV.md). Falta: criar projeto no dashboard, `TRIGGER_*` no `.env`, rodar `trigger:dev`. Depois, criar as tasks (geração, edição, agendados).

**Opção C – IA**  
- Fal.ai, OpenRouter, R2 e substituir mocks de geração/edição (as tasks usarão Trigger.dev).

---

## Referências

- **TODO completo:** `docs/TODO-DESENVOLVIMENTO.md`
- **Opção B (Stripe + Instagram):** `docs/CONFIG-OPCAO-B.md`
- **Trigger.dev:** `docs/CONFIG-TRIGGER-DEV.md`
- **Stripe:** `docs/STATUS-STRIPE.md`
- **Instagram:** `docs/INTEGRACAO-INSTAGRAM-STATUS.md`

---

**Última atualização:** Janeiro 2025
