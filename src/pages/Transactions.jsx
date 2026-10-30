import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Receipt, Search, X } from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { EmptyState, Tabs, TabsList, TabsTrigger } from '../components/ui/feedback'
import { Spinner } from '../components/ui/form'
import { TransactionRow } from '../components/shared'
import { useAuth } from '../lib/auth'
import { useDb } from '../lib/useDb'
import { usd } from '../lib/utils'
import { TX_TYPES, isCredit } from '../lib/tx'

export default function Transactions() {
  const { user } = useAuth()
  const db = useDb()
  const [params, setParams] = useSearchParams()
  const [tab, setTab] = useState(params.get('type') || 'all')
  const q = params.get('q') || ''

  const mine = useMemo(
    () =>
      db.transactions
        .filter((t) => t.user_id === user.id)
        .sort((a, b) => (a.created_date < b.created_date ? 1 : -1)),
    [db.transactions, user.id],
  )

  const filtered = useMemo(() => {
    let rows = tab === 'all' ? mine : mine.filter((t) => t.type === tab)
    if (q.trim()) {
      const needle = q.trim().toLowerCase()
      rows = rows.filter(
        (t) =>
          String(t.description || '').toLowerCase().includes(needle) ||
          String(t.type).toLowerCase().includes(needle) ||
          String(t.status).toLowerCase().includes(needle),
      )
    }
    return rows
  }, [mine, tab, q])

  const credited = mine.filter((t) => isCredit(t.type) && t.status === 'completed').reduce((a, t) => a + t.amount, 0)
  const debited = mine.filter((t) => !isCredit(t.type) && t.status === 'completed').reduce((a, t) => a + t.amount, 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Transaction History</h1>
        <p className="text-slate-400 mt-1">View all your transactions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard label="Total in" value={usd(credited)} className="text-emerald-400" />
        <SummaryCard label="Total out" value={usd(debited)} className="text-rose-400" />
        <SummaryCard label="Transactions" value={String(mine.length)} className="text-white" />
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center gap-4">
        <Tabs
          value={tab}
          onValueChange={(v) => {
            setTab(v)
            const next = new URLSearchParams(params)
            next.set('type', v)
            setParams(next, { replace: true })
          }}
        >
          <TabsList className="bg-slate-800/50 flex-wrap h-auto p-1">
            {TX_TYPES.map((t) => (
              <TabsTrigger key={t.value} value={t.value}>
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {q && (
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Search className="w-4 h-4" />
            Filtering by <span className="text-white font-medium">“{q}”</span>
            <button
              onClick={() => {
                const next = new URLSearchParams(params)
                next.delete('q')
                setParams(next, { replace: true })
              }}
              className="text-slate-500 hover:text-white"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title="No transactions found"
              description={q || tab !== 'all' ? 'Try a different filter or search term.' : 'Fund your account to see activity here.'}
            />
          ) : (
            <div className="divide-y divide-slate-700/50">
              {filtered.map((tx) => (
                <TransactionRow key={tx.id} tx={tx} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {false && <Spinner />}
    </div>
  )
}

function SummaryCard({ label, value, className }) {
  return (
    <Card>
      <CardContent className="p-5">
        <p className="text-sm text-slate-400">{label}</p>
        <p className={`text-2xl font-bold mt-1 ${className}`}>{value}</p>
      </CardContent>
    </Card>
  )
}
