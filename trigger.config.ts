import { defineConfig } from '@trigger.dev/sdk'
import { prismaExtension } from '@trigger.dev/build/extensions/prisma'

/**
 * Configuração do Trigger.dev
 * @see https://trigger.dev/docs/config/config-file
 * @see docs/CONFIG-TRIGGER-DEV.md
 */
export default defineConfig({
  project: process.env.TRIGGER_PROJECT_REF!,
  dirs: ['./trigger'],
  maxDuration: 300,
  retries: {
    enabledInDev: true,
    default: {
      maxAttempts: 3,
      minTimeoutInMs: 1000,
      maxTimeoutInMs: 10000,
      factor: 2,
      randomize: true,
    },
  },
  build: {
    extensions: [
      prismaExtension({
        mode: 'legacy',
        schema: 'prisma/schema.prisma',
        migrate: false,
      }),
    ],
  },
})
