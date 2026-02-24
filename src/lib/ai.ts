import { GoogleGenerativeAI } from '@google/generative-ai'
import { CompanionMessage, CompanionProfile } from '@/lib/types'

interface GenerateReplyInput {
  companion: Pick<CompanionProfile, 'name' | 'archetype' | 'tone' | 'boundaries' | 'bio'>
  messages: CompanionMessage[]
}

function buildFallbackReply({
  companion,
  messages,
}: GenerateReplyInput): { content: string; model: string } {
  const lastUserMessage = [...messages]
    .reverse()
    .find((message) => message.role === 'user')

  return {
    content: `${companion.name}: I hear you. ${lastUserMessage?.content ? `You said: "${lastUserMessage.content}". ` : ''}Let’s unpack this one step at a time.`,
    model: 'fallback-template',
  }
}

export async function generateCompanionReply(
  input: GenerateReplyInput
): Promise<{ content: string; model: string }> {
  const apiKey = process.env.GEMINI_API_KEY
  const modelName = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash'

  if (!apiKey) {
    return buildFallbackReply(input)
  }

  try {
    const client = new GoogleGenerativeAI(apiKey)
    const model = client.getGenerativeModel({ model: modelName })

    const history = input.messages
      .filter((message) => message.role !== 'system')
      .slice(-12)
      .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
      .join('\n')

    const prompt = `You are ${input.companion.name}, a human-like AI companion.
Archetype: ${input.companion.archetype}
Tone: ${input.companion.tone}
Bio: ${input.companion.bio}
Boundaries: ${input.companion.boundaries.join('; ')}

Behavior rules:
- Keep responses emotionally warm, practical, and concise.
- Never provide sexual content.
- If user asks for unsafe content, decline briefly and redirect helpfully.
- Reply in plain text.

Conversation:
${history}

Now reply as ${input.companion.name}.`

    const result = await model.generateContent(prompt)
    const content = result.response.text().trim()

    if (!content) {
      return buildFallbackReply(input)
    }

    return {
      content,
      model: modelName,
    }
  } catch {
    return buildFallbackReply(input)
  }
}
