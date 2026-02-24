import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { SESSION_COOKIE, getCurrentUser } from '@/lib/auth'

interface SessionRequestBody {
  email?: string
  displayName?: string
}

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json({
        success: true,
        persistence: 'in-memory',
        user: null,
      })
    }

    const user = await getCurrentUser()
    return NextResponse.json({
      success: true,
      persistence: 'postgres',
      user,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: 'failed to fetch session',
        details: error instanceof Error ? error.message : 'unknown error',
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    if (!process.env.DATABASE_URL) {
      return NextResponse.json(
        {
          error: 'session auth requires DATABASE_URL',
          persistence: 'in-memory',
        },
        { status: 400 }
      )
    }

    const body = (await request.json()) as SessionRequestBody

    if (!body.email) {
      return NextResponse.json({ error: 'email is required' }, { status: 400 })
    }

    const email = body.email.trim().toLowerCase()

    const user = await prisma.userAccount.upsert({
      where: { email },
      update: {
        displayName: body.displayName?.trim() || undefined,
      },
      create: {
        email,
        displayName: body.displayName?.trim() || null,
      },
      select: { id: true, email: true, displayName: true },
    })

    const response = NextResponse.json({
      success: true,
      persistence: 'postgres',
      user,
    })

    response.cookies.set(SESSION_COOKIE, user.id, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    return response
  } catch (error) {
    return NextResponse.json(
      {
        error: 'failed to create session',
        details: error instanceof Error ? error.message : 'unknown error',
      },
      { status: 500 }
    )
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true })
  response.cookies.delete(SESSION_COOKIE)
  return response
}
