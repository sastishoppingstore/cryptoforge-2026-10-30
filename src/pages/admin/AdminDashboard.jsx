import { Link } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Activity, ArrowDownToLine, Bell, Coins, TrendingUp, Users } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge, Table, TableWrap, Td, Th } from '../../components/ui/feedback'
import { StatCard, StatusBadge } from '../../components/shared'
import { useToast } from '../../components/ui/toast'
import { api } from '../../lib/api'
import { useDb } from '../../lib/useDb'
import { usd, shortDate } from '../../lib/utils'

export default function AdminDashboard() {
  const db = useDb()
  const toast = useToast()

  const investors = db.users.filter((u) => u.role !== 'admin')
  const pending = db.transactions.filter((t) => t.type === 'withdrawal' && t.status === 'pending')
  const deposits = db.transactions.filter((t) => t.type === 'deposit' && t.status === 'completed')
  const totalVolume = deposits.reduce((a, t) => a + t.amount, 0)
  const aum = db.investments.filter((i) => i.status === 'active').reduce((a, i) => a + i.amount, 0)
  const profitsPaid = db.transactions.filter((t) => t.type === 'profit').reduce((a, t) => a + t.amount, 0)

  const chart = [...db.profitRuns]
    .sort((a, b) => (a.date > b.date ? 1 : -1))
    .map((r) => ({ date: shortDate(r.date).slice(0, 6), amount: r.amount }))

  const runProfits = async () => {
    const res = await api.admin.distributeProfits()
    toast.success('Profit distribution complete', `${usd(res.total)} credited across ${res.users} users (${res.rows} entries).`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 mt-1">Platform overview and operations</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={runProfits}>
            <Coins className="w-4 h-4" />
            Run profit distribution
          </Button>
          <Button asChild variant="outline">
            <Link to="/AdminNotifications">
              <Bell className="w-4 h-4" />
              Broadcast
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard title="Total Users" value={String(investors.length)} icon={Users} color="cyan" />
        <StatCard title="Total Deposits" value={usd(totalVolume, 0)} icon={TrendingUp} color="emerald" />
        <StatCard title="Active AUM" value={usd(aum, 0)} icon={Activity} color="purple" />
        <StatCard title="Profits Paid" value={usd(profitsPaid, 0)} icon={Coins} color="blue" />
        <StatCard title="Pending Payouts" value={String(pending.length)} icon={ArrowDownToLine} color="amber" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profit distributions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chart}>
                <defs>
                  <linearGradient id="adm" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--slate-700))" vertical={false} />
                <XAxis dataKey="date" stroke="rgb(var(--slate-500))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgb(var(--slate-500))" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: 'rgb(var(--slate-900))',
                    border: '1px solid rgb(var(--slate-700))',
                    borderRadius: 12,
                  }}
                  formatter={(v) => [usd(v), 'Distributed']}
                />
                <Area type="monotone" dataKey="amount" stroke="#10b981" strokeWidth={2} fill="url(#adm)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between flex pb-0">
            <CardTitle>Pending withdrawals</CardTitle>
            <Link to="/AdminWithdrawals" className="text-sm text-cyan-400 hover:underline">
              Review all
            </Link>
          </CardHeader>
          <CardContent className="p-0 pt-3">
            {pending.length === 0 ? (
              <p className="text-sm text-slate-500 px-6 py-8 text-center">No pending payouts</p>
            ) : (
              <TableWrap>
                <Table>
                  <thead className="border-y border-slate-700/50">
                    <tr>
                      <Th>User</Th>
                      <Th>Exchange</Th>
                      <Th className="text-right">Amount</Th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/40">
                    {pending.slice(0, 5).map((t) => (
                      <tr key={t.id}>
                        <Td className="truncate max-w-[190px]">{t.user_email}</Td>
                        <Td className="text-slate-400">{t.exchange_name}</Td>
                        <Td className="text-right font-bold text-amber-400">{usd(t.amount)}</Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </TableWrap>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between flex pb-0">
            <CardTitle>Newest users</CardTitle>
            <Link to="/AdminUsers" className="text-sm text-cyan-400 hover:underline">
              Manage all
            </Link>
          </CardHeader>
          <CardContent className="p-0 pt-3">
            <TableWrap>
              <Table>
                <thead className="border-y border-slate-700/50">
                  <tr>
                    <Th>User</Th>
                    <Th>Joined</Th>
                    <Th className="text-right">Balance</Th>
                    <Th className="text-right">Status</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/40">
                  {[...investors]
                    .sort((a, b) => (a.created_date < b.created_date ? 1 : -1))
                    .slice(0, 5)
                    .map((u) => (
                      <tr key={u.id}>
                        <Td>
                          <p className="font-medium text-white">{u.full_name}</p>
                          <p className="text-xs text-slate-500">{u.email}</p>
                        </Td>
                        <Td className="text-slate-400">{shortDate(u.created_date)}</Td>
                        <Td className="text-right font-semibold text-white">{usd(u.balance)}</Td>
                        <Td className="text-right">
                          <Badge variant={u.is_locked ? 'red' : 'emerald'}>{u.is_locked ? 'locked' : 'active'}</Badge>
                        </Td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            </TableWrap>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
