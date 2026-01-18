# 🎨 Design System - Planejamento Completo

## 📋 Visão Geral

Repensar todo o design do Insta Post seguindo princípios de SaaS B2B modernos (Notion, Linear, Vercel, Stripe, Framer), com foco em:
- **Clareza e confiança** sobre estética chamativa
- **Hierarquia visual forte** com pouco ruído
- **Componentes reutilizáveis** e escaláveis
- **Estados claros** (loading, empty, success, error)

---

## 🎨 Design System

### Paleta de Cores

#### Cores Principais
- **Primary (Accent)**: `#0066FF` (Azul vibrante, confiança e ação)
  - Primary-50: `#E6F2FF`
  - Primary-100: `#CCE5FF`
  - Primary-500: `#0066FF` (base)
  - Primary-600: `#0052CC`
  - Primary-700: `#003D99`

#### Neutros (Escala de Cinza)
- **Gray-50**: `#FAFAFA` (Backgrounds claros)
- **Gray-100**: `#F5F5F5` (Hover states claros)
- **Gray-200**: `#E5E5E5` (Bordas claras)
- **Gray-300**: `#D4D4D4`
- **Gray-400**: `#A3A3A3` (Texto secundário)
- **Gray-500**: `#737373` (Texto terciário)
- **Gray-600**: `#525252` (Texto padrão)
- **Gray-700**: `#404040` (Texto forte)
- **Gray-800**: `#262626` (Texto muito forte)
- **Gray-900**: `#171717` (Texto principal)

#### Dark Mode
- **Background**: `#0A0A0A` (Quase preto, não puro)
- **Surface**: `#141414` (Cards, modais)
- **Border**: `#262626` (Bordas sutis)
- **Text Primary**: `#FAFAFA`
- **Text Secondary**: `#A3A3A3`

#### Estados Semânticos
- **Success**: `#10B981` (Verde)
- **Warning**: `#F59E0B` (Amarelo/Laranja)
- **Error**: `#EF4444` (Vermelho)
- **Info**: `#3B82F6` (Azul info)

### Tipografia

#### Font Family
- **Primary**: `Inter` (Google Fonts) - Moderna, legível, profissional
- **Fallback**: `system-ui, -apple-system, sans-serif`

#### Escala Tipográfica
- **Display**: `48px / 56px` (Hero, títulos principais)
- **H1**: `36px / 44px` (Páginas principais)
- **H2**: `30px / 38px` (Seções)
- **H3**: `24px / 32px` (Subseções)
- **H4**: `20px / 28px` (Cards, labels)
- **Body Large**: `18px / 28px` (Texto importante)
- **Body**: `16px / 24px` (Texto padrão)
- **Body Small**: `14px / 20px` (Texto secundário)
- **Caption**: `12px / 16px` (Legendas, hints)

#### Pesos
- **Regular**: 400
- **Medium**: 500
- **Semibold**: 600
- **Bold**: 700

### Espaçamentos (Spacing Scale)

Base: 4px
- **xs**: `4px` (0.25rem)
- **sm**: `8px` (0.5rem)
- **md**: `16px` (1rem)
- **lg**: `24px` (1.5rem)
- **xl**: `32px` (2rem)
- **2xl**: `48px` (3rem)
- **3xl**: `64px` (4rem)
- **4xl**: `96px` (6rem)

### Border Radius

- **none**: `0`
- **sm**: `4px` (Inputs, badges pequenos)
- **md**: `8px` (Botões, cards padrão)
- **lg**: `12px` (Cards grandes, modais)
- **xl**: `16px` (Containers especiais)
- **full**: `9999px` (Pills, avatares)

### Shadows

- **sm**: `0 1px 2px 0 rgba(0, 0, 0, 0.05)`
- **md**: `0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`
- **lg**: `0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)`
- **xl**: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`

### Transições

- **Fast**: `150ms ease-out` (Hovers, toggles)
- **Base**: `200ms ease-out` (Padrão)
- **Slow**: `300ms ease-out` (Modais, transições complexas)

---

## 🏗️ Estrutura de Layout

### Dashboard Layout

#### Sidebar (240px width)
- **Fixo à esquerda**
- **Background**: Branco (light) / `#141414` (dark)
- **Border**: Direita com `#E5E5E5` / `#262626`
- **Logo**: Topo, padding `24px`
- **Navigation**: Espaçamento `8px` entre itens
- **Active State**: Background `#0066FF` com texto branco
- **Hover State**: Background `#F5F5F5` / `#1F1F1F`
- **Bottom Section**: User info + theme toggle, border-top

