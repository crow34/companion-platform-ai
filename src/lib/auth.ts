import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { UserSession } from '@/lib/types'

export const SESSION_COOKIE = 'cp_user'

export function getSessionUserId(): string | null {
  const cookieStore = cookies()
  return cookieStore.get(SESSION_COOKIE)?.value ?? null
}

export async function getCurrentUser(): Promise<UserSession | null> {
  if (!process.env.DATABASE_URL) {
    return null
  }

  const userId = getSessionUserId()
  if (!userId) {
    return null
  }

  const user = await prisma.userAccount.findUnique({
    where: { id: userId },
    select: { id: true, email: true, displayName: true },
  })

  return user
}
