# ESPECIFICAÇÕES FUNCIONAIS - INSTA POST

Este documento detalha as especificações funcionais, fluxos de usuário, casos de uso e requisitos do produto. É complementar ao [`Sistema.md`](../Sistema.md) (fonte técnica) e ao [`README.md`](./README.md) (apresentação geral).

---

## 1. FLUXO PRINCIPAL DO USUÁRIO

### Pré-requisitos
- Usuário autenticado (login realizado)
- Plano ativo ou período de teste grátis (14 dias)

### Fluxo Completo

#### 1.1. Criação do Post

**Ação:** Usuário informa uma ideia simples para o post

**Processo:**
- Sistema recebe a ideia do usuário
- Dispara geração assíncrona de:
  - **Imagem** usando IA (Fal.ai)
  - **Legenda** usando LLM (OpenRouter)
- Processamento não bloqueia a UI
- Post inicial é criado e salvo no histórico

**Resultado:**
- Post criado com imagem e legenda geradas
- Redirecionamento automático para tela de Editor

---

#### 1.2. Tela de Editor (Tipo Canva)

**Contexto:**
- Abre automaticamente após geração do post
- Também pode ser acessada via histórico (My Posts)

**Funcionalidades Disponíveis:**

**a) Edição Manual**
- Ajustar imagem diretamente na interface
- Editar legenda em campo de texto
- Interface focada e limpa, similar ao Canva
- Preview em tempo real das alterações

**b) Edição via IA**
- Usuário pode solicitar alterações na imagem:
  - Pedir para IA alterar elementos específicos
  - Aplicar filtros ou estilos
  - Ajustar composição
- Usuário pode solicitar alterações na legenda:
  - Reescrever com outro tom
  - Ajustar tamanho/comprimento
  - Alterar foco/tema
- Processamento assíncrono (não bloqueia UI)

**Interface:**
- Design minimalista
- Foco na tarefa de edição
- Ferramentas acessíveis e intuitivas

---

#### 1.3. Ação Final: Postar/Agendar

**Opções Disponíveis:**

**a) Postar Imediatamente**
- Disponível apenas se conta social estiver conectada
- Publica o post na conta configurada
- Confirmação antes de publicar

**b) Agendar Post**
- Usuário seleciona data e hora
- Post fica agendado no sistema
- Publicação automática no horário definido (requer conta conectada)

**Validações:**
- Verificar se conta social está conectada
- Informar custo da operação (se usar IA)
- Validar dados do post antes de agendar/publicar

---

#### 1.4. Tela de Configurações

**Funcionalidade Principal:**
- Conexão de conta(s) social(is) (Instagram)

**Processo:**
- Login OAuth com a plataforma Instagram
- Autorização de permissões necessárias
- Armazenamento seguro das credenciais/tokens
- Status de conexão visível na tela
- **Plano Agência:** Possibilidade de conectar múltiplas contas

**Uso:**
- Posts gerados são vinculados à conta conectada selecionada
- Publicação/agendamento usa a conta configurada
- Possibilidade de desconectar/reconectar
- **Plano Agência:** Gerenciar múltiplas contas, selecionar qual conta usar para cada post

---

## 2. TELAS E FUNCIONALIDADES

### 2.1. Create Post (Tela Principal)
- **Objetivo:** Geração inicial do post
- **Ação principal:** Inserir ideia e gerar
- **Estado:** Aguardando input do usuário

### 2.2. Editor (Tela de Edição)
- **Objetivo:** Editar post criado
- **Ação principal:** Edição manual ou via IA
- **Estado:** Post carregado, pronto para edição

### 2.3. My Posts (Histórico)
- **Objetivo:** Visualizar posts criados
- **Ação principal:** Acessar/editar/reutilizar posts anteriores
- **Funcionalidades:**
  - Visualizar lista de posts do usuário
  - Editar post existente
  - **Reutilizar post:** Criar novo post baseado em um existente
    - Usar como base/template
    - Dar continuidade ao post
    - Enviar dados para análise da IA
    - Criar novo post com novas instruções
- **Estado:** Lista de posts do usuário

### 2.4. Dashboard (Visão Geral)
- **Objetivo:** Visão geral da conta(s)
- **Informações:** Estatísticas, histórico de uso, custos, etc.
- **Funcionalidades adicionais (Plano Agência):**
  - Dashboard unificado para múltiplas contas
  - Filtros para visualizar posts por conta específica
  - Estatísticas consolidadas e por conta
  - Gerenciamento centralizado de todas as contas conectadas

