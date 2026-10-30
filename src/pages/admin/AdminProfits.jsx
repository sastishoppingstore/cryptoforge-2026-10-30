import { useState } from 'react'
import { Coins, Play, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge, Table, TableWrap, Td, Th } from '../../components/ui/feedback'
import { Spinner } from '../../components/ui/form'
import { StatCard } from '../../components/shared'
import { useToast } from '../../components/ui/toast'
import { api } from '../../lib/api'
import { useDb } from '../../lib/useDb'
import { usd, shortDate, dateTime } from '../../lib/utils'

export default function AdminProfits() {
  const db = useDb()
  const toast = useToast()
  const [busy, setBusy] = useState(false)

  const active = db.investments.filter((i) => i.status === 'active')
  const aum = active.reduce((a, i) => a + i.amount, 0)
  const paid = db.transactions.filter((t) => t.type === 'profit').reduce((a, t) => a + t.amount, 0)
  const investors = new Set(active.map((i) => i.user_id)).size

  const run = async () => {
    setBusy(true)
    try {
      const res = await api.admin.distributeProfits()
      toast.success('Profits distributed', `${usd(res.total)} across ${res.users} investors.`)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Profit Distribution</h1>
          <p className="text-slate-400 mt-1">
            Credits each active plan with its monthly share of mining output
          </p>
        </div>
        <Button onClick={run} disabled={busy}>
          {busy ? <Spinner className="h-4 w-4" /> : <Play className="w-4 h-4" />}
          Run distribution
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Active capital" value={usd(aum, 0)} icon={Coins} color="cyan" />
        <StatCard title="Profits paid to date" value={usd(paid, 0)} icon={TrendingUp} color="emerald" />
        <StatCard title="Active plans" value={String(active.length)} icon={Coins} color="purple" />
        <StatCard title="Investors earning" value={String(investors)} icon={Users} color="blue" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active investments</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <TableWrap>
            <Table>
              <thead className="border-y border-slate-700/50">
                <tr>
                  <Th>Investor</Th>
                  <Th>Plan</Th>
                  <Th className="text-right">Capital</Th>
                  <Th className="text-right">Profit earned</Th>
                  <Th className="text-right">Effective yield</Th>
                  <Th>Started</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {active.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                    <Td>{inv.user_email}</Td>
                    <Td>
                      <Badge variant="cyan">{inv.plan_name}</Badge>
                    </Td>
                    <Td className="text-right font-semibold text-white">{usd(inv.amount)}</Td>
                    <Td className="text-right text-emerald-400 font-semibold">{usd(inv.profit_earned)}</Td>
                    <Td className="text-right text-slate-300">{((inv.profit_earned / inv.amount) * 100).toFixed(2)}%</Td>
                    <Td className="text-slate-400">{shortDate(inv.start_date)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distribution runs</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <TableWrap>
            <Table>
              <thead className="border-y border-slate-700/50">
                <tr>
                  <Th>Run date</Th>
                  <Th className="text-right">Amount distributed</Th>
                  <Th className="text-right">Investors</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {db.profitRuns.length === 0 && (
                  <tr>
                    <Td className="text-center py-8 text-slate-500" colSpan={3}>
                      No runs yet
                    </Td>
                  </tr>
                )}
                {[...db.profitRuns]
                  .sort((a, b) => (a.date < b.date ? 1 : -1))
                  .map((r) => (
                    <tr key={r.id}>
                      <Td>{dateTime(r.date)}</Td>
                      <Td className="text-right font-semibold text-emerald-400">{usd(r.amount)}</Td>
                      <Td className="text-right text-slate-300">{r.users}</Td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </TableWrap>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-4">
        <p className="text-xs text-slate-400">
          How it works: each active investment is credited{' '}
          <span className="text-slate-200 font-medium">capital × plan percentage × (30 ÷ duration)</span>, representing one
          month of that plan's quoted band. Every credit writes a <span className="text-slate-200">profit</span> transaction
          and a notification for the investor.
        </p>
      </div>
    </div>
  )
}
