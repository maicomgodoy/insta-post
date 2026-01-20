-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Insta Post - Supabase
-- ============================================
-- Este arquivo contém todas as políticas RLS necessárias para o projeto
-- Execute estas queries no SQL Editor do Supabase
-- ============================================

-- ============================================
-- 1. TABELA: users
-- ============================================
-- Habilitar RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ler seus próprios dados
CREATE POLICY "Users can read their own data"
ON users
FOR SELECT
USING (auth.uid()::text = id);

-- Política: Usuários podem inserir seus próprios dados (no registro)
CREATE POLICY "Users can insert their own data"
ON users
FOR INSERT
WITH CHECK (auth.uid()::text = id);

-- Política: Usuários podem atualizar seus próprios dados
CREATE POLICY "Users can update their own data"
ON users
FOR UPDATE
USING (auth.uid()::text = id)
WITH CHECK (auth.uid()::text = id);

-- Nota: Deletar usuários geralmente é feito pelo backend ou Supabase Auth

-- ============================================
-- 2. TABELA: plans
-- ============================================
-- Habilitar RLS
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler planos (para mostrar na página de preços)
CREATE POLICY "Anyone can read plans"
ON plans
FOR SELECT
USING (true);

-- Nota: Criar/editar/deletar planos é feito apenas pelo backend (service_role)

-- ============================================
-- 3. TABELA: subscriptions
-- ============================================
-- Habilitar RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ler sua própria assinatura
CREATE POLICY "Users can read their own subscription"
ON subscriptions
FOR SELECT
USING (auth.uid()::text = user_id);

-- Nota: Criar/editar assinaturas é feito pelo backend (webhooks Stripe, etc.)

-- ============================================
-- 4. TABELA: credits
-- ============================================
-- Habilitar RLS
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ler seus próprios créditos
CREATE POLICY "Users can read their own credits"
ON credits
FOR SELECT
USING (auth.uid()::text = user_id);

-- Nota: Criar créditos (renovação mensal, compra, etc.) é feito pelo backend

-- ============================================
-- 5. TABELA: posts
-- ============================================
-- Habilitar RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ler seus próprios posts
CREATE POLICY "Users can read their own posts"
ON posts
FOR SELECT
USING (auth.uid()::text = user_id);

-- Política: Usuários podem criar seus próprios posts
CREATE POLICY "Users can create their own posts"
ON posts
FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- Política: Usuários podem atualizar seus próprios posts
CREATE POLICY "Users can update their own posts"
ON posts
FOR UPDATE
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Política: Usuários podem deletar seus próprios posts
CREATE POLICY "Users can delete their own posts"
ON posts
FOR DELETE
USING (auth.uid()::text = user_id);

-- ============================================
-- 6. TABELA: social_accounts
-- ============================================
-- Habilitar RLS
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ler suas próprias contas sociais
CREATE POLICY "Users can read their own social accounts"
ON social_accounts
FOR SELECT
USING (auth.uid()::text = user_id);

-- Política: Usuários podem criar suas próprias contas sociais
CREATE POLICY "Users can create their own social accounts"
ON social_accounts
FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- Política: Usuários podem atualizar suas próprias contas sociais
CREATE POLICY "Users can update their own social accounts"
ON social_accounts
FOR UPDATE
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- Política: Usuários podem deletar suas próprias contas sociais
CREATE POLICY "Users can delete their own social accounts"
ON social_accounts
FOR DELETE
USING (auth.uid()::text = user_id);

-- ============================================
-- 7. TABELA: rejected_images
-- ============================================
-- Habilitar RLS
ALTER TABLE rejected_images ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ler suas próprias imagens rejeitadas
CREATE POLICY "Users can read their own rejected images"
ON rejected_images
FOR SELECT
USING (auth.uid()::text = user_id);

-- Política: Usuários podem criar suas próprias imagens rejeitadas
CREATE POLICY "Users can create their own rejected images"
ON rejected_images
FOR INSERT
WITH CHECK (auth.uid()::text = user_id);

-- Política: Usuários podem deletar suas próprias imagens rejeitadas
CREATE POLICY "Users can delete their own rejected images"
ON rejected_images
FOR DELETE
USING (auth.uid()::text = user_id);

-- ============================================
-- 8. TABELA: research_cache
-- ============================================
-- Habilitar RLS
ALTER TABLE research_cache ENABLE ROW LEVEL SECURITY;

-- Política: Cache de pesquisa é público para leitura (para evitar pesquisas duplicadas)
CREATE POLICY "Anyone can read research cache"
ON research_cache
FOR SELECT
USING (true);

-- Nota: Criar/atualizar/deletar cache é feito pelo backend (service_role)

-- ============================================
-- RESUMO DAS POLÍTICAS
-- ============================================
-- users: SELECT, INSERT, UPDATE (próprios dados)
-- plans: SELECT (público)
-- subscriptions: SELECT (própria assinatura)
-- credits: SELECT (próprios créditos)
-- posts: SELECT, INSERT, UPDATE, DELETE (próprios posts)
-- social_accounts: SELECT, INSERT, UPDATE, DELETE (próprias contas)
-- rejected_images: SELECT, INSERT, DELETE (próprias imagens rejeitadas)
-- research_cache: SELECT (público, para evitar duplicação de pesquisas)
-- ============================================
