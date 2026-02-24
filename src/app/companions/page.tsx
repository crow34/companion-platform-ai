import { sampleCompanions } from '@/lib/mock-data'

export default function CompanionsPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-violet-300">Companion Directory</p>
          <h1 className="mt-2 text-3xl font-bold text-white">Prototype profiles</h1>
          <p className="mt-2 text-slate-300">
            Early examples for personality, boundaries, and visibility controls.
          </p>
        </div>
        <button className="rounded-lg bg-violet-500 px-4 py-2 font-semibold text-slate-950 hover:bg-violet-400">
          Create companion
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {sampleCompanions.map((companion) => (
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
        ))}
      </div>
    </main>
  )
}
