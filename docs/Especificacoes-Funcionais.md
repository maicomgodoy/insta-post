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
- Usuário pode selecionar (opcional, V1):
  - Personagem da biblioteca para incluir na imagem
  - Perfil de estilo visual para aplicar
- Dispara geração assíncrona de:
  - **Imagem** usando IA (Fal.ai) - com contexto de personagem e estilo (se selecionados)
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
- Seleção de idioma preferido
- Alternância de tema (Light/Dark mode) - também disponível via botão no Header

**Processo:**
- Login OAuth com a plataforma Instagram
- Autorização de permissões necessárias
- Armazenamento seguro das credenciais/tokens
- Status de conexão visível na tela
- **Plano Agência:** Possibilidade de conectar múltiplas contas
- Seleção de idioma (Português, Espanhol, Inglês)
- Preferência de idioma é salva no perfil do usuário
- Alternância de tema (Light/Dark mode)
- Preferência de tema é salva no perfil do usuário

**Uso:**
- Posts gerados são vinculados à conta conectada selecionada
- Publicação/agendamento usa a conta configurada
- Possibilidade de desconectar/reconectar
- **Plano Agência:** Gerenciar múltiplas contas, selecionar qual conta usar para cada post
- Idioma selecionado é aplicado imediatamente em toda a interface
- Tema selecionado é aplicado imediatamente em toda a interface
- Alternância de tema pode ser feita via botão no Header/Navbar em qualquer tela

---

## 2. TELAS E FUNCIONALIDADES

### 2.1. Create Post (Tela Principal)
- **Objetivo:** Geração inicial do post
- **Ação principal:** Inserir ideia e gerar
- **Estado:** Aguardando input do usuário
- **V1:** Agente de Dicas disponível para consultas sobre estratégia de post

### 2.2. Editor (Tela de Edição)
- **Objetivo:** Editar post criado
- **Ação principal:** Edição manual ou via IA
- **Estado:** Post carregado, pronto para edição
- **V1:** Agente de Dicas disponível para consultas sobre melhorias e otimizações

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
- **V1:** Agente de Dicas disponível via chat integrado

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
- **Funcionalidades:**
  - Conexão de conta(s) social(is) (Instagram)
  - Seleção de idioma preferido (Português, Espanhol, Inglês)
  - Alternância de tema (Light/Dark mode)
  - Configurações de assinatura e planos
  - **V1:** Configuração de nicho e objetivos para o Agente de Dicas

---

### 2.7. Internacionalização (i18n)
- **Idiomas Suportados:**
  - Português (pt-BR)
  - Espanhol (es)
  - Inglês (en)
- **Detecção Automática:**
  - Sistema detecta automaticamente o idioma do navegador na primeira visita
  - Idioma padrão é definido baseado na preferência do navegador
  - Se idioma do navegador não for suportado, padrão é Inglês
- **Seleção Manual:**
  - Usuário pode alterar o idioma preferido nas Configurações
  - Preferência é salva no perfil do usuário
  - Alteração é aplicada imediatamente em toda a interface
- **Persistência:**
  - Idioma selecionado é armazenado no perfil do usuário
  - Preferência é mantida entre sessões
  - Aplicada em todas as telas e componentes da interface

---

### 2.8. Sistema de Tema (Light/Dark Mode)
- **Modos Disponíveis:**
  - Light mode (modo claro)
  - Dark mode (modo escuro)
- **Alternância:**
  - Botão de alternância facilmente acessível (geralmente no Header/Navbar)
  - Alternância é instantânea com um único clique
  - Ícone visual indica o modo atual
  - Transição suave entre os modos
- **Localização do Botão:**
  - Botão de tema visível no Header/Navbar de todas as telas
  - Posicionado de forma intuitiva e acessível
  - Disponível também nas Configurações
- **Persistência:**
  - Preferência de tema é armazenada no perfil do usuário
  - Preferência é mantida entre sessões
  - Aplicada imediatamente ao carregar a aplicação
- **Comportamento:**
  - Alteração é aplicada instantaneamente em toda a interface
  - Todas as telas e componentes respeitam o tema selecionado
  - Transição visual suave entre os modos

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
6. Email de confirmação enviado (opcional)
7. Agora pode postar/agendar

