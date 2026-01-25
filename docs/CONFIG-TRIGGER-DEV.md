# Configuração Trigger.dev – Insta Post

Guia para conectar o backend ao **Trigger.dev** e passar processamentos assíncronos (geração de texto/imagem, edição via IA, publicação agendada, etc.) para tasks.

---

## 1. O que já está no projeto

- **@trigger.dev/sdk** e **@trigger.dev/build** instalados
- **trigger.config.ts** na raiz (project, dirs `./trigger`, retries, Prisma extension)
- Pasta **trigger/** com task de exemplo (`example.ts`)
- Rota **GET /api/trigger-test** para disparar a task de exemplo
- Scripts **pnpm run trigger:dev** e **pnpm run trigger:deploy**
- Variáveis **TRIGGER_PROJECT_REF** e **TRIGGER_SECRET_KEY** em `.env.example`

---

## 2. Conta e projeto no Trigger.dev

1. Acesse [cloud.trigger.dev](https://cloud.trigger.dev) e crie uma conta (ou faça login).
2. Crie um **novo projeto** (ex.: `insta-post`).
3. Em **Project settings**, copie o **Project ref** (ex.: `proj_xxxx`).
4. Em **API Keys**, crie ou use a chave **DEV** e copie o **Secret key** (ex.: `tr_dev_xxxx`).

---

## 3. Variáveis de ambiente

### 3.1. No seu `.env` local (para Next.js)

```env
TRIGGER_PROJECT_REF="proj_xxxx"
TRIGGER_SECRET_KEY="tr_dev_xxxx"
DATABASE_URL="postgresql://postgres:senha@host:5432/postgres"
```

- **TRIGGER_PROJECT_REF**: identifica o projeto no Trigger.dev (usado em `trigger.config.ts`).
- **TRIGGER_SECRET_KEY**: usada pelo **Next.js** para disparar tasks via `tasks.trigger()`. Use a chave **DEV** em desenvolvimento.
- **DATABASE_URL**: URL de conexão PostgreSQL (usada pelo Prisma no Next.js).

### 3.2. No Trigger.dev Dashboard (para as tasks)

**IMPORTANTE**: As tasks do Trigger.dev rodam em um ambiente separado e precisam ter suas próprias variáveis de ambiente configuradas.

1. Acesse [cloud.trigger.dev](https://cloud.trigger.dev) e vá para seu projeto.
2. Vá em **Project Settings** → **Environment Variables** → **Dev** (ou o ambiente que você está usando).
3. Adicione as seguintes variáveis:

```
DATABASE_URL=postgresql://postgres:senha@host:5432/postgres
FAL_API_KEY=sua-chave-fal-ai
```

**Por que isso é necessário?**
- As tasks do Trigger.dev rodam em servidores remotos e não têm acesso ao seu `.env` local.
- O Prisma precisa do `DATABASE_URL` para atualizar o status dos jobs no Supabase.
- O FAL.AI precisa da `FAL_API_KEY` para gerar imagens.

**Nota**: Use a mesma `DATABASE_URL` que você usa no `.env` local (a connection string do Supabase PostgreSQL).

---

## 4. Rodar em desenvolvimento

É preciso ter **dois** processos ao mesmo tempo:

1. **Next.js** (API + frontend):
   ```bash
   pnpm dev
   ```

2. **Trigger.dev** (dev server das tasks):
   ```bash
   pnpm run trigger:dev
   ```

O `trigger:dev` observa a pasta **trigger/**, envia as tasks para o Trigger.dev e exibe logs das runs. Mantenha esse terminal aberto enquanto testa tasks.

(Opcional) Para subir os dois juntos em um só terminal, use `concurrently`:

```bash
pnpm add -D concurrently
```

e em `package.json`:

```json
"dev:all": "concurrently -n next,trigger -c yellow,blue \"pnpm dev\" \"pnpm run trigger:dev\""
```

Depois: `pnpm run dev:all`.

---

## 5. Testar a conexão

1. Subir **Next.js** (`pnpm dev`) e **Trigger.dev** (`pnpm run trigger:dev`).
2. Garantir que **TRIGGER_PROJECT_REF** e **TRIGGER_SECRET_KEY** estão no `.env`.
3. Abrir **http://localhost:3000/api/trigger-test** (ou a porta do seu app).
4. A resposta deve ser algo como `{ "id": "run_xxx", ... }`.
5. No terminal do `trigger:dev` e no [Dashboard](https://cloud.trigger.dev) do projeto, deve aparecer a run da task **example**.

Se der erro 500, verifique o console do Next.js e as variáveis de ambiente.

---

## 6. Como disparar tasks a partir do backend

Use o SDK no código que roda no Next.js (API Routes, Server Actions, etc.):

```ts
import { tasks } from '@trigger.dev/sdk'
import type { exampleTask } from '@/trigger/example'

// Disparar a task "example"
const handle = await tasks.trigger<typeof exampleTask>('example', {
  name: 'Insta Post',
})
// handle.id, handle.fingerprint, etc.
```

Para **suas** tasks:

1. Crie um arquivo em **trigger/** (ex.: `trigger/generate-post.ts`).
2. Exporte a task com `task({ id: "generate-post", run: async (payload) => { ... } })`.
3. Nas rotas de API (ex.: `POST /api/posts/generate`), chame `tasks.trigger<typeof generatePostTask>("generate-post", payload)` em vez de fazer o processamento pesado na própria rota.

Assim, geração de legenda, imagem, edição via IA e publicação agendada podem rodar como tasks no Trigger.dev.

---

## 7. Deploy das tasks

Para usar em produção:

1. No Trigger.dev, use a chave **Production** (ou o ambiente que configurar).
2. No **.env** de produção, defina **TRIGGER_SECRET_KEY** com essa chave.
3. Rode o deploy das tasks:
   ```bash
   pnpm run trigger:deploy
   ```
4. Configure **TRIGGER_ACCESS_TOKEN** no CI (ex.: GitHub Actions) se for fazer deploy automático.

---

## 8. Referências

- [Next.js setup – Trigger.dev](https://trigger.dev/docs/guides/frameworks/nextjs)
- [trigger.config.ts](https://trigger.dev/docs/config/config-file)
- [Writing tasks](https://trigger.dev/docs/writing-tasks-introduction)
- [Triggering](https://trigger.dev/docs/triggering)
- [Prisma extension](https://trigger.dev/docs/config/extensions/prismaExtension) (já usada no `trigger.config.ts`)

---

**Última atualização:** Janeiro 2025
