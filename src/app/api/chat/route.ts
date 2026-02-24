import { NextResponse } from 'next/server'
import { CompanionMessage } from '@/lib/types'

interface ChatRequestBody {
  companionName?: string
  messages?: CompanionMessage[]
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

    const lastUserMessage = [...body.messages]
      .reverse()
      .find((message) => message.role === 'user')

    const companionName = body.companionName ?? 'Your companion'

    return NextResponse.json({
      success: true,
      response: {
        role: 'assistant',
        content: `${companionName}: I hear you. ${lastUserMessage?.content ? `You said: "${lastUserMessage.content}". ` : ''}I can help you unpack this step by step.`,
      },
      model: process.env.GEMINI_MODEL ?? 'stub-companion-model',
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