### 3.5. Agendar Post
1. Usuário finaliza edição no Editor
2. Clica em "Agendar Post"
3. Seleciona data e hora
4. Confirma agendamento
5. Post fica agendado
6. Email de confirmação de agendamento enviado
7. Sistema publica automaticamente no horário
8. Email de confirmação de publicação enviado após publicação

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

## 7. SISTEMA DE EMAILS TRANSACIONAIS

### 7.1. Fornecedor de Email

- **Provedor Recomendado:** SendPulse
  - Plano gratuito: 12.000 emails/mês
  - Limite: 50 emails/hora
  - API robusta para integração
  - Para análise detalhada, consulte [`ANALISE-EMAIL-TRANSACIONAL.md`](./ANALISE-EMAIL-TRANSACIONAL.md)

### 7.2. Emails Transacionais do Sistema

- **Emails de Autenticação:**
  - Welcome email (após confirmação de cadastro)
  - Confirmação de cadastro (link de verificação)
  - Recuperação de senha (link seguro com expiração)
  - Verificação de email
  - Notificação de login suspeito

- **Emails de Notificações:**
  - Post agendado com sucesso
  - Post publicado com sucesso
  - Falha na publicação de post
  - Créditos baixos (alerta quando < 20%)
  - Plano próximo ao vencimento (7, 3, 1 dia antes)
  - Assinatura ativada
  - Assinatura cancelada
  - Assinatura expirada

- **Emails de Sistema:**
  - Manutenção programada
  - Atualizações de funcionalidades
  - Alterações de segurança

- **Emails de Marketing/Conquista (Lead Nurturing):**
  - Email de boas-vindas ao período de teste (após cadastro)
  - Email educativo (dia 2-3 do teste): funcionalidades e casos de uso
  - Lembrete do período grátis (dia 7): meio do período
  - Email de conversão (dia 12): 2 dias antes do término
  - Email final de conversão (dia 14): último dia do período grátis
  - Email de win-back (após término do teste): sequência de reengajamento
  - Email para leads inativos: cadastrados mas não usaram a plataforma
  - Email de oferta especial: promoções estratégicas para conversão

### 7.3. Requisitos Técnicos

- Integração via API (SendPulse)
- Templates HTML responsivos
- Suporte a múltiplos idiomas (pt-BR, es, en)
- Configuração de SPF/DKIM para deliverability
- Sistema de fila para envio assíncrono (opcional)
- Logs de envio para debug
- **Automação/Sequências** para emails de marketing (lead nurturing)
- **Segmentação** de usuários (cadastrados, período grátis, inativos, não convertidos)
- **Sistema de triggers** baseado em eventos (cadastro, dias no período grátis, término do teste)

---

## 8. NOTAS PARA IMPLEMENTAÇÃO

- Todas as operações de IA devem ser assíncronas (Trigger.dev)
- UI deve sempre mostrar feedback de carregamento
- Salvamento automático durante edição
- Versionamento de posts (histórico de edições - opcional)
- Cache de preview para melhor performance
- Reutilização de post: Sistema deve enviar dados do post original (imagem + legenda) + novas instruções para a IA analisar e gerar novo post
- Na reutilização, a IA deve entender o contexto do post original e aplicar as novas instruções mantendo a essência (quando usar como base) ou evoluindo (quando dar continuidade)
- **V1 (Pós-MVP):** Biblioteca de personagens e perfis de estilo devem ser integrados no processo de geração de imagem, enviando contexto adicional (referência de personagem + instruções temáticas do perfil) para a IA
- **Emails:** Implementar camada de abstração (EmailService) para facilitar migração futura entre provedores

---

## 8. FUNCIONALIDADES V1 (PÓS-MVP)

Funcionalidades planejadas para a versão 1.0 (pós-MVP) que aprimorarão a experiência do usuário e a consistência visual dos posts.

### 8.1. Biblioteca de Personagens e Elementos Visuais

- **Objetivo:** Permitir que usuários salvem e reutilizem personagens e elementos visuais principais em seus posts

