import { useState } from 'react'
import { AlertCircle, ArrowLeftRight, CheckCircle2, Mail, Search, Send, User } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Dialog, DialogContent, DialogFooter } from '../components/ui/feedback'
import { Input, Label, Spinner, Textarea } from '../components/ui/form'
import { useToast } from '../components/ui/toast'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { useDb } from '../lib/useDb'
import { cn, usd } from '../lib/utils'

export default function Transfer() {
  const { user, setUser } = useAuth()
  const db = useDb()
  const toast = useToast()

  const [mode, setMode] = useState('email')
  const [identifier, setIdentifier] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [recipient, setRecipient] = useState(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [done, setDone] = useState(null)

  const findRecipient = () => {
    setError('')
    const raw = identifier.trim()
    if (!raw) {
      setError(mode === 'email' ? 'Enter the recipient email' : 'Enter the recipient user ID')
      return null
    }
    if (mode === 'email' && !/^\S+@\S+\.\S+$/.test(raw)) {
      setError('Enter a valid email address')
      return null
    }
    const match = db.users.find(
      (u) => (mode === 'email' ? u.email.toLowerCase() === raw.toLowerCase() : u.id === raw) && u.role !== 'admin',
    )
    if (!match) {
      setError('No user found with those details')
      return null
    }
    if (match.id === user.id) {
      setError('You cannot transfer funds to yourself')
      return null
    }
    setRecipient(match)
    return match
  }

  const start = () => {
    const value = parseFloat(amount)
    if (!value || value <= 0) return setError('Enter a valid amount')
    if (value > (user.balance || 0)) return setError('Insufficient balance')
    if (user.is_locked) return setError('Your account is locked. Please contact support.')
    const match = findRecipient()
    if (!match) return
    setConfirmOpen(true)
  }

  const confirm = async () => {
    setBusy(true)
    const value = parseFloat(amount)
    try {
      await api.entities.Transaction.create({
        user_id: user.id,
        user_email: user.email,
        type: 'transfer_out',
        amount: value,
        status: 'completed',
        description: `Transfer to ${recipient.email}${note ? ` - ${note}` : ''}`,
        reference_id: recipient.id,
      })
      await api.entities.Transaction.create({
        user_id: recipient.id,
        user_email: recipient.email,
        type: 'transfer_in',
        amount: value,
        status: 'completed',
        description: `Transfer from ${user.email}${note ? ` - ${note}` : ''}`,
        reference_id: user.id,
      })
      const updated = await api.auth.updateMe({ balance: Number(((user.balance || 0) - value).toFixed(2)) })
      setUser(updated)
      await api.entities.User.update(recipient.id, { balance: Number(((recipient.balance || 0) + value).toFixed(2)) })

      setDone({ recipient, value })
      setConfirmOpen(false)
      setIdentifier('')
      setAmount('')
      setNote('')
      setRecipient(null)
      toast.success('Transfer complete', `${usd(value)} sent to ${recipient.email}`)
    } catch {
      toast.error('Transfer failed', 'Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Transfer Funds</h1>
        <p className="text-slate-400 mt-1">Send funds to another user</p>
      </div>

      <Card className="bg-gradient-to-r from-cyan-500/20 to-emerald-500/10 border-cyan-500/30">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-cyan-500/30 flex items-center justify-center">
            <ArrowLeftRight className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Available Balance</p>
            <p className="text-3xl font-extrabold text-white">{usd(user.balance)}</p>
          </div>
        </CardContent>
      </Card>

      {done && (
        <Card className="border-emerald-500/40">
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="font-bold text-white">
              {usd(done.value)} sent to {done.recipient.email}
            </p>
            <p className="text-sm text-slate-400 mt-1">The recipient's balance has been credited immediately.</p>
            <Button variant="outline" className="mt-4" onClick={() => setDone(null)}>
              Make Another Transfer
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Send via</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid grid-cols-2 gap-3">
            {[
              { id: 'email', label: 'Email', icon: Mail },
              { id: 'id', label: 'User ID', icon: User },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  setMode(m.id)
                  setIdentifier('')
                  setError('')
                }}
                className={cn(
                  'h-11 rounded-xl border text-sm font-medium flex items-center justify-center gap-2 transition-colors',
                  mode === m.id
                    ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-400'
                    : 'border-slate-700 text-slate-300 hover:bg-slate-800',
                )}
              >
                <m.icon className="w-4 h-4" />
                {m.label}
              </button>
            ))}
          </div>

          <div>
            <Label htmlFor="recipient">{mode === 'email' ? 'Recipient Email' : 'Recipient User ID'}</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                id="recipient"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={mode === 'email' ? 'name@example.com' : 'usr_xxxxx'}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="text-xs text-slate-500">Demo recipients:</span>
              {db.users
                .filter((u) => u.id !== user.id && u.role !== 'admin')
                .slice(0, 3)
                .map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setIdentifier(mode === 'email' ? u.email : u.id)}
                    className="text-xs text-cyan-400 hover:underline"
                  >
                    {mode === 'email' ? u.email : u.id}
                  </button>
                ))}
            </div>
          </div>

          <div>
            <Label htmlFor="amount">Amount (USDT)</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
              <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="pl-8" />
            </div>
          </div>

          <div>
            <Label htmlFor="note">Note (Optional)</Label>
            <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} placeholder="What is this transfer for?" className="min-h-[80px]" />
          </div>

          {error && (
            <p className="text-sm text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}

          <Button className="w-full" size="lg" onClick={start}>
            <Send className="w-4 h-4" />
            Continue
          </Button>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent title="Confirm Transfer" description="Review the details before sending.">
          <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4 space-y-3 text-sm">
            <Row label="Recipient" value={recipient?.email} />
            <Row label="Recipient ID" value={recipient?.id} mono />
            <Row label="Amount" value={usd(parseFloat(amount) || 0)} valueClass="text-cyan-400" />
            <Row label="Transfer fee" value="$0.00" valueClass="text-emerald-400" />
            {note && <Row label="Note" value={note} />}
            <div className="flex justify-between border-t border-slate-700/60 pt-3">
              <span className="text-slate-400">New balance</span>
              <span className="font-bold text-white">{usd((user.balance || 0) - (parseFloat(amount) || 0))}</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirm} disabled={busy}>
              {busy && <Spinner className="h-4 w-4" />}
              Confirm Transfer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Row({ label, value, mono, valueClass = 'text-white' }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-400">{label}</span>
      <span className={cn('font-semibold truncate', mono && 'font-mono text-xs', valueClass)}>{value}</span>
    </div>
  )
}
