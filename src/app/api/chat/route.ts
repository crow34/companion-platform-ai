import { NextResponse } from 'next/server'
import { generateCompanionReply } from '@/lib/ai'
import { sampleCompanions } from '@/lib/mock-data'
import { prisma } from '@/lib/prisma'
import { CompanionMessage, CompanionProfile } from '@/lib/types'
import { getCurrentUser } from '@/lib/auth'

interface ChatRequestBody {
  companionId?: string
  companionName?: string
  conversationId?: string
  messages?: CompanionMessage[]
  message?: string
}

function fallbackCompanion(body: ChatRequestBody): CompanionProfile {
  const fromSample = sampleCompanions.find((companion) => {
    if (body.companionId) {
      return companion.id === body.companionId
    }
    if (body.companionName) {
      return companion.name.toLowerCase() === body.companionName.toLowerCase()
    }
    return false
  })

  return (
    fromSample ?? {
      id: body.companionId ?? 'companion-fallback',
      name: body.companionName ?? 'Your companion',
      archetype: 'Thoughtful encourager',
      tone: 'warm',
      boundaries: ['No sexual roleplay', 'No harmful content'],
      bio: 'A calm and supportive AI companion.',
      visibility: 'private',
      createdAt: new Date().toISOString(),
    }
  )
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ChatRequestBody
    const persistence = process.env.DATABASE_URL ? 'postgres' : 'in-memory'

    const appendedMessages = [...(body.messages ?? [])]
    if (body.message?.trim()) {
      appendedMessages.push({ role: 'user', content: body.message.trim() })
    }

    const userMessage = [...appendedMessages]
      .reverse()
      .find((message) => message.role === 'user')

    if (!userMessage?.content) {
      return NextResponse.json(
        { error: 'messages are required' },
        { status: 400 }
      )
    }

    let companion = fallbackCompanion(body)
    let conversationId = body.conversationId ?? null
    let contextMessages = appendedMessages

    if (process.env.DATABASE_URL) {
      const user = await getCurrentUser()
      if (!user) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
      }

      let companionRecord = null

      if (body.companionId) {
        companionRecord = await prisma.companion.findFirst({
          where: {
            id: body.companionId,
            userId: user.id,
          },
        })
      }

      if (!companionRecord && body.companionName) {
        companionRecord = await prisma.companion.findFirst({
          where: {
            name: body.companionName,
            userId: user.id,
          },
        })
      }

      if (!companionRecord) {
        companionRecord = await prisma.companion.create({
          data: {
            userId: user.id,
            name: companion.name,
            archetype: companion.archetype,
            tone: companion.tone,
            boundaries: companion.boundaries,
            bio: companion.bio,
            visibility: companion.visibility,
          },
        })
      }

      companion = {
        id: companionRecord.id,
        name: companionRecord.name,
        archetype: companionRecord.archetype,
        tone: companionRecord.tone as CompanionProfile['tone'],
        boundaries: Array.isArray(companionRecord.boundaries)
          ? (companionRecord.boundaries as string[])
          : companion.boundaries,
        bio: companionRecord.bio,
        visibility: companionRecord.visibility as CompanionProfile['visibility'],
        createdAt: companionRecord.createdAt.toISOString(),
      }

      if (conversationId) {
        const existingConversation = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            userId: user.id,
            companionId: companion.id,
          },
        })
        if (!existingConversation) {
          conversationId = null
        }
      }

      if (!conversationId) {
        const createdConversation = await prisma.conversation.create({
          data: {
            userId: user.id,
            companionId: companion.id,
            title: `Chat with ${companion.name}`,
          },
        })
        conversationId = createdConversation.id
      }

      await prisma.message.create({
        data: {
          conversationId,
          role: 'user',
          content: userMessage.content,
        },
      })

      const latestMessages = await prisma.message.findMany({
        where: { conversationId },
        orderBy: { createdAt: 'desc' },
        take: 12,
        select: {
          role: true,
          content: true,
        },
      })

      contextMessages = latestMessages
        .reverse()
        .map((message) => ({
          role: message.role as CompanionMessage['role'],
          content: message.content,
        }))
    }

    const reply = await generateCompanionReply({
      companion,
      messages: contextMessages,
    })

    if (process.env.DATABASE_URL && conversationId) {
      await prisma.message.create({
        data: {
          conversationId,
          role: 'assistant',
          content: reply.content,
        },
      })
    }

    return NextResponse.json({
      success: true,
      persistence,
      conversationId,
      companion,
      response: {
        role: 'assistant',
        content: reply.content,
      },
      model: reply.model,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'failed to generate response',
        details: error instanceof Error ? error.message : 'unknown error',
      },
      { status: 500 }
    )
  }
}
