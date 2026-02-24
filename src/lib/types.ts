export interface CompanionProfile {
  id: string
  name: string
  archetype: string
  tone: 'warm' | 'playful' | 'grounded' | 'direct'
  boundaries: string[]
  bio: string
  visibility: 'private' | 'friends' | 'public'
  createdAt: string
}

export interface CompanionMessage {
  role: 'user' | 'assistant'
  content: string
}