- **Funcionalidades:**

  - **Salvar Personagens:**
    - Upload de imagem do próprio usuário
    - Personagens criados através de IA
    - Qualquer elemento visual que o usuário deseje reutilizar (objetos, animais, produtos, etc.)
    - Nomear e categorizar personagens salvos
    - Preview visual na biblioteca

  - **Gerenciamento de Biblioteca:**
    - Biblioteca pessoal de personagens/elementos salvos
    - Organização por categorias (ex: personagens principais, objetos, animais, produtos)
    - Busca e filtros na biblioteca
    - Edição de nome e categoria
    - Exclusão de personagens/elementos não utilizados

  - **Reutilização na Criação:**
    - Seleção de personagem/elemento da biblioteca durante a criação do post
    - Referência automática ao personagem na geração de imagem
    - IA utiliza o personagem salvo como base/contexto para a nova imagem
    - Manutenção da identidade visual entre posts

  - **Limites e Armazenamento:**
    - Limite de personagens salvos por plano (a definir)
    - Armazenamento de imagens no Cloudflare R2
    - Otimização de imagens para economia de espaço

---

### 8.2. Instruções Temáticas e Estilos Visuais

- **Objetivo:** Permitir que usuários definam e apliquem instruções temáticas consistentes para manter um estilo visual uniforme em seus posts

- **Funcionalidades:**

  - **Criar Perfis de Estilo:**
    - Definir perfis de estilo visual (ex: "Desenho", "Estilo Filme", "Quente", "Sobrio", "Minimalista", "Colorido", etc.)
    - Nomear e descrever cada perfil de estilo
    - Criar múltiplos perfis de estilo para diferentes tipos de conteúdo

  - **Instruções Temáticas:**
    - Campo de texto para instruções temáticas detalhadas
    - Exemplos de instruções:
      - "Desenho: estilo cartoon, cores vibrantes, traços definidos"
      - "Estilo Filme: cinematográfico, cores saturadas, iluminação dramática"
      - "Quente: cores quentes (vermelho, laranja, amarelo), atmosfera vibrante"
      - "Sobrio: cores neutras (cinza, bege, preto), estilo elegante e minimalista"
    - Salvar instruções como templates reutilizáveis

  - **Aplicação Automática:**
    - Seleção de perfil de estilo durante a criação do post
    - Instruções temáticas são automaticamente incluídas na geração de imagem
    - IA aplica o estilo definido consistentemente
    - Possibilidade de combinar personagem da biblioteca + perfil de estilo

  - **Gerenciamento:**
    - Biblioteca de perfis de estilo salvos
    - Editar, duplicar e excluir perfis
    - Definir perfil padrão para criação de posts
    - Aplicação rápida de perfil favorito

  - **Consistência Visual:**
    - Manutenção de identidade visual entre posts usando o mesmo perfil
    - Facilita criação de séries temáticas
    - Brand consistency para empresas/marcas

---

### 8.3. Agente/Assistente de Dicas (Chat de Aconselhamento)

- **Objetivo:** Fornecer dicas personalizadas sobre como e quando postar, baseadas no nicho, objetivos e contexto do usuário

