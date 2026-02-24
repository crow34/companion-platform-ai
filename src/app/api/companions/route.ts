import { NextResponse } from 'next/server'
import { sampleCompanions } from '@/lib/mock-data'
import { CompanionProfile } from '@/lib/types'

export async function GET() {
  return NextResponse.json({
    success: true,
    total: sampleCompanions.length,
    companions: sampleCompanions,
  })
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CompanionProfile>

    if (!body.name || !body.archetype || !body.tone) {
      return NextResponse.json(
        { error: 'name, archetype, and tone are required' },
        { status: 400 }
      )
    }

    const companion: CompanionProfile = {
      id: `comp-${Date.now()}`,
      name: body.name,
      archetype: body.archetype,
      tone: body.tone,
      boundaries: body.boundaries ?? ['No harmful content'],
      bio: body.bio ?? 'Custom companion profile',
      visibility: body.visibility ?? 'private',
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      persistence: 'stub-memory',
      companion,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'failed to create companion',
        details: error instanceof Error ? error.message : 'unknown error',
      },
      { status: 500 }
    )
  }
}
