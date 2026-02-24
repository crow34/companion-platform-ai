import Link from 'next/link'

const pillars = [
  {
    title: 'Companion creation',
    description:
      'Users create companions with personality sliders, boundaries, and communication style.',
  },
  {
    title: 'Natural conversation',
    description:
      'Text first, voice-ready architecture for Gemini Live + ElevenLabs style integrations.',
  },
  {
    title: 'Long-term memory',
    description:
      'Companions remember user context safely, with export/delete controls.',
  },
  {
    title: 'Social companion layer',
    description:
      'Each companion has a profile page and controlled companion-to-companion interactions.',
  },
]

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-16">
      <section className="max-w-3xl">
        <p className="inline-flex rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-300">
          Project 3 - Companion Platform AI
        </p>
        <h1 className="mt-5 text-4xl font-bold leading-tight md:text-5xl">
          Human-like AI companions built for genuine connection.
        </h1>
        <p className="mt-5 text-lg text-slate-300">
          This project is the third roadmap build after PodPilot and TenderPulse. The focus is natural conversation, consistency over time, and social-safe interactions.
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <Link
            href="/chat"
            className="rounded-lg bg-violet-500 px-5 py-3 font-semibold text-slate-950 hover:bg-violet-400"
          >
            Open chat workspace
          </Link>
          <Link
            href="/companions"
            className="rounded-lg border border-slate-700 px-5 py-3 font-semibold text-slate-200 hover:border-slate-500"
          >
            Browse companion profiles
          </Link>
          <Link
            href="/roadmap"
            className="rounded-lg border border-slate-700 px-5 py-3 font-semibold text-slate-200 hover:border-slate-500"
          >
            View build roadmap
          </Link>
        </div>
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-2">
        {pillars.map((pillar) => (
          <article key={pillar.title} className="rounded-xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-semibold">{pillar.title}</h2>
            <p className="mt-2 text-slate-300">{pillar.description}</p>
          </article>
        ))}
      </section>

      <section className="mt-12 rounded-xl border border-slate-800 bg-slate-900 p-6">
        <h3 className="text-xl font-semibold">API readiness</h3>
        <ul className="mt-3 list-disc space-y-1 pl-6 text-slate-300">
          <li>
            <code>GET/POST /api/auth/session</code> for lightweight account sessions
          </li>
          <li>
            <code>GET/POST /api/companions</code> for user-scoped companion profiles
          </li>
          <li>
            <code>POST /api/chat</code> for Gemini-backed conversation replies
          </li>
          <li>
            <code>GET /api/conversations</code> and <code>GET /api/conversations/:id/messages</code>
            {' '}for history retrieval
          </li>
        </ul>
      </section>
    </main>
  )
}
