import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

interface Params {
  params: {
    conversationId: string
  }
}

export async function GET(_request: Request, { params }: Params) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: true,
        persistence: 'in-memory',
        messages: [],
      })
    }

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    }

    const conversation = await prisma.conversation.findFirst({
      where: {
        id: params.conversationId,
        userId: user.id,
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            role: true,
            content: true,
            createdAt: true,
          },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'conversation not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      persistence: 'postgres',
      conversationId: conversation.id,
      messages: conversation.messages.map((message) => ({
        id: message.id,
        role: message.role,
        content: message.content,
        createdAt: message.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'failed to fetch conversation messages',
        details: error instanceof Error ? error.message : 'unknown error',
      },
      { status: 500 }
    )
  }
}
