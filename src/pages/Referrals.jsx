import { useState } from 'react'
import { Check, Copy, Gift, Link2, Share2, Users, UserCheck } from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/feedback'
import { useToast } from '../components/ui/toast'
import { StatCard } from '../components/shared'
import { useAuth } from '../lib/auth'
import { useDb } from '../lib/useDb'
import { usd, shortDate } from '../lib/utils'

export default function Referrals() {
  const { user } = useAuth()
  const db = useDb()
  const toast = useToast()
  const [copied, setCopied] = useState(false)

  const mine = db.referrals
    .filter((r) => r.referrer_id === user.id)
    .sort((a, b) => (a.created_date < b.created_date ? 1 : -1))

  const earnings = mine.reduce((a, r) => a + (r.bonus_earned || 0), 0)
  const active = mine.filter((r) => r.status === 'active').length
  const link = `${window.location.origin}/login?ref=${user.referral_code}`

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
    } catch {
      /* clipboard blocked — the link is visible in the field anyway */
    }
    setCopied(true)
    toast.success('Referral link copied')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Referral Program</h1>
        <p className="text-slate-400 mt-1">Invite friends and earn bonuses</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total Referrals" value={String(mine.length)} icon={Users} color="cyan" />
        <StatCard title="Total Earnings" value={usd(earnings)} icon={Gift} color="emerald" />
        <StatCard title="Active Referrals" value={String(active)} icon={UserCheck} color="purple" />
      </div>

      <Card>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-cyan-400" />
            <h2 className="font-bold text-white">Your Referral Link</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 min-w-0 rounded-xl bg-slate-800/60 border border-slate-700 px-4 py-3 text-sm text-cyan-400 font-mono truncate">
              {link}
            </div>
            <Button onClick={copy} className="shrink-0">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy Link'}
            </Button>
          </div>

          <div className="rounded-xl bg-slate-800/60 border border-slate-700 p-4">
            <p className="text-sm text-slate-400">Your Referral Code</p>
            <p className="text-2xl font-extrabold text-white font-mono mt-1">{user.referral_code}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() =>
                window.open(
                  `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    'I am mining crypto on CryptoMine. Join with my referral link:',
                  )}&url=${encodeURIComponent(link)}`,
                  '_blank',
                  'noopener',
                )
              }
            >
              <Share2 className="w-4 h-4" />
              Share on Twitter
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                window.open(
                  `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(
                    'Join CryptoMine and start mining.',
                  )}`,
                  '_blank',
                  'noopener',
                )
              }
            >
              <Share2 className="w-4 h-4" />
              Share on Telegram
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <div className="p-5 sm:p-6 pb-2">
            <h2 className="font-bold text-white">Your Referrals</h2>
          </div>
          {mine.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-lg text-slate-400">No referrals yet</p>
              <p className="text-sm text-slate-500 mt-2">Share your referral link to start earning bonuses!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-700/50">
              {mine.map((r) => (
                <div key={r.id} className="p-4 sm:p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full grad-btn on-accent flex items-center justify-center font-bold shrink-0">
                    {r.referred_email[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-white truncate">{r.referred_email}</p>
                    <p className="text-xs text-slate-500">Joined {shortDate(r.created_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-400">{usd(r.bonus_earned)}</p>
                    <div className="mt-1 flex justify-end">
                      <Badge variant={r.status === 'active' ? 'emerald' : 'amber'}>{r.status}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <h2 className="font-bold text-white mb-6">How Referrals Work</h2>
          <div className="grid gap-8 sm:grid-cols-3 text-center">
            {[
              ['Share Link', 'Share your unique referral link with friends'],
              ['Friend Signs Up', 'When they register using your link'],
              ['Earn Bonus', 'Get bonus when they make their first investment'],
            ].map(([title, body], i) => (
              <div key={title}>
                <div className="w-12 h-12 rounded-full grad-btn on-accent font-bold text-lg flex items-center justify-center mx-auto mb-4">
                  {i + 1}
                </div>
                <p className="font-semibold text-white">{title}</p>
                <p className="text-sm text-slate-400 mt-2">{body}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
