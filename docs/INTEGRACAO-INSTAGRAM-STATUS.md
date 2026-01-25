# Status da Integração com Instagram

Este documento descreve o estado atual da integração com Instagram e o que foi implementado.

---

## ✅ O que foi implementado

### 1. Service de Publicação no Instagram (`instagram-service.ts`)
- ✅ Service completo para publicação de posts no Instagram Graph API
- ✅ Criação de container de mídia
- ✅ Publicação do container
- ✅ Validação de tokens
- ✅ Tratamento de erros

**Localização:** `src/api/lib/services/instagram-service.ts`

### 2. Endpoint de Publicação (`/api/posts/:id/publish`)
- ✅ Endpoint POST `/api/posts/:id/publish` para publicar posts imediatamente
- ✅ Validação de conta social conectada
- ✅ Verificação de token expirado
- ✅ Atualização de status do post após publicação
- ✅ Armazenamento do ID do post no Instagram

**Localização:** `src/api/routes/posts.ts`

### 3. OAuth do Instagram (Atualizado)
- ✅ Fluxo OAuth via Facebook (Instagram Graph API)
- ✅ Suporte para tokens de longa duração
- ✅ Obtenção de perfil do Instagram
- ✅ Suporte para contas vinculadas a Páginas do Facebook
- ✅ Refresh de tokens

**Localização:** `src/api/routes/social-accounts.ts`

### 4. Frontend Integrado
- ✅ Componente `ConnectedAccountsSection` integrado com backend
- ✅ Listagem de contas conectadas
- ✅ Botão para conectar conta do Instagram
- ✅ Botão para desconectar conta
- ✅ Indicador de token expirado

**Localização:** `components/settings/ConnectedAccountsSection.tsx`

---

## ⚠️ O que precisa ser configurado

### 1. Variáveis de ambiente

Adicione ao `.env` (veja `.env.example` e [CONFIG-OPCAO-B.md](./CONFIG-OPCAO-B.md)):

```env
INSTAGRAM_CLIENT_ID=seu_facebook_app_id
INSTAGRAM_CLIENT_SECRET=seu_facebook_app_secret
INSTAGRAM_REDIRECT_URI=http://localhost:3000/auth/callback/instagram
```

O app usa `INSTAGRAM_*`; `FACEBOOK_APP_ID` / `FACEBOOK_APP_SECRET` não são usados no código. Opcional: `FACEBOOK_WEBHOOK_VERIFY_TOKEN` para webhook do Facebook.

### 2. Configuração no Facebook Developer

Para publicar posts no Instagram, você precisa:

1. **Criar um App no Facebook Developer**
   - Acesse: https://developers.facebook.com/
   - Crie um novo app ou use um existente

2. **Adicionar o produto "Instagram Graph API"**
   - No painel do app, adicione o produto "Instagram Graph API"

3. **Configurar App Domains (IMPORTANTE - Resolve erro de domínio)**
   
   ⚠️ **Este passo é essencial para evitar o erro "The domain of this URL isn't included in the app's domains"**
   
   - No painel do app, vá em **Settings** > **Basic**
   - Na seção **App Domains**, adicione:
     - Para desenvolvimento: `localhost`
     - Para produção: seu domínio (ex: `seudominio.com` ou `app.seudominio.com`)
   - **Importante**: Adicione apenas o domínio base (sem `http://`, `https://` ou porta)
   - Exemplos corretos:
     - ✅ `localhost` (para desenvolvimento)
     - ✅ `meuapp.com` (para produção)
     - ✅ `app.meuapp.com` (para subdomínios)
   - Exemplos incorretos:
     - ❌ `http://localhost:3000`
     - ❌ `https://meuapp.com`
     - ❌ `localhost:3000`

4. **Configurar OAuth Redirect URIs**
   - No painel do app, vá em **Products** > **Facebook Login** > **Settings**
   - Na seção **Valid OAuth Redirect URIs**, adicione:
     - Para desenvolvimento: `http://localhost:3000/auth/callback/instagram`
     - Para produção: `https://seudominio.com/auth/callback/instagram`
   - **Importante**: Adicione a URL completa com protocolo, porta (se aplicável) e caminho
   - Clique em **Save Changes**

5. **Solicitar Permissões**
   - No painel do app, vá em **Products** > **Instagram Graph API** > **Permissions and Features**
   - Solicite as seguintes permissões:
     - `instagram_basic` - Acesso básico ao Instagram
     - `pages_show_list` - Listar páginas do Facebook
     - `instagram_content_publish` - Publicar conteúdo no Instagram
     - `pages_read_engagement` - Ler engajamento das páginas

6. **Revisão do App (App Review)**
   - Para usar em produção, você precisa enviar o app para revisão do Facebook
   - Em modo de desenvolvimento, funciona apenas com contas de teste adicionadas no painel

