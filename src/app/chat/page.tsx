import { ChatClient } from './chat-client'

export default function ChatPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <div className="mb-6">
        <p className="text-sm uppercase tracking-wide text-violet-300">Companion Chat</p>
        <h1 className="mt-2 text-3xl font-bold">Live conversation workspace</h1>
        <p className="mt-2 text-slate-300">
          Sign in (when DB is enabled), pick a companion, and keep conversation history across sessions.
        </p>
      </div>
      <ChatClient />
    </main>
  )
}