- **Funcionalidades:**

  - **Interface de Chat:**
    - Chat simples e intuitivo integrado ao sistema
    - Disponível em todas as telas principais (Create Post, Editor, Dashboard)
    - Botão flutuante ou painel lateral para acesso rápido
    - Histórico de conversa mantido durante a sessão

  - **Dicas Contextuais:**
    - **Dicas de Como Postar:**
      - Sugestões de conteúdo baseadas no nicho
      - Recomendações de estilo visual
      - Dicas de composição e elementos visuais
      - Sugestões de tom e abordagem de texto
      - Exemplos de posts que funcionam bem no nicho
    
    - **Dicas de Quando Postar:**
      - Horários ideais para o nicho
      - Dias da semana mais eficazes
      - Frequência recomendada de posts
      - Análise de quando o público está mais ativo
    
    - **Dicas Baseadas no Objetivo:**
      - Venda: abordagem mais comercial, CTAs claros
      - Engajamento: conteúdo mais interativo, perguntas
      - Branding: consistência visual, identidade de marca
      - Educação: conteúdo informativo, didático
      - Entretenimento: conteúdo leve, divertido

  - **Personalização:**
    - Configuração de nicho do usuário
    - Definição de objetivos principais (venda, engajamento, branding, etc.)
    - Contexto do post atual (tema, objetivo específico)
    - Análise de histórico de posts do usuário (quando disponível)

  - **Salvamento de Instruções:**
    - Opção de salvar instruções/dicas recebidas
    - Instruções salvas podem ser aplicadas automaticamente na geração
    - Biblioteca de instruções salvas para reutilização
    - Integração com perfis de estilo e biblioteca de personagens
    - Instruções salvas tornam a geração mais acertiva e personalizada

  - **Integração com Geração:**
    - Instruções salvas podem ser incluídas automaticamente no prompt de geração
    - Combinação de dicas do agente + perfil de estilo + personagem
    - Resultado: Posts mais alinhados com estratégia e objetivos
    - Feedback loop: IA aprende com instruções salvas e histórico

  - **Tipos de Dicas:**
    - **Estratégicas:** Quando postar, frequência, horários ideais
    - **Criativas:** Estilo visual, tom, abordagem de conteúdo
    - **Técnicas:** Composição, elementos visuais, formato
    - **Conteúdo:** Temas, assuntos, hashtags sugeridas
    - **Performance:** (V2) Baseadas em dados de engajamento

---

### 8.4. Integração: Biblioteca + Perfis de Estilo + Agente de Dicas

- **Workflow Integrado:**
  - Usuário consulta agente de dicas sobre estratégia de post
  - Agente sugere perfil de estilo apropriado e/ou personagem
  - Usuário salva instruções relevantes do agente
  - Sistema combina: personagem + perfil de estilo + instruções salvas do agente
  - Resultado: Post altamente personalizado e estratégico

- **Exemplos de Uso:**
  - **Consultor:** Pergunta ao agente "Como criar posts para nicho de negócios?", agente sugere perfil "Sobrio", instruções de tom profissional, usuário salva e aplica automaticamente
  
  - **Influencer de Fitness:** Consulta dicas sobre horários ideais, agente sugere perfil "Quente", personagem (foto do usuário), e instruções de conteúdo motivacional, tudo salvo e aplicado
  
  - **Marca de Moda:** Agente sugere consistência visual, perfil "Estilo Filme", personagem (mascote), e instruções de storytelling de marca, criando identidade visual forte

---

## 9. FUNCIONALIDADES V2 (FUTURAS)

Funcionalidades planejadas para versões futuras que agregarão valor e diferenciais competitivos ao produto.

### 9.1. Analytics e Performance

- **Análise de Performance dos Posts**
  - Métricas de engajamento (likes, comentários, compartilhamentos)
  - Visualização de posts que performaram melhor
  - Identificação de padrões de sucesso
  - Relatórios mensais/semanais automáticos

- **Sugestões de Melhor Horário para Postar**
  - Análise de histórico de posts e engajamento
  - Recomendações de horários otimizados por conta
  - Insights baseados em dados reais

- **Biblioteca de Hashtags Inteligente**
  - Sugestões de hashtags baseadas no conteúdo
  - Histórico de hashtags que geraram mais engajamento
  - Agrupamento de hashtags por tema/nicho
  - Salvamento de conjuntos de hashtags favoritas

### 9.2. Templates e Recursos

- **Biblioteca de Templates**
  - Templates pré-definidos por nicho/tema
  - Templates personalizáveis
  - Categorias: negócios, lifestyle, produto, educacional, etc.
  - Compartilhamento de templates entre usuários (opcional)

- **Brand Kit**
  - Cores da marca salvas
  - Fontes preferidas
  - Logo/watermark personalizado
  - Aplicação automática nas criações
  - Identidade visual consistente

- **Biblioteca de Assets**
  - Banco de imagens integrado (stock photos)
  - Ícones e elementos gráficos
  - Filtros e efeitos pré-configurados
  - Biblioteca pessoal de assets favoritos