### 3. Requisitos da Conta do Instagram

Para publicar posts, a conta do Instagram precisa:

1. **Ser uma conta Business ou Creator**
   - Não funciona com contas pessoais
   - Converta a conta em Business ou Creator nas configurações do Instagram

2. **Estar vinculada a uma Página do Facebook**
   - A conta do Instagram precisa estar vinculada a uma Página do Facebook
   - Isso é feito nas configurações do Instagram: Configurações > Conta > Páginas

3. **Ter a Página do Facebook conectada ao App**
   - A Página do Facebook precisa estar conectada ao seu app do Facebook Developer
   - Isso é feito no painel do Facebook Developer

---

## 🔄 Como usar

### 1. Conectar Conta do Instagram

1. Acesse a tela de Configurações
2. Clique em "Conectar Instagram"
3. Você será redirecionado para o Facebook/Instagram para autorizar
4. Após autorizar, você será redirecionado de volta
5. A conta aparecerá na lista de contas conectadas

### 2. Publicar um Post

1. Crie um post (com imagem e legenda)
2. No editor, clique em "Postar" ou "Publicar"
3. Selecione a conta do Instagram
4. O post será publicado imediatamente no Instagram

### 3. Agendar um Post

1. Crie um post
2. No editor, clique em "Agendar"
3. Selecione data/hora e a conta do Instagram
4. O post será agendado e publicado automaticamente no horário escolhido

---

## 📝 Notas Importantes

### Sobre Tokens

- **Short-lived tokens**: Expira em 1 hora
- **Long-lived tokens**: Expira em 60 dias
- **Page tokens**: Não expiram, mas podem ser revogados

O sistema tenta automaticamente:
1. Obter um token de longa duração quando possível
2. Usar tokens de página quando disponíveis (mais estáveis)

### Sobre a API do Instagram

A Instagram Graph API tem algumas limitações:
- **Rate Limits**: Limite de requisições por hora
- **Apenas imagens**: Não suporta vídeos no momento
- **Legenda limitada**: Máximo de 2200 caracteres
- **URL da imagem**: Deve ser acessível publicamente (use Cloudflare R2 ou similar)

### Troubleshooting

**Erro: "The domain of this URL isn't included in the app's domains"**
- ⚠️ **Este é o erro mais comum ao conectar Instagram**
- **Solução**: Configure o **App Domains** no Facebook Developer Console
  1. Acesse seu app no Facebook Developer: https://developers.facebook.com/apps/
  2. Vá em **Settings** > **Basic**
  3. Na seção **App Domains**, adicione:
     - Para desenvolvimento: `localhost`
     - Para produção: seu domínio (ex: `seudominio.com`)
  4. **Importante**: Adicione apenas o domínio base, sem protocolo, porta ou caminho
  5. Clique em **Save Changes**
  6. Aguarde alguns minutos para as mudanças serem propagadas
  7. Tente conectar novamente

**Erro: "Token expirado"**
- Reconecte a conta do Instagram nas configurações

**Erro: "Falha ao obter perfil"**
- Verifique se a conta está vinculada a uma Página do Facebook
- Verifique se o app tem as permissões necessárias

**Erro: "Falha ao publicar"**
- Verifique se a URL da imagem é acessível publicamente
- Verifique se a legenda não excede 2200 caracteres
- Verifique se o token ainda é válido

**Erro: "Invalid OAuth Redirect URI"**
- Verifique se a URL no campo **Valid OAuth Redirect URIs** está exatamente igual à variável `INSTAGRAM_REDIRECT_URI` no seu `.env`
- A URL deve incluir protocolo (`http://` ou `https://`), porta (se aplicável) e caminho completo

---

## 🚧 O que ainda falta

### 1. Job para Posts Agendados (Trigger.dev)
- ⏳ Criar job no Trigger.dev para publicar posts agendados automaticamente
- ⏳ Verificar posts agendados periodicamente
- ⏳ Publicar posts quando a data/hora chegar

### ~~2. Callback Handler no Frontend~~ ✅ IMPLEMENTADO
- ✅ Página de callback criada em `app/auth/callback/instagram/page.tsx`
- ✅ Processa retorno do OAuth automaticamente
- ✅ Redireciona para configurações após sucesso

### 2. Melhorias Futuras
- ⏳ Suporte para múltiplas contas (já suportado no backend, falta UI)
- ⏳ Suporte para vídeos
- ⏳ Suporte para Stories
- ⏳ Suporte para Reels

---

## 📚 Referências

- [Instagram Graph API Documentation](https://developers.facebook.com/docs/instagram-api)
- [Facebook OAuth Documentation](https://developers.facebook.com/docs/facebook-login)
- [Instagram Content Publishing](https://developers.facebook.com/docs/instagram-api/guides/content-publishing)

---

**Última atualização:** Janeiro 2025
