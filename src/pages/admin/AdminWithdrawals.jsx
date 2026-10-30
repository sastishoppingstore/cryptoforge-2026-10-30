import { useMemo, useState } from 'react'
import { CheckCircle2, Clock, Copy, XCircle } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Dialog, DialogCancel, DialogContent, DialogFooter, Table, TableWrap, Td, Th } from '../../components/ui/feedback'
import { Label, Textarea } from '../../components/ui/form'
import { useToast } from '../../components/ui/toast'
import { StatCard, StatusBadge } from '../../components/shared'
import { api } from '../../lib/api'
import { useDb } from '../../lib/useDb'
import { usd, dateTime } from '../../lib/utils'
import { cn } from '../../lib/utils'

const FILTERS = ['pending', 'completed', 'declined', 'all']

export default function AdminWithdrawals() {
  const db = useDb()
  const toast = useToast()
  const [filter, setFilter] = useState('pending')
  const [declining, setDeclining] = useState(null)
  const [reason, setReason] = useState('')

  const all = useMemo(
    () => db.transactions.filter((t) => t.type === 'withdrawal').sort((a, b) => (a.created_date < b.created_date ? 1 : -1)),
    [db.transactions],
  )
  const rows = filter === 'all' ? all : all.filter((t) => t.status === filter)

  const pendingAmount = all.filter((t) => t.status === 'pending').reduce((a, t) => a + t.amount, 0)
  const paidAmount = all.filter((t) => t.status === 'completed').reduce((a, t) => a + t.amount, 0)

  const approve = async (tx) => {
    try {
      await api.admin.approveWithdrawal(tx.id)
      toast.success('Payout approved', `${usd(tx.amount)} released to ${tx.user_email}`)
    } catch (e) {
      toast.error('Could not approve', e.message)
    }
  }

  const decline = async () => {
    await api.admin.declineWithdrawal(declining.id, reason || 'Rejected by compliance review')
    toast.success('Payout declined', `${declining.user_email} was notified.`)
    setDeclining(null)
    setReason('')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Withdrawals</h1>
        <p className="text-slate-400 mt-1">Review and process payout requests</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard title="Pending payouts" value={usd(pendingAmount)} icon={Clock} color="amber" />
        <StatCard title="Total paid out" value={usd(paidAmount)} icon={CheckCircle2} color="emerald" />
        <StatCard title="Requests" value={String(all.length)} icon={XCircle} color="cyan" />
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              'h-10 px-4 rounded-xl border text-sm font-medium capitalize transition-colors',
              filter === f ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-400' : 'border-slate-700 text-slate-300 hover:bg-slate-800',
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <TableWrap>
            <Table>
              <thead className="border-b border-slate-700/50">
                <tr>
                  <Th>User</Th>
                  <Th>Exchange / wallet</Th>
                  <Th className="text-right">Amount</Th>
                  <Th>Requested</Th>
                  <Th className="text-right">Status</Th>
                  <Th className="text-right">Actions</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {rows.length === 0 && (
                  <tr>
                    <Td className="text-center py-10 text-slate-500" colSpan={6}>
                      No {filter === 'all' ? '' : filter} withdrawals
                    </Td>
                  </tr>
                )}
                {rows.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    <Td>{tx.user_email}</Td>
                    <Td>
                      <p className="text-slate-300">{tx.exchange_name || '—'}</p>
                      <button
                        onClick={() => {
                          navigator.clipboard?.writeText(tx.exchange_id || '')
                          toast.success('Wallet address copied')
                        }}
                        className="text-xs text-slate-500 font-mono hover:text-cyan-400 inline-flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" />
                        {tx.exchange_id}
                      </button>
                    </Td>
                    <Td className="text-right font-bold text-amber-400">{usd(tx.amount)}</Td>
                    <Td className="text-slate-400">{dateTime(tx.created_date)}</Td>
                    <Td className="text-right">
                      <StatusBadge status={tx.status} />
                    </Td>
                    <Td className="text-right">
                      {tx.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="success" onClick={() => approve(tx)}>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Approve
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setDeclining(tx)}>
                            <XCircle className="w-3.5 h-3.5" />
                            Decline
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-500">
                          {tx.processed_date ? dateTime(tx.processed_date) : '—'}
                        </span>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        </CardContent>
      </Card>

      <Dialognote />

      <Dialog open={!!declining} onOpenChange={(v) => !v && setDeclining(null)}>
        {declining && (
          <DialogContent title="Decline withdrawal" description={`${declining.user_email} · ${usd(declining.amount)}`}>
            <div>
              <Label htmlFor="reason">Reason (sent to the user)</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Rejected by compliance review"
                className="min-h-[90px]"
              />
            </div>
            <DialogFooter>
              <DialogCancel />
              <Button variant="destructive" onClick={decline}>
                Decline payout
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}

function Dialognote() {
  return null
}
