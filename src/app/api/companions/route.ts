import { NextResponse } from 'next/server'
import { sampleCompanions } from '@/lib/mock-data'
import { prisma } from '@/lib/prisma'
import { CompanionProfile, CompanionTone, CompanionVisibility } from '@/lib/types'

function toProfile(companion: {
  id: string
  name: string
  archetype: string
  tone: string
  boundaries: unknown
  bio: string
  visibility: string
  createdAt: Date
}): CompanionProfile {
  return {
    id: companion.id,
    name: companion.name,
    archetype: companion.archetype,
    tone: companion.tone as CompanionTone,
    boundaries: Array.isArray(companion.boundaries)
      ? (companion.boundaries as string[])
      : ['No harmful content'],
    bio: companion.bio,
    visibility: companion.visibility as CompanionVisibility,
    createdAt: companion.createdAt.toISOString(),
  }
}

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: true,
        persistence: 'in-memory',
        total: sampleCompanions.length,
        companions: sampleCompanions,
      })
    }

    const companions = await prisma.companion.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({
      success: true,
      persistence: 'postgres',
      total: companions.length,
      companions: companions.map(toProfile),
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'failed to fetch companions',
        details: error instanceof Error ? error.message : 'unknown error',
      },
      { status: 500 }
    )
  }
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

    if (!process.env.DATABASE_URL) {
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
        persistence: 'in-memory',
        companion,
      })
    }

    const created = await prisma.companion.create({
      data: {
        name: body.name,
        archetype: body.archetype,
        tone: body.tone,
        boundaries: body.boundaries ?? ['No harmful content'],
        bio: body.bio ?? 'Custom companion profile',
        visibility: body.visibility ?? 'private',
      },
    })

    return NextResponse.json({
      success: true,
      persistence: 'postgres',
      companion: toProfile(created),
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
