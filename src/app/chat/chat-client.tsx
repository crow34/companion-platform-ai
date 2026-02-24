'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import {
  CompanionMessage,
  CompanionProfile,
  ConversationSummary,
  UserSession,
} from '@/lib/types'

interface SessionResponse {
  success: boolean
  persistence: 'postgres' | 'in-memory'
  user: UserSession | null
}

export function ChatClient() {
  const [persistence, setPersistence] = useState<'postgres' | 'in-memory'>('in-memory')
  const [user, setUser] = useState<UserSession | null>(null)
  const [email, setEmail] = useState('')
  const [companions, setCompanions] = useState<CompanionProfile[]>([])
  const [conversations, setConversations] = useState<ConversationSummary[]>([])
  const [selectedCompanionId, setSelectedCompanionId] = useState<string | null>(null)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<CompanionMessage[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedCompanion = useMemo(
    () => companions.find((companion) => companion.id === selectedCompanionId) ?? null,
    [companions, selectedCompanionId]
  )

  async function fetchSession() {
    const response = await fetch('/api/auth/session', { method: 'GET' })
    if (!response.ok) {
      throw new Error('Failed to check session')
    }

    const payload = (await response.json()) as SessionResponse
    setPersistence(payload.persistence)
    setUser(payload.user)
  }

  async function fetchCompanions() {
    const response = await fetch('/api/companions', { method: 'GET' })
    if (!response.ok) {
      throw new Error('Failed to load companions')
    }

    const payload = (await response.json()) as {
      companions: CompanionProfile[]
    }
    setCompanions(payload.companions ?? [])

    if (!selectedCompanionId && payload.companions?.length) {
      setSelectedCompanionId(payload.companions[0].id)
    }
  }

  async function fetchConversations() {
    const response = await fetch('/api/conversations', { method: 'GET' })
    if (!response.ok) {
      throw new Error('Failed to load conversations')
    }

    const payload = (await response.json()) as {
      conversations: ConversationSummary[]
    }

    setConversations(payload.conversations ?? [])

    if (!selectedConversationId && payload.conversations?.length) {
      const first = payload.conversations[0]
      setSelectedConversationId(first.id)
      setSelectedCompanionId(first.companionId)
      await loadConversationMessages(first.id)
    }
  }

  async function loadConversationMessages(conversationId: string) {
    const response = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'GET',
    })

    if (!response.ok) {
      throw new Error('Failed to load messages')
    }

    const payload = (await response.json()) as {
      messages: Array<{ role: CompanionMessage['role']; content: string }>
    }

    setMessages(payload.messages ?? [])
  }

  useEffect(() => {
    async function bootstrap() {
      try {
        setLoading(true)
        await fetchSession()
        await fetchCompanions()
      } catch (bootstrapError) {
        setError(
          bootstrapError instanceof Error
            ? bootstrapError.message
            : 'Failed to initialize chat'
        )
      } finally {
        setLoading(false)
      }
    }

    void bootstrap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (persistence === 'postgres' && user) {
      void fetchConversations()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [persistence, user])

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!email.trim()) {
      setError('Please enter your email to continue')
      return
    }

    try {
      const response = await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string }
        throw new Error(payload.error ?? 'Failed to sign in')
      }

      const payload = (await response.json()) as { user: UserSession }
      setUser(payload.user)
      setEmail('')
      await fetchCompanions()
      await fetchConversations()
    } catch (signInError) {
      setError(signInError instanceof Error ? signInError.message : 'Failed to sign in')
    }
  }

  async function handleSignOut() {
    await fetch('/api/auth/session', { method: 'DELETE' })
    setUser(null)
    setConversations([])
    setSelectedConversationId(null)
    setMessages([])
  }

  async function handleSendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    if (!draft.trim()) {
      return
    }

    if (!selectedCompanionId && companions.length) {
      setSelectedCompanionId(companions[0].id)
    }

    const userMessage: CompanionMessage = { role: 'user', content: draft.trim() }
    const nextMessages = [...messages, userMessage]
    setMessages(nextMessages)
    setDraft('')
    setSending(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companionId: selectedCompanionId,
          conversationId: selectedConversationId,
          messages: nextMessages,
          message: userMessage.content,
        }),
      })

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string }
        throw new Error(payload.error ?? 'Failed to send message')
      }

      const payload = (await response.json()) as {
        conversationId?: string
        response: CompanionMessage
      }

      if (payload.conversationId) {
        setSelectedConversationId(payload.conversationId)
      }

      setMessages((current) => [...current, payload.response])

      if (persistence === 'postgres' && user) {
        await fetchConversations()
      }
    } catch (sendError) {
      setError(sendError instanceof Error ? sendError.message : 'Failed to send message')
      setMessages(messages)
      setDraft(userMessage.content)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
        Loading chat workspace...
      </section>
    )
  }

  return (
    <section className="grid gap-4 lg:grid-cols-[260px_260px_1fr]">
      <aside className="space-y-4 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-violet-300">Session</p>
          <p className="mt-1 text-sm text-slate-300">Mode: {persistence}</p>
          {persistence === 'postgres' ? (
            user ? (
              <div className="mt-2 space-y-2">
                <p className="text-sm text-slate-200">Signed in as {user.email}</p>
                <button
                  onClick={handleSignOut}
                  className="rounded-md border border-slate-700 px-3 py-1.5 text-sm text-slate-300 hover:border-slate-500"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <form onSubmit={handleSignIn} className="mt-2 space-y-2">
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                />
                <button
                  type="submit"
                  className="w-full rounded-md bg-violet-500 px-3 py-2 text-sm font-semibold text-slate-950 hover:bg-violet-400"
                >
                  Sign in
                </button>
              </form>
            )
          ) : (
            <p className="mt-2 text-sm text-slate-400">In-memory mode (no login required)</p>
          )}
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-violet-300">Companions</p>
          <div className="mt-2 space-y-2">
            {companions.map((companion) => (
              <button
                key={companion.id}
                onClick={() => {
                  setSelectedCompanionId(companion.id)
                  setSelectedConversationId(null)
                  setMessages([])
                }}
                className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                  selectedCompanionId === companion.id
                    ? 'border-violet-400 bg-violet-500/10 text-violet-200'
                    : 'border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <p className="font-semibold">{companion.name}</p>
                <p className="text-xs text-slate-400">{companion.archetype}</p>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <aside className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-xs uppercase tracking-wide text-violet-300">Conversation history</p>
        {conversations.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No saved conversations yet.</p>
        ) : (
          <div className="mt-2 space-y-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => {
                  setSelectedConversationId(conversation.id)
                  setSelectedCompanionId(conversation.companionId)
                  void loadConversationMessages(conversation.id)
                }}
                className={`w-full rounded-md border px-3 py-2 text-left text-sm ${
                  selectedConversationId === conversation.id
                    ? 'border-violet-400 bg-violet-500/10 text-violet-200'
                    : 'border-slate-700 text-slate-300 hover:border-slate-500'
                }`}
              >
                <p className="font-semibold">{conversation.companionName}</p>
                <p className="line-clamp-2 text-xs text-slate-400">
                  {conversation.lastMessage ?? conversation.title}
                </p>
              </button>
            ))}
          </div>
        )}
      </aside>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <p className="text-xs uppercase tracking-wide text-violet-300">Chat</p>
        <h2 className="mt-1 text-lg font-semibold">
          {selectedCompanion ? `Talking with ${selectedCompanion.name}` : 'Select a companion'}
        </h2>

        <div className="mt-4 h-[420px] overflow-y-auto rounded-lg border border-slate-800 bg-slate-950 p-3">
          {messages.length === 0 ? (
            <p className="text-sm text-slate-500">Start the conversation with a first message.</p>
          ) : (
            <div className="space-y-3">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={`rounded-lg p-3 text-sm ${
                    message.role === 'user'
                      ? 'ml-auto max-w-[85%] bg-violet-500/20 text-violet-100'
                      : 'mr-auto max-w-[85%] bg-slate-800 text-slate-100'
                  }`}
                >
                  {message.content}
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleSendMessage} className="mt-3 flex gap-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
          />
          <button
            type="submit"
            disabled={sending || !selectedCompanionId}
            className="rounded-md bg-violet-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-violet-400 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-300"
          >
            {sending ? 'Sending...' : 'Send'}
          </button>
        </form>

        {error ? <p className="mt-2 text-sm text-rose-400">{error}</p> : null}
      </section>
    </section>
  )
}