### 2.5. Calendário
- **Objetivo:** Visualizar histórico e agendamentos de posts
- **Ação principal:** Visualizar timeline de posts
- **Funcionalidades:**
  - Visualizar quando posts foram publicados (data/hora)
  - Visualizar posts agendados (data/hora futura)
  - Diferenciação visual entre publicado e agendado
  - Navegação por meses/anos
  - Click em data para ver detalhes dos posts do dia
- **Estado:** Calendário com marcações de posts

### 2.6. Configurações
- **Objetivo:** Gerenciar conta e integrações
- **Ação principal:** Conectar conta social
- **Estado:** Configurações da conta

---

## 3. CASOS DE USO

### 3.1. Criar Novo Post
1. Usuário acessa "Create Post"
2. Informa ideia simples
3. Sistema gera imagem + legenda
4. Redireciona para Editor
5. Usuário edita (manual ou IA)
6. Posta ou agenda

### 3.2. Editar Post Existente
1. Usuário acessa "My Posts"
2. Seleciona post do histórico
3. Abre no Editor
4. Realiza alterações
5. Salva alterações
6. (Opcional) Posta ou agenda novamente

### 3.3. Reutilizar Post
1. Usuário acessa "My Posts"
2. Seleciona post do histórico
3. Clica em "Reutilizar" ou "Usar como base"
4. Informa novas instruções/alterações desejadas
5. Sistema envia dados do post original + novas instruções para análise da IA
6. IA analisa o post original e as novas instruções
7. Sistema gera novo post baseado no anterior com as modificações
8. Novo post é criado e abre no Editor
9. Usuário pode editar, postar ou agendar

### 3.4. Conectar Conta Social
1. Usuário acessa "Configurações"
2. Clica em "Conectar Instagram"
3. Realiza OAuth
4. Autoriza permissões
5. Conta conectada com sucesso
6. Agora pode postar/agendar

### 3.5. Agendar Post
1. Usuário finaliza edição no Editor
2. Clica em "Agendar Post"
3. Seleciona data e hora
4. Confirma agendamento
5. Post fica agendado
6. Sistema publica automaticamente no horário

### 3.6. Visualizar Calendário
1. Usuário acessa "Calendário"
2. Visualiza calendário mensal com marcações
3. Identifica posts publicados (marcação diferente)
4. Identifica posts agendados (marcação diferente)
5. Clica em uma data específica
6. Vê detalhes dos posts daquele dia
7. Pode editar/cancelar posts agendados (se aplicável)

---

## 4. REGRAS DE NEGÓCIO

### 4.1. Sistema de Assinatura

**Modelo:** Assinaturas mensais com créditos

**Plataforma de Gerenciamento:** Stripe
- Processamento de pagamentos
- Gerenciamento de assinaturas recorrentes
- Webhooks para sincronização de eventos
- Gestão de planos e preços

#### Planos Disponíveis

1. **Starter** (Básico)
   - Créditos mensais determinados (quantidade a definir)
   - **Limitação:** Não permite agendar posts
   - Apenas publicação imediata
   - Ideal para uso pessoal/iniciante

2. **Pro** (Intermediário)
   - Créditos mensais determinados (quantidade a definir)
   - Permite agendar posts (limite de 10 posts agendados simultaneamente)
   - Permite publicação imediata
   - Ideal para profissionais/marcas

3. **Premium** (Avançado)
   - Créditos mensais determinados (quantidade a definir)
   - Permite agendar posts (ilimitado)
   - Permite publicação imediata
   - Ideal para uso intensivo

4. **Agência**
   - Créditos mensais determinados (quantidade a definir)
   - Permite agendar posts (ilimitado)
   - Permite publicação imediata
   - **Múltiplas contas:** Conectar várias contas do Instagram
   - **Dashboard unificado:** Gerenciar todas as contas em uma única interface
   - **Filtros:** Visualizar e filtrar posts por conta específica
   - Utilizar IA para todas as contas conectadas
   - Ideal para agências, empresas com múltiplas marcas/contas

#### Período de Teste Grátis

- **14 dias grátis** para todos os novos usuários
- Créditos suficientes para criar alguns posts
- **Sem bloqueios de funcionalidade** durante o período grátis
- Serve como amostra completa de todas as funcionalidades
- Após 14 dias, usuário escolhe plano ou perde acesso

#### Sistema de Créditos

