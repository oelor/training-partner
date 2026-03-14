'use client'

import { useState, useEffect, useCallback } from 'react'
import { Gift, Copy, CheckCircle, Users, Share2, Loader2, Sparkles } from 'lucide-react'
import api from '@/lib/api'
import { useAuth } from '@/lib/auth-context'
import { useToast } from '@/components/toast'
import ShareButton from '@/components/share-button'

export default function InvitePage() {
  const { user } = useAuth()
  const toast = useToast()
  const [invites, setInvites] = useState<{ code: string; max_uses: number; times_used: number; created_at: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)

  const fetchInvites = useCallback(async () => {
    try {
      const data = await api.getMyInviteCodes()
      setInvites(data.codes || [])
    } catch {
      // No codes yet, that's fine
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchInvites()
  }, [fetchInvites])

  const handleGenerate = async () => {
    setGenerating(true)
    try {
      const data = await api.generateInviteCode()
      setInvites(prev => [data.invite, ...prev])
      toast.success('Invite code generated!')
    } catch {
      toast.error('Failed to generate invite code. You may have reached the limit.')
    } finally {
      setGenerating(false)
    }
  }

  const copyCode = (code: string) => {
    const inviteUrl = `${window.location.origin}/auth/signup?invite=${code}`
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(code)
      toast.success('Invite link copied!')
      setTimeout(() => setCopied(null), 2000)
    })
  }

  const totalInvited = invites.reduce((sum, inv) => sum + inv.times_used, 0)

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8 animate-slide-up">
        <div className="w-16 h-16 bg-accent/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-accent animate-float" />
        </div>
        <h1 className="font-heading text-3xl text-white mb-2">ALPHA <span className="gradient-text">INVITES</span></h1>
        <p className="text-text-secondary text-sm max-w-md mx-auto">
          Training Partner is in alpha. Invite trusted training partners and help us
          build the best combat sports platform.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8 stagger-children">
        <div className="bg-surface border border-border rounded-xl p-4 text-center card-hover animate-pulse-glow">
          <div className="text-2xl font-heading text-white">{invites.length}</div>
          <div className="text-text-secondary text-xs mt-1">Codes Generated</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center card-hover">
          <div className="text-2xl font-heading text-accent">{totalInvited}</div>
          <div className="text-text-secondary text-xs mt-1">People Invited</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-4 text-center card-hover">
          <div className="text-2xl font-heading text-primary">{invites.filter(i => i.times_used < i.max_uses).length}</div>
          <div className="text-text-secondary text-xs mt-1">Active Codes</div>
        </div>
      </div>

      {/* Generate button */}
      <div className="bg-surface border border-border rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-white font-medium mb-1">Generate Invite Code</h2>
            <p className="text-text-secondary text-sm mb-4">
              Each code can be used up to 5 times. Share it with athletes you train with!
            </p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2 btn-glow"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Gift className="w-4 h-4" />
                  Generate New Code
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Invite codes list */}
      <div className="space-y-3">
        <h3 className="font-heading text-lg text-white">YOUR INVITE CODES</h3>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : invites.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-8 text-center">
            <Gift className="w-10 h-10 text-text-secondary mx-auto mb-3" />
            <p className="text-text-secondary text-sm">No invite codes yet. Generate one above!</p>
          </div>
        ) : (
          invites.map((invite) => {
            const isActive = invite.times_used < invite.max_uses
            return (
              <div
                key={invite.code}
                className={`bg-surface border rounded-xl p-4 flex items-center justify-between card-hover ${
                  isActive ? 'border-border' : 'border-border/50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-accent' : 'bg-text-secondary'}`} />
                  <div>
                    <code className="text-white font-mono text-sm">{invite.code}</code>
                    <div className="text-text-secondary text-xs mt-0.5">
                      {invite.times_used}/{invite.max_uses} used
                      {!isActive && ' • Exhausted'}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <ShareButton
                    title="Join Training Partner"
                    text={`Join me on Training Partner — the #1 app for combat sports athletes. Use my invite code: ${invite.code}`}
                    url={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/signup?invite=${invite.code}`}
                  />
                  <button
                    onClick={() => copyCode(invite.code)}
                    disabled={!isActive}
                    className="p-2 text-text-secondary hover:text-white transition-colors disabled:opacity-30"
                    aria-label="Copy invite link"
                  >
                    {copied === invite.code ? (
                      <CheckCircle className="w-4 h-4 text-accent" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* How it works */}
      <div className="mt-8 bg-background border border-border rounded-xl p-6">
        <h3 className="font-heading text-sm text-white mb-4">HOW ALPHA INVITES WORK</h3>
        <div className="space-y-3 text-text-secondary text-sm">
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-bold shrink-0">1</span>
            <span>Generate an invite code above</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-bold shrink-0">2</span>
            <span>Share the link with training partners you trust</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-bold shrink-0">3</span>
            <span>They sign up and start finding training partners immediately</span>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center text-primary text-xs font-bold shrink-0">4</span>
            <span>Their feedback (via the purple button) helps us improve</span>
          </div>
        </div>
      </div>
    </div>
  )
}
