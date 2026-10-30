import { Link } from 'react-router-dom'
import { ArrowLeftRight, ArrowDownToLine, ArrowUpRight, PlusCircle, RefreshCw, TrendingUp, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { EmptyState } from '../components/ui/feedback'
import { CoinIcon, PriceDelta, StatCard, TransactionRow } from '../components/shared'
import { useAuth } from '../lib/auth'
import { useDb } from '../lib/useDb'
import { api } from '../lib/api'
import { usd } from '../lib/utils'
import { useToast } from '../components/ui/toast'

export default function Dashboard() {
  const { user } = useAuth()
  const db = useDb()
  const toast = useToast()

  const myTx = db.transactions
    .filter((t) => t.user_id === user.id)
    .sort((a, b) => (a.created_date < b.created_date ? 1 : -1))
  const activePlans = db.investments.filter((i) => i.user_id === user.id && i.status === 'active')
  const market = (db.market || []).slice(0, 5)

  const stats = [
    { title: 'Account Balance', value: usd(user.balance, 0), icon: Wallet, color: 'cyan' },
    { title: 'Total Deposit', value: usd(user.total_deposit, 0), icon: PlusCircle, color: 'emerald' },
    { title: 'Total Profit', value: usd(user.total_profit, 0), icon: TrendingUp, color: 'purple' },
    { title: 'Total Withdrawn', value: usd(user.total_withdrawn, 0), icon: ArrowDownToLine, color: 'amber' },
    { title: 'Referral Bonus', value: usd(user.total_referral_bonus, 0), icon: ArrowUpRight, color: 'rose' },
    { title: 'Active Plans', value: String(activePlans.length), icon: TrendingUp, color: 'blue' },
  ]

  const actions = [
    { name: 'Fund', to: '/Fund', icon: PlusCircle, color: 'from-cyan-500 to-blue-500' },
    { name: 'Transfer', to: '/Transfer', icon: ArrowLeftRight, color: 'from-emerald-500 to-teal-500' },
    { name: 'Withdraw', to: '/Withdraw', icon: ArrowDownToLine, color: 'from-purple-500 to-pink-500' },
  ]

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Welcome back, {user.full_name || user.email}!</h1>
          <p className="text-slate-400 mt-1">Here's your investment overview</p>
        </div>
        <Button asChild>
          <Link to="/Plans">
            <TrendingUp className="w-4 h-4" />
            View Investment Plans
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((s, i) => (
          <StatCard key={s.title} {...s} delay={i * 40} />
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {actions.map((a) => (
          <Link
            key={a.name}
            to={a.to}
            className={`rounded-2xl bg-gradient-to-r ${a.color} p-6 text-center on-accent font-bold shadow-lg hover:opacity-90 transition-opacity`}
          >
            <span className="flex flex-col items-center gap-3">
              <a.icon className="w-7 h-7" />
              {a.name}
            </span>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between flex pb-0">
            <CardTitle>Live Market</CardTitle>
            <button
              onClick={async () => {
                await api.market.refresh()
                toast.info('Prices refreshed', 'Simulated tick data — see Market for details.')
              }}
              className="text-slate-500 hover:text-white transition-colors"
              aria-label="Refresh prices"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </CardHeader>
          <CardContent className="pt-3 divide-y divide-slate-700/50">
            {market.map((c) => (
              <div key={c.symbol} className="flex items-center gap-4 py-3.5">
                <CoinIcon symbol={c.symbol} color={c.color} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white">{c.symbol}</p>
                  <p className="text-xs text-slate-400">{c.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-white">
                    ${c.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: c.price < 1 ? 4 : 2 })}
                  </p>
                  <PriceDelta value={c.change24h} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader className="flex-row items-center justify-between flex pb-0">
            <CardTitle>Recent Transactions</CardTitle>
            <Link to="/Transactions" className="text-sm text-cyan-400 hover:underline inline-flex items-center gap-1">
              View All
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            {myTx.length === 0 ? (
              <EmptyState
                icon={Wallet}
                title="No transactions yet"
                description="Fund your account to get started."
                action={
                  <Button asChild size="sm">
                    <Link to="/Fund">Fund Account</Link>
                  </Button>
                }
              />
            ) : (
              <div className="divide-y divide-slate-700/50">
                {myTx.slice(0, 5).map((tx) => (
                  <TransactionRow key={tx.id} tx={tx} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
