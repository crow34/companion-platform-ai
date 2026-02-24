export type CompanionTone = 'warm' | 'playful' | 'grounded' | 'direct'
export type CompanionVisibility = 'private' | 'friends' | 'public'

export interface CompanionProfile {
  id: string
  name: string
  archetype: string
  tone: CompanionTone
  boundaries: string[]
  bio: string
  visibility: CompanionVisibility
  createdAt: string
}

export interface CompanionMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}
