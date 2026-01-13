# Status da Integração Stripe

## ✅ O que já está implementado (Código)

### Fase 3.3 - Integração com Stripe (Backend)
- ✅ **SDK do Stripe instalado e configurado** (`src/api/lib/stripe.ts`)
- ✅ **Webhook handler implementado** (`src/api/routes/webhooks/stripe.ts`)
  - Processa eventos: `checkout.session.completed`, `customer.subscription.*`, `invoice.payment_*`
  - Sincroniza assinaturas com banco de dados
- ✅ **Endpoints de checkout** (`src/api/routes/subscriptions.ts`)
  - `GET /api/subscriptions/plans` - Lista planos
  - `POST /api/subscriptions/checkout` - Cria sessão de checkout
  - `GET /api/subscriptions/me` - Assinatura atual do usuário
  - `POST /api/subscriptions/cancel` - Cancela assinatura
- ✅ **Sincronização de assinaturas** (função `syncSubscription`)
- ✅ **Middleware de verificação de plano** (`src/api/middleware/plan-check.ts`)

### Fase 3.4 - Sistema de Créditos
- ✅ **Lógica de gerenciamento de créditos** (`src/api/lib/services/credit-service.ts`)
- ✅ **Endpoints de créditos** (`src/api/routes/credits.ts`)
  - `GET /api/credits/balance` - Saldo disponível
  - `GET /api/credits/history` - Histórico de transações

### Frontend
- ✅ **Componente de planos/assinatura** (`components/settings/SubscriptionSection.tsx`)
- ✅ **Integração com API de subscriptions**
- ✅ **UI para checkout e cancelamento**

---

## ❌ O que falta fazer (Manual - Você precisa fazer)

### Fase 1.2 - Configuração de Contas e Serviços
- [ ] **Criar conta Stripe** (se ainda não tiver)
- [ ] **Obter chaves da API** (teste e produção)
  - `STRIPE_SECRET_KEY` (chave secreta)
  - `STRIPE_WEBHOOK_SECRET` (secret do webhook)

### Fase 3.3 - Criar Produtos e Preços no Stripe
- [ ] **Criar 4 produtos no Stripe Dashboard:**
  1. **Starter** - R$ 29,90/mês (20 créditos)
  2. **Pro** - R$ 79,90/mês (50 créditos)
  3. **Premium** - R$ 149,90/mês (120 créditos)
  4. **Agência** - R$ 299,90/mês (300 créditos)

- [ ] **Criar preços (prices) para cada produto**
  - Tipo: **Recurring (Recorrente)**
  - Interval: **Monthly (Mensal)**
  - Obter o **Price ID** de cada preço

- [ ] **Atualizar `prisma/seed.ts`** com os Price IDs reais:
  ```typescript
  stripePriceId: 'price_xxxxx', // Substituir pelos IDs reais
  ```

- [ ] **Executar o seed:**
  ```bash
  npx tsx prisma/seed.ts
  ```

- [ ] **Configurar Webhook no Stripe Dashboard:**
  - URL: `https://seu-dominio.com/api/webhooks/stripe` (produção)
  - Para desenvolvimento local: usar Stripe CLI (`stripe listen --forward-to localhost:3001/api/webhooks/stripe`)
  - Eventos a escutar:
    - `checkout.session.completed`
    - `customer.subscription.created`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`
    - `invoice.payment_succeeded`
    - `invoice.payment_failed`
  - Obter o **Webhook Secret** e adicionar ao `.env.local`:
    ```
    STRIPE_WEBHOOK_SECRET=whsec_xxxxx
    ```

---

## 📋 Checklist de Configuração

### 1. Criar Produtos no Stripe
- [ ] Acessar Stripe Dashboard (modo de teste)
- [ ] Ir em **Products** → **Add product**
- [ ] Criar produto "Starter" (R$ 29,90/mês, recorrente mensal)
- [ ] Criar produto "Pro" (R$ 79,90/mês, recorrente mensal)
- [ ] Criar produto "Premium" (R$ 149,90/mês, recorrente mensal)
- [ ] Criar produto "Agência" (R$ 299,90/mês, recorrente mensal)
- [ ] Copiar os **Price IDs** (começam com `price_`)

### 2. Atualizar Seed
- [ ] Abrir `prisma/seed.ts`
- [ ] Substituir `stripePriceId: null` pelos Price IDs reais
- [ ] Executar `npx tsx prisma/seed.ts`

### 3. Configurar Webhook
- [ ] No Stripe Dashboard, ir em **Developers** → **Webhooks**
- [ ] Criar novo webhook endpoint
- [ ] Configurar eventos
- [ ] Copiar o **Signing Secret** (começa com `whsec_`)
- [ ] Adicionar ao `.env.local` como `STRIPE_WEBHOOK_SECRET`

### 4. Variáveis de Ambiente Necessárias
```env
# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxx  # Chave secreta (modo teste)
STRIPE_WEBHOOK_SECRET=whsec_xxxxx  # Secret do webhook
```

---

## 🎯 Próximos Passos Após Configuração

1. **Testar Checkout:**
   - Acessar `/settings` (seção de assinatura)
   - Clicar em "Assinar" em um plano
   - Completar o checkout no Stripe
   - Verificar se a assinatura foi criada no banco

2. **Testar Webhook:**
   - Usar Stripe CLI para desenvolvimento local
   - Ou configurar webhook em produção
   - Verificar sincronização de eventos

3. **Testar Cancelamento:**
   - Cancelar assinatura via UI
   - Verificar atualização no Stripe e banco

---

## 📝 Notas Importantes

- **Modo de Teste vs Produção:**
  - Use chaves de **teste** durante desenvolvimento
  - Use cartões de teste do Stripe: `4242 4242 4242 4242`
  - Para produção, use chaves de **live** e configure webhook em produção

- **Price IDs:**
  - IDs de teste começam com `price_`
  - IDs de produção também começam com `price_`
  - Cada ambiente (teste/produção) tem IDs diferentes

- **Webhook Secret:**
  - Secret de teste começa com `whsec_`
  - Secret de produção também começa com `whsec_`
  - Cada webhook endpoint tem seu próprio secret

---

**Status Atual:** Código implementado ✅ | Configuração manual pendente ❌