#### Header (Opcional, futuro)
- **Altura**: `64px`
- **Background**: Branco / `#141414`
- **Border**: Inferior sutil
- **Conteúdo**: Breadcrumbs, ações rápidas, notificações

#### Main Content
- **Padding**: `32px` (desktop), `16px` (mobile)
- **Max Width**: `1280px` (centrado)
- **Background**: `#FAFAFA` / `#0A0A0A`

---

## 🧩 Componentes Base

### Button

#### Variantes
1. **Primary**: Background `#0066FF`, texto branco, hover `#0052CC`
2. **Secondary**: Background `#F5F5F5`, texto `#171717`, hover `#E5E5E5`
3. **Outline**: Borda `#E5E5E5`, texto `#171717`, hover background `#FAFAFA`
4. **Ghost**: Sem background, texto `#171717`, hover `#F5F5F5`
5. **Danger**: Background `#EF4444`, texto branco

#### Tamanhos
- **sm**: `32px` altura, padding `8px 12px`, texto `14px`
- **md**: `40px` altura, padding `10px 16px`, texto `16px`
- **lg**: `48px` altura, padding `12px 24px`, texto `16px`

#### Estados
- **Default**: Normal
- **Hover**: Escurece/Clareia conforme variante
- **Active**: Pressed state
- **Disabled**: Opacity `0.5`, cursor `not-allowed`
- **Loading**: Spinner + texto desabilitado

### Card

#### Variantes
1. **Default**: Background branco, border `#E5E5E5`, shadow `sm`
2. **Elevated**: Shadow `md` (destaque)
3. **Outlined**: Apenas border, sem shadow
4. **Interactive**: Hover shadow `lg`, cursor pointer

#### Padding
- **sm**: `16px`
- **md**: `24px`
- **lg**: `32px`

### Input / FormField

#### Input
- **Altura**: `40px` (md), `48px` (lg)
- **Border**: `1px solid #E5E5E5`
- **Border Radius**: `8px`
- **Padding**: `12px 16px`
- **Focus**: Border `#0066FF`, ring `2px` com `#0066FF` opacity `0.2`
- **Error**: Border `#EF4444`
- **Disabled**: Background `#F5F5F5`, opacity `0.6`

#### Label
- **Font**: `14px`, `500`, cor `#171717`
- **Margin Bottom**: `8px`

#### Helper Text / Error
- **Font**: `12px`, cor `#737373` / `#EF4444`
- **Margin Top**: `4px`

### Select

Similar ao Input, com dropdown arrow customizado.

### Textarea

Similar ao Input, altura variável, `resize: vertical`.

---

## 📱 Páginas Principais

### 1. Dashboard

#### Estrutura
- **Header**: Título `H1`, subtítulo `Body Large`, ações (botão "Criar Post")
- **Stats Cards**: Grid 3-4 colunas, cards com números grandes
  - Posts criados
  - Posts agendados
  - Créditos restantes
  - Contas conectadas
- **Quick Actions**: Cards com ações rápidas
- **Recent Activity**: Lista de posts recentes (últimos 5-10)

#### Empty State
- Ícone grande
- Título `H3`
- Descrição `Body`
- CTA "Criar Primeiro Post"

### 2. Create Post

#### Estrutura
- **Header**: Título `H1`, subtítulo
- **Form**: Card com padding `lg`
  - Campos em sequência vertical
  - Espaçamento `24px` entre campos
  - Botão submit full-width no final
- **Preview** (futuro): Side-by-side ou toggle

#### Estados
- **Loading**: Form desabilitado, botão com spinner
- **Success**: Toast + redirect
- **Error**: Mensagem inline no campo ou toast

### 3. My Posts

