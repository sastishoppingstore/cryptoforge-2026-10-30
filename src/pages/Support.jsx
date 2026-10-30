import { useState } from 'react'
import { ArrowLeft, LifeBuoy, MessageSquare, Plus, Send } from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge, Dialog, DialogCancel, DialogContent, DialogFooter, EmptyState } from '../components/ui/feedback'
import { Input, Label, Spinner, Textarea } from '../components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { useToast } from '../components/ui/toast'
import { StatusBadge } from '../components/shared'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { useDb } from '../lib/useDb'
import { dateTime } from '../lib/utils'
import { PRIORITIES, PRIORITY_VARIANT } from '../lib/tx'

export default function Support() {
  const { user } = useAuth()
  const db = useDb()
  const toast = useToast()

  const myTickets = db.tickets
    .filter((t) => t.user_id === user.id)
    .sort((a, b) => (a.created_date < b.created_date ? 1 : -1))

  const [openId, setOpenId] = useState(null)
  const [creating, setCreating] = useState(false)
  const [busy, setBusy] = useState(false)
  const [reply, setReply] = useState('')
  const [form, setForm] = useState({ subject: '', priority: 'medium', message: '' })

  const active = myTickets.find((t) => t.id === openId)

  const create = async () => {
    if (!form.subject.trim() || !form.message.trim()) return toast.error('Missing details', 'Subject and message are required.')
    setBusy(true)
    try {
      const ticket = await api.entities.SupportTicket.create({
        user_id: user.id,
        user_email: user.email,
        user_name: user.full_name || user.email,
        subject: form.subject.trim(),
        priority: form.priority,
        status: 'open',
        messages: [
          {
            sender: user.full_name || user.email,
            sender_role: 'user',
            message: form.message.trim(),
            timestamp: new Date().toISOString(),
          },
        ],
      })
      setCreating(false)
      setForm({ subject: '', priority: 'medium', message: '' })
      setOpenId(ticket.id)
      toast.success('Ticket created', 'Our team will reply shortly.')
    } finally {
      setBusy(false)
    }
  }

  const sendReply = async () => {
    if (!reply.trim()) return
    await api.entities.SupportTicket.update(active.id, {
      status: 'open',
      messages: [
        ...active.messages,
        {
          sender: user.full_name || user.email,
          sender_role: 'user',
          message: reply.trim(),
          timestamp: new Date().toISOString(),
        },
      ],
    })
    setReply('')
    toast.success('Reply sent')
  }

  if (active) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <button onClick={() => setOpenId(null)} className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to tickets
        </button>

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-white">{active.subject}</h1>
            <StatusBadge status={active.status} />
            <Badge variant={PRIORITY_VARIANT[active.priority]}>{active.priority}</Badge>
          </div>
          <p className="text-slate-400 text-sm mt-1">Opened {dateTime(active.created_date)}</p>
        </div>

        <Card>
          <CardContent className="space-y-4">
            {active.messages.map((m, i) => (
              <div key={i} className={m.sender_role === 'admin' ? 'flex justify-start' : 'flex justify-end'}>
                <div
                  className={
                    m.sender_role === 'admin'
                      ? 'max-w-[85%] rounded-2xl rounded-tl-sm bg-slate-800 border border-slate-700 p-4'
                      : 'max-w-[85%] rounded-2xl rounded-tr-sm bg-cyan-500/15 border border-cyan-500/30 p-4'
                  }
                >
                  <p className="text-xs font-semibold text-slate-400 mb-1.5">
                    {m.sender} · {dateTime(m.timestamp)}
                  </p>
                  <p className="text-sm text-slate-200 whitespace-pre-wrap">{m.message}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3">
            <Label htmlFor="reply">Your reply</Label>
            <Textarea id="reply" value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Type your message..." className="min-h-[90px]" />
            <div className="flex justify-end">
              <Button onClick={sendReply}>
                <Send className="w-4 h-4" />
                Send reply
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Support</h1>
          <p className="text-slate-400 mt-1">Get help from our support team</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="w-4 h-4" />
          New Ticket
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="p-5 sm:p-6 pb-2">
            <h2 className="font-bold text-white">Your Tickets</h2>
          </div>
          {myTickets.length === 0 ? (
            <EmptyState
              icon={LifeBuoy}
              title="No support tickets"
              description="Create a ticket if you need help"
              action={<Button onClick={() => setCreating(true)}>New Ticket</Button>}
            />
          ) : (
            <div className="divide-y divide-slate-700/50">
              {myTickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setOpenId(t.id)}
                  className="w-full text-left p-4 sm:p-5 flex items-start gap-4 hover:bg-slate-800/40 transition-colors"
                >
                  <div className="w-11 h-11 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">{t.subject}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {t.messages.length} message{t.messages.length === 1 ? '' : 's'} · {dateTime(t.created_date)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <StatusBadge status={t.status} />
                    <Badge variant={PRIORITY_VARIANT[t.priority]}>{t.priority}</Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent title="Create a ticket" description="Describe the issue and we'll get back to you.">
          <div className="space-y-5">
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} placeholder="Short summary" />
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p[0].toUpperCase() + p.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} placeholder="Tell us what happened..." />
            </div>
          </div>
          <DialogFooter>
            <DialogCancel />
            <Button onClick={create} disabled={busy}>
              {busy && <Spinner className="h-4 w-4" />}
              Submit ticket
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
