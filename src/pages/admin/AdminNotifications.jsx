import { useState } from 'react'
import { Bell, Send, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge, Table, TableWrap, Td, Th } from '../../components/ui/feedback'
import { Input, Label, Spinner, Textarea } from '../../components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { useToast } from '../../components/ui/toast'
import { StatCard } from '../../components/shared'
import { api } from '../../lib/api'
import { useDb } from '../../lib/useDb'
import { dateTime } from '../../lib/utils'

const TYPES = ['system', 'profit', 'withdrawal', 'referral']

export default function AdminNotifications() {
  const db = useDb()
  const toast = useToast()
  const [form, setForm] = useState({ title: '', message: '', audience: 'all', userId: '', type: 'system' })
  const [busy, setBusy] = useState(false)

  const investors = db.users.filter((u) => u.role !== 'admin')
  const recent = [...db.notifications].sort((a, b) => (a.created_date < b.created_date ? 1 : -1))
  const unread = db.notifications.filter((n) => !n.is_read).length

  const send = async () => {
    if (!form.title.trim() || !form.message.trim()) return toast.error('Missing details', 'Title and message are required.')
    if (form.audience === 'user' && !form.userId) return toast.error('Pick a recipient')
    setBusy(true)
    try {
      const count = await api.admin.broadcast({
        title: form.title.trim(),
        message: form.message.trim(),
        audience: form.audience,
        userId: form.userId || null,
        type: form.type,
      })
      toast.success('Notification sent', `Delivered to ${count} ${count === 1 ? 'user' : 'users'}.`)
      setForm((f) => ({ ...f, title: '', message: '' }))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Notifications</h1>
        <p className="text-slate-400 mt-1">Broadcast announcements to your investors</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Total sent" value={String(db.notifications.length)} icon={Bell} color="cyan" />
        <StatCard title="Unread" value={String(unread)} icon={Bell} color="amber" />
        <StatCard title="Recipients" value={String(investors.length)} icon={Users} color="emerald" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>New notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="n-title">Title</Label>
              <Input id="n-title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Scheduled maintenance" />
            </div>
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm((f) => ({ ...f, type: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="n-message">Message</Label>
            <Textarea
              id="n-message"
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
              placeholder="Tell investors what changed..."
              className="min-h-[100px]"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <Label>Audience</Label>
              <Select value={form.audience} onValueChange={(v) => setForm((f) => ({ ...f, audience: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All investors ({investors.length})</SelectItem>
                  <SelectItem value="user">A specific investor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.audience === 'user' && (
              <div>
                <Label>Recipient</Label>
                <Select value={form.userId} onValueChange={(v) => setForm((f) => ({ ...f, userId: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select investor" />
                  </SelectTrigger>
                  <SelectContent>
                    {investors.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <Button onClick={send} disabled={busy}>
              {busy ? <Spinner className="h-4 w-4" /> : <Send className="w-4 h-4" />}
              Send notification
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sent notifications</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <TableWrap>
            <Table>
              <thead className="border-y border-slate-700/50">
                <tr>
                  <Th>Recipient</Th>
                  <Th>Title</Th>
                  <Th>Message</Th>
                  <Th>Type</Th>
                  <Th className="text-right">Read</Th>
                  <Th>Sent</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {recent.slice(0, 25).map((n) => (
                  <tr key={n.id} className="hover:bg-slate-800/40 transition-colors">
                    <Td className="text-slate-400">{db.users.find((u) => u.id === n.user_id)?.email || n.user_id}</Td>
                    <Td className="font-medium text-white">{n.title}</Td>
                    <Td className="text-slate-400 max-w-[320px] truncate">{n.message}</Td>
                    <Td>
                      <Badge variant="cyan" className="capitalize">
                        {n.type}
                      </Badge>
                    </Td>
                    <Td className="text-right">
                      <Badge variant={n.is_read ? 'emerald' : 'amber'}>{n.is_read ? 'read' : 'unread'}</Badge>
                    </Td>
                    <Td className="text-slate-400">{dateTime(n.created_date)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        </CardContent>
      </Card>
    </div>
  )
}
