'use client'

import { FormEvent, useEffect, useState } from 'react'
import { CompanionProfile } from '@/lib/types'

const defaultBoundaries = ['No sexual roleplay', 'No manipulative behavior']

export default function CompanionsPage() {
  const [companions, setCompanions] = useState<CompanionProfile[]>([])
  const [name, setName] = useState('')
  const [archetype, setArchetype] = useState('Thoughtful encourager')
  const [tone, setTone] = useState<CompanionProfile['tone']>('warm')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadCompanions() {
    const response = await fetch('/api/companions')
    if (!response.ok) {
      throw new Error('Failed to load companions')
    }

    const payload = (await response.json()) as { companions: CompanionProfile[] }
    setCompanions(payload.companions ?? [])
  }

  useEffect(() => {
    async function bootstrap() {
      try {
        setLoading(true)
        await loadCompanions()
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Failed to load companions')
      } finally {
        setLoading(false)
      }
    }

    void bootstrap()
  }, [])

  async function handleCreateCompanion(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!name.trim()) {
      setError('Companion name is required')
      return
    }

    try {
      const response = await fetch('/api/companions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          archetype,
          tone,
          boundaries: defaultBoundaries,
          bio: `${name.trim()} is a supportive companion designed for consistent, healthy interaction.`,
          visibility: 'private',
        }),
      })

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string }
        throw new Error(payload.error ?? 'Failed to create companion')
      }

      const payload = (await response.json()) as { companion: CompanionProfile }
      setCompanions((current) => [payload.companion, ...current])
      setName('')
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : 'Failed to create companion')
    }
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-violet-300">Companion Directory</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Companion profiles</h1>
          <p className="mt-2 text-slate-300">
            Configure companion identity, tone, boundaries, and profile visibility.
          </p>
        </div>
      </div>

      <section className="mb-8 rounded-xl border border-slate-800 bg-slate-900 p-5">
        <h2 className="text-lg font-semibold">Create companion</h2>
        <form onSubmit={handleCreateCompanion} className="mt-4 grid gap-3 md:grid-cols-4">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Companion name"
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
          <input
            value={archetype}
            onChange={(event) => setArchetype(event.target.value)}
            placeholder="Archetype"
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
          <select
            value={tone}
            onChange={(event) => setTone(event.target.value as CompanionProfile['tone'])}
            className="rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          >
            <option value="warm">warm</option>
            <option value="playful">playful</option>
            <option value="grounded">grounded</option>
            <option value="direct">direct</option>
          </select>
          <button className="rounded-md bg-violet-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-violet-400">
            Save companion
          </button>
        </form>
        {error ? <p className="mt-3 text-sm text-rose-400">{error}</p> : null}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {loading ? (
          <p className="text-slate-400">Loading companions...</p>
        ) : companions.length === 0 ? (
          <p className="text-slate-400">
            No companions yet. Create one above{` `}
            {`(or sign into DB mode in /chat for persistent profiles).`}
          </p>
        ) : (
          companions.map((companion) => (
            <article
              key={companion.id}
              className="rounded-xl border border-slate-800 bg-slate-900 p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">{companion.name}</h2>
                <span className="rounded-full bg-violet-500/20 px-3 py-1 text-xs text-violet-300">
                  {companion.visibility}
                </span>
              </div>
              <p className="text-slate-300">{companion.bio}</p>
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <p>
                  <span className="text-slate-400">Archetype:</span> {companion.archetype}
                </p>
                <p>
                  <span className="text-slate-400">Tone:</span> {companion.tone}
                </p>
                <p>
                  <span className="text-slate-400">Boundaries:</span>{' '}
                  {companion.boundaries.join(' • ')}
                </p>
              </div>
            </article>
          ))
        )}
      </div>
    </main>
  )
}
