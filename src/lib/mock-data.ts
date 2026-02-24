import { CompanionProfile } from '@/lib/types'

export const sampleCompanions: CompanionProfile[] = [
  {
    id: 'comp-001',
    name: 'Ari',
    archetype: 'Thoughtful encourager',
    tone: 'warm',
    boundaries: ['No sexual roleplay', 'No manipulative behavior'],
    bio: 'A calm, supportive companion who helps users process goals and emotions.',
    visibility: 'public',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'comp-002',
    name: 'Nova',
    archetype: 'Curious co-pilot',
    tone: 'playful',
    boundaries: ['No harassment', 'No self-harm reinforcement'],
    bio: 'A creative buddy for brainstorming, reflection, and daily check-ins.',
    visibility: 'friends',
    createdAt: new Date().toISOString(),
  },
]