### 9.3. Agendamento Avançado

- **Agendamento Recorrente**
  - Posts semanais (ex: toda segunda-feira)
  - Posts mensais (ex: dia 1º de cada mês)
  - Configuração de séries de posts
  - Automatização de conteúdo repetitivo

- **Agendamento em Massa**
  - Importar múltiplos posts de uma vez
  - Upload de planilha CSV/Excel
  - Criar e agendar várias versões rapidamente
  - Modo batch para criação em lote

- **Calendário Editorial**
  - Visão de calendário mensal completo
  - Drag & drop para reorganizar posts
  - Planejamento visual de conteúdo
  - Previsão de posts por período

### 9.4. Multi-plataforma

- **Integração com Outras Redes Sociais**
  - TikTok
  - LinkedIn
  - Facebook
  - Twitter/X
  - Publicação simultânea ou individual por plataforma

- **Adaptação Automática de Conteúdo**
  - Ajuste automático de tamanho/formato por plataforma
  - Otimização de legendas para cada rede
  - Versões adaptadas mantendo a essência do post

### 9.5. Colaboração e Equipes

- **Gerenciamento de Equipes** (Plano Agência)
  - Adicionar membros da equipe
  - Permissões e papéis (admin, editor, visualizador)
  - Atribuição de posts a membros específicos
  - Comentários e feedback internos

- **Aprovação de Posts**
  - Workflow de aprovação
  - Notificações para revisão
  - Histórico de alterações e aprovações
  - Controle de qualidade antes da publicação

### 9.6. Inteligência Avançada

- **A/B Testing de Posts**
  - Criar múltiplas variações do mesmo post
  - Testar diferentes legendas/imagens
  - Publicar variações e comparar performance
  - Insights sobre qual versão performa melhor

- **Sugestões Inteligentes Baseadas em Sucesso**
  - IA analisa posts de sucesso do usuário
  - Sugere temas, estilos e abordagens similares
  - Aprendizado com histórico de engajamento
  - Recomendações personalizadas por conta

- **Geração em Lote com Variações**
  - Criar múltiplos posts a partir de uma ideia
  - Variações automáticas de texto e imagem
  - Séries temáticas geradas automaticamente
  - Economia de tempo para campanhas

### 9.7. Exportação e Integração

- **Exportação Avançada**
  - Download de posts em alta resolução
  - Exportação em lote
  - Formatos: PNG, JPG, PDF
  - Preparação para impressão (se aplicável)

- **Integração com Ferramentas de Marketing**
  - Zapier/Make.com
  - APIs para integrações customizadas
  - Webhooks para automações externas
  - Exportação de dados para análise externa

### 9.8. Recursos de Edição Avançados

- **Editor de Imagem Mais Completo**
  - Ferramentas de design mais avançadas
  - Camadas e elementos sobrepostos
  - Animações leves (GIFs)
  - Efeitos e filtros avançados

- **Editor de Vídeo Básico**
  - Criação de vídeos curtos
  - Edição simples (cortes, transições)
  - Adição de texto e elementos gráficos
  - Exportação otimizada para redes sociais

### 9.9. Segurança e Backup

- **Backup Automático**
  - Backup automático de todos os posts
  - Exportação de dados do usuário
  - Restauração de versões anteriores
  - Histórico completo preservado

- **Watermark Personalizado**
  - Adicionar marca d'água automática
  - Configuração de posição e opacidade
  - Proteção de conteúdo (opcional)

### 9.10. Personalização e Automação

- **Modo Noturno para Criação**
  - Sugestões baseadas em horário do dia
  - Temas de posts sazonais automáticos
  - Conteúdo relevante para datas especiais

- **Automações Personalizadas**
  - Regras customizadas para criação
  - Gatilhos automáticos (ex: novo produto = criar post)
  - Integração com calendário de eventos
  - Automação de workflows de conteúdo

---

**Nota:** Estas funcionalidades são planejadas para versões futuras e serão priorizadas baseadas em feedback dos usuários, métricas de uso e necessidades do mercado. A implementação seguirá os princípios do produto: simplicidade, facilidade de uso e foco na experiência do usuário.
