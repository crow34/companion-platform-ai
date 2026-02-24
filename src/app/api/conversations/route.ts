import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: true,
        persistence: 'in-memory',
        conversations: [],
      })
    }

    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({
        success: true,
        persistence: 'postgres',
        conversations: [],
      })
    }

    const conversations = await prisma.conversation.findMany({
      where: { userId: user.id },
      include: {
        companion: {
          select: {
            id: true,
            name: true,
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: {
            content: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({
      success: true,
      persistence: 'postgres',
      conversations: conversations.map((conversation) => ({
        id: conversation.id,
        title: conversation.title ?? `Chat with ${conversation.companion.name}`,
        companionId: conversation.companion.id,
        companionName: conversation.companion.name,
        lastMessage: conversation.messages[0]?.content,
        updatedAt: conversation.updatedAt.toISOString(),
      })),
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'failed to fetch conversations',
        details: error instanceof Error ? error.message : 'unknown error',
      },
      { status: 500 }
    )
  }
}
