import { NextResponse } from 'next/server'
import { generateCompanionReply } from '@/lib/ai'
import { sampleCompanions } from '@/lib/mock-data'
import { prisma } from '@/lib/prisma'
import { CompanionMessage, CompanionProfile } from '@/lib/types'

interface ChatRequestBody {
  companionId?: string
  companionName?: string
  conversationId?: string
  messages?: CompanionMessage[]
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

    if (!body.messages?.length) {
      return NextResponse.json(
        { error: 'messages are required' },
        { status: 400 }
      )
    }

    const userMessage = [...body.messages]
      .reverse()
      .find((message) => message.role === 'user')

    let companion = fallbackCompanion(body)
    let conversationId = body.conversationId ?? null
    const persistence = process.env.DATABASE_URL ? 'postgres' : 'in-memory'

    if (process.env.DATABASE_URL) {
      let companionRecord = null

      if (body.companionId) {
        companionRecord = await prisma.companion.findUnique({
          where: { id: body.companionId },
        })
      }

      if (!companionRecord && body.companionName) {
        companionRecord = await prisma.companion.findFirst({
          where: { name: body.companionName },
        })
      }

      if (!companionRecord) {
        companionRecord = await prisma.companion.create({
          data: {
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
        const existingConversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
        })
        if (!existingConversation) {
          conversationId = null
        }
      }

      if (!conversationId) {
        const createdConversation = await prisma.conversation.create({
          data: {
            companionId: companion.id,
            title: `Chat with ${companion.name}`,
          },
        })
        conversationId = createdConversation.id
      }

      if (userMessage) {
        await prisma.message.create({
          data: {
            conversationId,
            role: 'user',
            content: userMessage.content,
          },
        })
      }
    }

    const reply = await generateCompanionReply({
      companion,
      messages: body.messages,
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
