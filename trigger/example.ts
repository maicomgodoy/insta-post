import { logger, task } from '@trigger.dev/sdk'

/**
 * Task de exemplo para validar a conexão com Trigger.dev.
 * Use como referência ao criar suas tasks (geração de texto, imagem, etc.).
 *
 * Disparar: GET /api/trigger-test ou tasks.trigger("example", { name: "..." })
 */
export const exampleTask = task({
  id: 'example',
  run: async (payload: { name?: string }) => {
    const name = payload?.name ?? 'Insta Post'
    logger.info('Example task executada', { name })
    return { ok: true, message: `Olá, ${name}!` }
  },
})
