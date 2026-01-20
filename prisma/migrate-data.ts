import { PrismaClient } from '@prisma/client'
import { separateCaptionAndHashtags } from '../src/lib/utils/caption-parser'

const prisma = new PrismaClient()

/**
 * Script para migrar dados existentes:
 * - Separa hashtags das legendas nos posts existentes
 * 
 * Execute com: npx tsx prisma/migrate-data.ts
 */
async function main() {
  console.log('🔄 Migrating existing posts data...')

  // Buscar todos os posts que ainda não têm hashtags separadas
  // (ou seja, posts onde hashtags está vazio mas caption pode ter hashtags)
  const posts = await prisma.post.findMany({
    where: {
      hashtags: '', // Hashtags vazias (campo tem default '', então nunca será null)
    },
  })

  console.log(`  Found ${posts.length} posts to migrate`)

  let migrated = 0
  let skipped = 0

  for (const post of posts) {
    // Verificar se a caption tem hashtags
    if (post.caption && post.caption.includes('#')) {
      try {
        const { caption, hashtags } = separateCaptionAndHashtags(post.caption)

        await prisma.post.update({
          where: { id: post.id },
          data: {
            caption,
            hashtags,
          },
        })

        migrated++
        console.log(`  ✓ Migrated post ${post.id}`)
      } catch (error) {
        console.error(`  ✗ Error migrating post ${post.id}:`, error)
      }
    } else {
      skipped++
    }
  }

  console.log(`\n✅ Migration complete!`)
  console.log(`   - Migrated: ${migrated} posts`)
  console.log(`   - Skipped: ${skipped} posts (no hashtags found)`)
}

main()
  .catch((e) => {
    console.error('❌ Error migrating data:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
