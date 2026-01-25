# Configuração Opção B – Stripe e Instagram

Checklist para configurar **Stripe** (checkout, assinaturas) e **Instagram** (OAuth, publicação) e testar fluxos reais. O código já está implementado; falta apenas configurar contas, variáveis de ambiente e ajustes em cada produto.

---

## Visão geral

| O que | Onde | Referência |
|-------|------|------------|
| Stripe (produtos, webhook, env) | Dashboard + `.env` | [STATUS-STRIPE.md](./STATUS-STRIPE.md) |
| Instagram (app Facebook, OAuth, env) | Facebook Developer + `.env` | [INTEGRACAO-INSTAGRAM-STATUS.md](./INTEGRACAO-INSTAGRAM-STATUS.md) |

---

## 1. Variáveis de ambiente

### 1.1. Criar `.env` a partir do exemplo

```bash
cp .env.example .env
```

Edite `.env` e preencha todos os valores. **Nunca commite o `.env`.**

### 1.2. Variáveis obrigatórias para Opção B

- **Base:** `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`
- **Stripe:** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_*` (ver seção 2)
- **Instagram:** `INSTAGRAM_CLIENT_ID`, `INSTAGRAM_CLIENT_SECRET`, `INSTAGRAM_REDIRECT_URI`
- **App:** `NEXT_PUBLIC_APP_URL` (opcional; default `http://localhost:3000`)

### 1.3. Verificar configuração

```bash
pnpm run config:check
```

O script confere se todas as variáveis necessárias estão definidas (não exibe valores).

---

## 2. Stripe

### 2.1. Conta e chaves

1. Crie uma conta em [Stripe](https://dashboard.stripe.com) (se ainda não tiver).
2. Use **modo de teste** durante o desenvolvimento.
3. Em **Developers → API keys**:
   - Copie **Secret key** (`sk_test_...`) → `STRIPE_SECRET_KEY` no `.env`.

### 2.2. Produtos e preços

1. Acesse **Products** → **Add product**.
2. Crie os 4 planos:

   | Produto | Preço mensal | Recorrente |
   |--------|---------------|-----------|
   | Starter | R$ 29,90 | Sim, mensal |
   | Pro | R$ 79,90 | Sim, mensal |
   | Premium | R$ 149,90 | Sim, mensal |
   | Agência | R$ 299,90 | Sim, mensal |

3. Para cada produto, crie um **Price** (recurring, monthly) e copie o **Price ID** (`price_...`).
4. No `.env`, defina:

   ```
   STRIPE_PRICE_STARTER=price_...
   STRIPE_PRICE_PRO=price_...
   STRIPE_PRICE_PREMIUM=price_...
   STRIPE_PRICE_AGENCY=price_...
   ```

### 2.3. Seed dos planos

```bash
pnpm run db:seed
```

Os planos no banco passam a usar os Price IDs do `.env`. Se algum `STRIPE_PRICE_*` estiver vazio, o plano é criado com `stripePriceId` null e o checkout desse plano não funcionará.

### 2.4. Webhook

- **Produção:** em **Developers → Webhooks**, crie um endpoint:
  - URL: `https://seu-dominio.com/api/webhooks/stripe`
  - Eventos: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
  - Copie o **Signing secret** (`whsec_...`) → `STRIPE_WEBHOOK_SECRET` no `.env`.

- **Desenvolvimento local:** use a [Stripe CLI](https://stripe.com/docs/stripe-cli):

  ```bash
  stripe listen --forward-to localhost:3000/api/webhooks/stripe
  ```

  O CLI exibe um `whsec_...` temporário; use-o em `STRIPE_WEBHOOK_SECRET` enquanto testar localmente.

### 2.5. Testar checkout

1. Subir o app (`pnpm dev`).
2. Acessar **Configurações** → seção de assinatura.
3. Clicar em **Assinar** em um plano e concluir o checkout (cartão de teste: `4242 4242 4242 4242`).
4. Verificar no Stripe Dashboard e no banco se a assinatura foi criada/atualizada.

---

## 3. Instagram (Facebook Developer)

### 3.1. App no Facebook

1. Acesse [Facebook Developers](https://developers.facebook.com) e crie um app (ou use um existente).
2. Adicione o produto **Instagram Graph API** (e **Facebook Login** para OAuth).

### 3.2. App Domains e Redirect URIs

1. **Settings → Basic → App Domains:**
   - Desenvolvimento: `localhost`
   - Produção: seu domínio (ex.: `seudominio.com`), **sem** `http://`, porta ou caminho.

2. **Products → Facebook Login → Settings → Valid OAuth Redirect URIs:**
   - Desenvolvimento: `http://localhost:3000/auth/callback/instagram`
   - Produção: `https://seudominio.com/auth/callback/instagram`  
   A URL deve ser **exatamente** igual a `INSTAGRAM_REDIRECT_URI` no `.env`.

### 3.3. Permissões

Em **Instagram Graph API** (e Facebook Login, se aplicável), solicite:

- `instagram_basic`
- `pages_show_list`
- `instagram_content_publish`
- `pages_read_engagement`

Em modo de desenvolvimento, o app só funciona com contas de **teste** do app.

### 3.4. Variáveis no `.env`

```
INSTAGRAM_CLIENT_ID=seu_app_id
INSTAGRAM_CLIENT_SECRET=seu_app_secret
INSTAGRAM_REDIRECT_URI=http://localhost:3000/auth/callback/instagram
```

Em produção, use a URL final do seu domínio.

### 3.5. Conta Instagram

- A conta deve ser **Business** ou **Creator**.
- Deve estar vinculada a uma **Página do Facebook**.

### 3.6. Testar conexão e publicação

1. Em **Configurações** → contas conectadas, clicar em **Conectar Instagram**.
2. Autorizar no Facebook/Instagram e concluir o redirect.
3. Criar um post no editor e publicar no Instagram (ou agendar, se disponível).

Detalhes e troubleshooting: [INTEGRACAO-INSTAGRAM-STATUS.md](./INTEGRACAO-INSTAGRAM-STATUS.md).

---

## 4. Checklist rápido

- [ ] `.env` criado a partir de `.env.example` e preenchido
- [ ] `pnpm run config:check` passa sem erros
- [ ] **Stripe:** conta, chaves, 4 produtos/preços, Price IDs no `.env`, seed executado, webhook configurado
- [ ] **Instagram:** app no Facebook, App Domains, Redirect URIs, permissões, variáveis no `.env`
- [ ] Checkout Stripe testado (Settings → assinatura)
- [ ] Conexão Instagram e publicação testadas (Settings → conectar → criar post → publicar)

---

## 5. Referências

- [STATUS-STRIPE.md](./STATUS-STRIPE.md) – status da integração Stripe
- [INTEGRACAO-INSTAGRAM-STATUS.md](./INTEGRACAO-INSTAGRAM-STATUS.md) – status e detalhes da integração Instagram
- [.env.example](../.env.example) – modelo de variáveis de ambiente
