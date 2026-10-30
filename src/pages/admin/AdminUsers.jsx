import { useMemo, useState } from 'react'
import { Ban, LockOpen, Search, SlidersHorizontal, Trash2, UserCog } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge, Dialog, DialogCancel, DialogContent, DialogFooter, Table, TableWrap, Td, Th } from '../../components/ui/feedback'
import { Avatar, Input, Label } from '../../components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { useToast } from '../../components/ui/toast'
import { api } from '../../lib/api'
import { useDb } from '../../lib/useDb'
import { usd, shortDate } from '../../lib/utils'

export default function AdminUsers() {
  const db = useDb()
  const toast = useToast()
  const [q, setQ] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [adjust, setAdjust] = useState({ amount: '', note: '' })

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase()
    return db.users
      .filter((u) => (roleFilter === 'all' ? true : u.role === roleFilter))
      .filter((u) => (statusFilter === 'all' ? true : statusFilter === 'locked' ? u.is_locked : !u.is_locked))
      .filter((u) => !needle || u.email.toLowerCase().includes(needle) || String(u.full_name).toLowerCase().includes(needle))
      .sort((a, b) => (a.created_date < b.created_date ? 1 : -1))
  }, [db.users, q, roleFilter, statusFilter])

  const current = selected ? db.users.find((u) => u.id === selected) : null

  const apply = async (patch) => {
    await api.entities.User.update(current.id, patch)
    toast.success('User updated')
  }

  const doAdjust = async (sign) => {
    const value = parseFloat(adjust.amount)
    if (!value || value <= 0) return toast.error('Enter a valid amount')
    await api.admin.adjustBalance(current.id, sign * value, adjust.note || 'Manual adjustment by admin')
    setAdjust({ amount: '', note: '' })
    toast.success(sign > 0 ? 'Balance credited' : 'Balance debited', `${usd(value)} ${sign > 0 ? 'added to' : 'removed from'} ${current.email}`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">User Management</h1>
        <p className="text-slate-400 mt-1">{rows.length} users</p>
      </div>

      <Card>
        <CardContent className="p-4 flex flex-col lg:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or email" className="pl-10" />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="lg:w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="user">Investor</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="lg:w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="locked">Locked</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <TableWrap>
            <Table>
              <thead className="border-b border-slate-700/50">
                <tr>
                  <Th>User</Th>
                  <Th>Role</Th>
                  <Th className="text-right">Balance</Th>
                  <Th className="text-right">Deposited</Th>
                  <Th className="text-right">Profit</Th>
                  <Th>Joined</Th>
                  <Th className="text-right">Status</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {rows.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <Td>
                      <div className="flex items-center gap-3">
                        <Avatar name={u.email} className="h-9 w-9" />
                        <div>
                          <p className="font-medium text-white">{u.full_name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td>
                      <Badge variant={u.role === 'admin' ? 'purple' : 'cyan'}>{u.role === 'admin' ? 'admin' : 'investor'}</Badge>
                    </Td>
                    <Td className="text-right font-semibold text-white">{usd(u.balance)}</Td>
                    <Td className="text-right text-slate-300">{usd(u.total_deposit)}</Td>
                    <Td className="text-right text-emerald-400">{usd(u.total_profit)}</Td>
                    <Td className="text-slate-400">{shortDate(u.created_date)}</Td>
                    <Td className="text-right">
                      <Badge variant={u.is_locked ? 'red' : 'emerald'}>{u.is_locked ? 'locked' : 'active'}</Badge>
                    </Td>
                    <Td className="text-right">
                      <Button size="sm" variant="outline" onClick={() => setSelected(u.id)}>
                        <UserCog className="w-3.5 h-3.5" />
                        Manage
                      </Button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        </CardContent>
      </Card>

      <Dialog open={!!current} onOpenChange={(v) => !v && setSelected(null)}>
        {current && (
          <DialogContent title={current.full_name} description={current.email}>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ['Balance', usd(current.balance)],
                ['Total deposited', usd(current.total_deposit)],
                ['Total profit', usd(current.total_profit)],
                ['Total withdrawn', usd(current.total_withdrawn)],
                ['Referral bonus', usd(current.total_referral_bonus)],
                ['Referral code', current.referral_code || '—'],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-3">
                  <p className="text-xs text-slate-400">{k}</p>
                  <p className="font-semibold text-white mt-1 truncate">{v}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-4">
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" size="sm" onClick={() => apply({ role: current.role === 'admin' ? 'user' : 'admin' })}>
                  <UserCog className="w-3.5 h-3.5" />
                  {current.role === 'admin' ? 'Revoke admin' : 'Make admin'}
                </Button>
                <Button
                  variant={current.is_locked ? 'success' : 'outline'}
                  size="sm"
                  onClick={() => apply({ is_locked: !current.is_locked })}
                >
                  {current.is_locked ? <LockOpen className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                  {current.is_locked ? 'Unlock account' : 'Lock account'}
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    await api.entities.User.delete(current.id)
                    setSelected(null)
                    toast.success('User deleted')
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </Button>
              </div>

              <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-4">
                <p className="text-sm font-semibold text-white flex items-center gap-2 mb-3">
                  <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
                  Adjust balance
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="adj-amount">Amount</Label>
                    <Input
                      id="adj-amount"
                      type="number"
                      value={adjust.amount}
                      onChange={(e) => setAdjust((a) => ({ ...a, amount: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="adj-note">Note</Label>
                    <Input
                      id="adj-note"
                      value={adjust.note}
                      onChange={(e) => setAdjust((a) => ({ ...a, note: e.target.value }))}
                      placeholder="Reason"
                    />
                  </div>
                </div>
                <div className="flex gap-3 mt-3">
                  <Button size="sm" variant="success" onClick={() => doAdjust(1)}>
                    Credit
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => doAdjust(-1)}>
                    Debit
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <DialogCancel>Close</DialogCancel>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