#### Estrutura
- **Header**: Título `H1`, filtros (dropdown), botão "Criar Post"
- **Grid**: 3 colunas (desktop), 2 (tablet), 1 (mobile)
- **Post Card**:
  - Imagem preview (aspect-square)
  - Título/Preview da legenda (truncado)
  - Status badge (Draft, Scheduled, Published)
  - Ações (Edit, Delete, Publish)
  - Data de criação

#### Empty State
- Ícone
- Título
- Descrição
- CTA "Criar Primeiro Post"

### 4. Settings

#### Estrutura
- **Header**: Título `H1`
- **Sections**: Cards separados por categoria
  - Appearance (Theme, Language)
  - Account (Email, Password)
  - Subscription
  - Connected Accounts
- **Cada seção**: Título `H3`, campos com labels e valores

### 5. Landing Page

#### Hero Section
- **Background**: Branco / Gradiente sutil
- **Layout**: 2 colunas (texto + visual)
- **Título**: `H1` Display size, bold
- **Subtítulo**: `Body Large`, cor `#737373`
- **CTAs**: 2 botões (Primary + Outline)
- **Visual**: Ilustração ou screenshot da interface

#### Features Section
- **Título**: `H2`, centralizado
- **Grid**: 3 colunas
- **Card**: Ícone, título `H4`, descrição `Body`

#### Benefits Section
- Similar ao Features, foco em benefícios

#### How It Works
- **Layout**: Timeline horizontal ou vertical
- **Steps**: Número + título + descrição

#### Pricing Preview
- **Grid**: 4 colunas (planos)
- **Card**: Nome, descrição, features, CTA

#### CTA Section
- **Background**: `#0066FF` ou gradiente
- **Texto**: Branco
- **Título**: `H2`
- **Descrição**: `Body Large`
- **CTA**: Botão branco com texto `#0066FF`

#### Footer
- **Background**: `#171717`
- **Texto**: `#A3A3A3`
- **Links**: Hover `#FAFAFA`
- **Layout**: Grid com colunas (Links, Legal, Social)

---

## 🎯 Estados e Feedback

### Loading States
- **Spinner**: Circular, cor `#0066FF`
- **Skeleton**: Placeholder com shimmer effect
- **Button Loading**: Spinner + texto desabilitado

### Empty States
- **Ícone**: Grande, cor `#A3A3A3`
- **Título**: `H3`, cor `#171717`
- **Descrição**: `Body`, cor `#737373`
- **CTA**: Botão Primary

### Error States
- **Toast**: Top-right, background `#EF4444`, texto branco
- **Inline Error**: Texto `#EF4444` abaixo do campo
- **Error Page**: 404, 500, etc.

### Success States
- **Toast**: Top-right, background `#10B981`, texto branco
- **Checkmark**: Ícone verde

---

## 📐 Princípios de Implementação

### 1. Consistência
- Usar sempre os tokens do design system
- Espaçamentos padronizados
- Cores semânticas

### 2. Hierarquia Visual
- Tamanhos de fonte claros
- Espaçamento adequado
- Contraste suficiente

### 3. Responsividade
- Mobile-first
- Breakpoints: `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`
- Sidebar colapsável em mobile

### 4. Acessibilidade
- Contraste WCAG AA mínimo
- Focus states visíveis
- Labels descritivos
- ARIA quando necessário

### 5. Performance
- CSS otimizado
- Transições suaves mas leves
- Lazy loading de imagens

---

## 🚀 Ordem de Implementação

1. ✅ **Design System** (cores, tipografia, espaçamentos no Tailwind)
2. ✅ **Componentes Base** (Button, Card, Input, etc.)
3. ✅ **Layout** (DashboardLayout, Sidebar)
4. ✅ **Páginas Internas** (Dashboard, Create Post, My Posts, Settings)
5. ✅ **Landing Page** (Hero, Features, Pricing, etc.)
6. ✅ **Estados** (Loading, Empty, Error)
7. ✅ **Polimento** (Animações, micro-interações)

---

## 📝 Notas Importantes

- **Evitar**: Cores muito vibrantes, sombras excessivas, animações chamativas
- **Priorizar**: Clareza, confiança, velocidade, usabilidade
- **Escalabilidade**: Componentes devem funcionar com múltiplas redes sociais no futuro
- **Dark Mode**: Suporte completo desde o início

---

**Próximo Passo**: Aguardar confirmação do usuário para iniciar implementação.