- Cada plano fornece um número determinado de créditos mensais
- Créditos são consumidos a cada interação com IA
- Cada modelo de IA tem custo em créditos específico:
  - Modelos de texto (OpenRouter): créditos por modelo escolhido
  - Modelos de imagem (Fal.ai): créditos por modelo/operação
- Créditos são renovados mensalmente conforme o plano
- Créditos não utilizados não acumulam (reset mensal)

**Operações que consomem créditos:**
- Geração de texto (legenda) via LLM
- Geração de imagem via IA
- Edição de imagem via IA
- Edição de texto via IA (se disponível)
- Reutilização de post (análise da IA + geração baseada no post original)

**Operações que NÃO consomem créditos:**
- Edição manual de imagem
- Edição manual de texto/legenda
- Visualização de posts
- Agendamento/publicação (sem uso de IA)

### 4.2. Publicação
- Requer conta social conectada
- Validação de dados antes de publicar
- Confirmação antes de ação irreversível
- Disponível em todos os planos

### 4.3. Agendamento
- Requer conta social conectada
- Data/hora deve ser futura
- Sistema verifica periodicamente posts agendados
- **Disponível apenas nos planos Pro, Premium e Agência**
- **Não disponível no plano Starter**
- **Limites por plano:**
  - **Plano Pro:** Máximo de 10 posts agendados simultaneamente
  - **Plano Premium:** Ilimitado (sem limite de posts agendados)
  - **Plano Agência:** Ilimitado (sem limite de posts agendados)
- Disponível no período de teste grátis (14 dias) - sem limites
- Ao tentar agendar além do limite (plano Pro), sistema deve informar e oferecer upgrade

### 4.4. Múltiplas Contas (Plano Agência)
- Conectar várias contas do Instagram na mesma assinatura
- Selecionar qual conta usar ao criar/editar post
- Dashboard unificado com todas as contas
- Filtros para visualizar posts por conta específica
- Estatísticas consolidadas e separadas por conta
- Utilizar créditos compartilhados para todas as contas
- Gerenciar todas as contas em uma única interface

### 4.5. Editor
- Salvar alterações manuais não gera custo
- Edições via IA geram custo por operação
- Múltiplas edições permitidas
- Preview sempre disponível

---

## 5. ESTADOS E TRANSIÇÕES

### 5.1. Estados do Post
- **Rascunho:** Criado, não finalizado
- **Pronto:** Editado, pronto para publicar/agendar
- **Agendado:** Agendado para publicação futura
- **Publicado:** Já publicado na rede social

### 5.2. Estados da Conta Social
- **Desconectada:** Nenhuma conta conectada
- **Conectada:** Conta conectada e ativa
- **Expirada:** Token expirado, requer reconexão

---

## 6. VALIDAÇÕES E TRATAMENTO DE ERROS

### 6.1. Validações
- Verificar se usuário tem plano ativo ou está no período grátis
- Verificar créditos disponíveis antes de gerar/editar via IA
- Verificar conexão social antes de publicar/agendar
- Validar se plano permite agendamento (Starter não permite)
- Verificar limite de posts agendados (Pro: máximo 10, Premium: ilimitado)
- Validar formato e tamanho da imagem
- Validar tamanho da legenda
- Calcular e informar custo em créditos antes de executar operação com IA

### 6.2. Tratamento de Erros
- Falha na geração: Retry ou mensagem de erro
- Falha na publicação: Notificar usuário
- Token expirado: Solicitar reconexão
- Sem créditos disponíveis: Oferecer upgrade de plano ou compra de créditos extras
- Plano expirado: Solicitar renovação ou upgrade
- Tentativa de agendar no plano Starter: Informar limitação e oferecer upgrade
- Tentativa de agendar além do limite (plano Pro com 10 posts já agendados): Informar limite atingido e oferecer upgrade para Premium

---

## 7. NOTAS PARA IMPLEMENTAÇÃO

- Todas as operações de IA devem ser assíncronas (Trigger.dev)
- UI deve sempre mostrar feedback de carregamento
- Salvamento automático durante edição
- Versionamento de posts (histórico de edições - opcional)
- Cache de preview para melhor performance
- Reutilização de post: Sistema deve enviar dados do post original (imagem + legenda) + novas instruções para a IA analisar e gerar novo post
- Na reutilização, a IA deve entender o contexto do post original e aplicar as novas instruções mantendo a essência (quando usar como base) ou evoluindo (quando dar continuidade)

---

## 8. PRÓXIMOS PASSOS

Este documento será atualizado conforme novas instruções e detalhes forem fornecidos.

**Status:** Em desenvolvimento - aguardando mais instruções
