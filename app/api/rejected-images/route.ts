import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { withAuth } from '@/middleware/api-auth'

/**
 * GET /api/rejected-images
 * Lista todas as imagens rejeitadas do usuário (requer autenticação)
 */
export const GET = withAuth(async (request: NextRequest, user) => {
  try {
    const url = new URL(request.url)
    const page = parseInt(url.searchParams.get('page') || '1', 10)
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20', 10), 50)
    const skip = (page - 1) * limit

    // Buscar imagens rejeitadas do usuário
    const [images, total] = await Promise.all([
      prisma.rejectedImage.findMany({
        where: { userId: user.id },
        orderBy: { rejectedAt: 'desc' },
        skip,
        take: limit,
        include: {
          post: {
            select: {
              id: true,
              status: true,
            },
          },
        },
      }),
      prisma.rejectedImage.count({
        where: { userId: user.id },
      }),
    ])

    return NextResponse.json({
      images: images.map((img) => ({
        id: img.id,
        imageUrl: img.imageUrl,
        caption: img.caption,
        hashtags: img.hashtags,
        rejectedAt: img.rejectedAt,
        createdAt: img.createdAt,
        originalPost: img.post
          ? {
              id: img.post.id,
              status: img.post.status,
            }
          : null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: skip + images.length < total,
      },
    })
  } catch (error) {
    logger.error('Failed to list rejected images', { userId: user.id, error: (error as Error).message })
    return NextResponse.json(
      { error: 'Failed to list rejected images', code: 'INTERNAL_ERROR' },
      { status: 500 }
    )
  }
})
