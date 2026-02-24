const milestones = [
  {
    phase: 'MVP-1',
    goal: 'Companion creation and chat foundation',
    items: [
      'User auth + account settings',
      'Create companion profile (name, tone, boundaries)',
      'Text chat with persistent conversation history',
    ],
  },
  {
    phase: 'MVP-2',
    goal: 'Memory and personality consistency',
    items: [
      'Long-term memory store + retrieval layer',
      'Companion persona prompt composer',
      'User controls: edit, export, and delete memory',
    ],
  },
  {
    phase: 'MVP-3',
    goal: 'Voice and social layer',
    items: [
      'Realtime voice mode integration',
      'Public companion profile pages',
      'Controlled companion-to-companion interactions',
    ],
  },
]

export default function RoadmapPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl px-6 py-14">
        <h1 className="text-3xl font-bold">Companion Platform AI - Roadmap</h1>
        <p className="mt-3 text-slate-300">
          Initial build plan for the third long-term project.
        </p>

        <div className="mt-8 space-y-5">
          {milestones.map((milestone) => (
            <section key={milestone.phase} className="rounded-xl border border-slate-800 bg-slate-900 p-6">
              <p className="text-xs uppercase tracking-wide text-violet-300">{milestone.phase}</p>
              <h2 className="mt-2 text-xl font-semibold">{milestone.goal}</h2>
              <ul className="mt-3 list-disc space-y-2 pl-6 text-slate-300">
                {milestone.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </main>
  )
}
