'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { MessageCircle, Send, ArrowLeft, Loader2, User } from 'lucide-react'
import api, { Conversation, Message } from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { Skeleton } from '@/components/skeleton'

function MessagesContent() {
  const searchParams = useSearchParams()
  const initialUser = searchParams.get('user')
  const { user } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeUserId, setActiveUserId] = useState<number | null>(initialUser ? parseInt(initialUser) : null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loadingConvos, setLoadingConvos] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const loadConversations = useCallback(async () => {
    try {
      const data = await api.getConversations()
      setConversations(data.conversations || [])
    } catch {
      // silent
    } finally {
      setLoadingConvos(false)
    }
  }, [])

  const loadMessages = useCallback(async (userId: number) => {
    setLoadingMessages(true)
    try {
      const data = await api.getMessages(userId)
      setMessages(data.messages || [])
    } catch {
      // silent
    } finally {
      setLoadingMessages(false)
    }
  }, [])

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  useEffect(() => {
    if (activeUserId) {
      loadMessages(activeUserId)
      setShowSidebar(false)

      // Poll for new messages every 5 seconds
      if (pollRef.current) clearInterval(pollRef.current)
      pollRef.current = setInterval(() => {
        loadMessages(activeUserId)
      }, 5000)
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [activeUserId, loadMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!newMessage.trim() || !activeUserId || sending) return
    setSending(true)
    try {
      const data = await api.sendMessage(activeUserId, newMessage.trim())
      setMessages(prev => [...prev, data.message])
      setNewMessage('')
      loadConversations()
    } catch {
      // silent
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const activeConvo = conversations.find(c => c.user_id === activeUserId)

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <div className="mb-4">
        <h1 className="font-heading text-3xl text-white">MESSAGES</h1>
      </div>

      <div className="flex-1 flex bg-surface border border-border rounded-xl overflow-hidden min-h-0">
        {/* Conversation List */}
        <div className={`w-full md:w-80 border-r border-border flex-shrink-0 flex flex-col ${!showSidebar && activeUserId ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b border-border">
            <h2 className="text-white font-medium">Conversations</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingConvos ? (
              <div className="p-4 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-text-secondary mx-auto mb-3" />
                <p className="text-text-secondary text-sm">No conversations yet</p>
                <p className="text-text-secondary text-xs mt-1">Start a conversation from a partner&apos;s profile</p>
              </div>
            ) : (
              conversations.map(convo => (
                <button
                  key={convo.user_id}
                  onClick={() => setActiveUserId(convo.user_id)}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-background transition-colors text-left ${
                    activeUserId === convo.user_id ? 'bg-background border-l-2 border-primary' : ''
                  }`}
                >
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold flex-shrink-0">
                    {convo.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-white font-medium text-sm truncate">{convo.name}</span>
                      {convo.unread_count > 0 && (
                        <span className="bg-primary text-white text-xs w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                          {convo.unread_count}
                        </span>
                      )}
                    </div>
                    <p className="text-text-secondary text-xs truncate">
                      {convo.is_mine ? 'You: ' : ''}{convo.last_message}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col min-w-0 ${showSidebar && !activeUserId ? 'hidden md:flex' : 'flex'}`}>
          {activeUserId ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border flex items-center gap-3">
                <button
                  onClick={() => { setShowSidebar(true); setActiveUserId(null) }}
                  className="md:hidden text-text-secondary hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-sm">
                  {activeConvo?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <span className="text-white font-medium">{activeConvo?.name || 'User'}</span>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingMessages ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-10 h-10 text-text-secondary mx-auto mb-2" />
                    <p className="text-text-secondary text-sm">No messages yet. Say hello!</p>
                  </div>
                ) : (
                  messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.is_mine ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                        msg.is_mine
                          ? 'bg-primary text-white rounded-br-sm'
                          : 'bg-background text-white rounded-bl-sm'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        <p className={`text-xs mt-1 ${msg.is_mine ? 'text-white/60' : 'text-text-secondary'}`}>
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 bg-background border border-border rounded-xl py-3 px-4 text-white placeholder-text-secondary focus:border-primary transition-colors resize-none"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!newMessage.trim() || sending}
                    className="w-11 h-11 bg-primary text-white rounded-xl flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
                  >
                    {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 text-text-secondary mx-auto mb-4" />
                <p className="text-white font-medium mb-1">Select a conversation</p>
                <p className="text-text-secondary text-sm">Choose a conversation from the sidebar to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    }>
      <MessagesContent />
    </Suspense>
  )
}
