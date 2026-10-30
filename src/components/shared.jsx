import { ArrowDownRight, ArrowUpRight, TrendingDown, TrendingUp } from 'lucide-react'
import { cn, usd, pct } from '../lib/utils'
import { isCredit, TX_META, STATUS_VARIANT } from '../lib/tx'
import { Badge } from './ui/feedback'
import { dateTime } from '../lib/utils'

export function CoinIcon({ symbol, color = 'from-cyan-400 to-emerald-400', className }) {
  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full bg-gradient-to-br on-accent font-bold shrink-0',
        color,
        className || 'w-10 h-10 text-sm',
      )}
      aria-hidden
    >
      {symbol.slice(0, 2)}
    </div>
  )
}

export function Delta({ value, className }) {
  const up = value >= 0
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <span className={cn('inline-flex items-center gap-1 font-medium', up ? 'text-emerald-400' : 'text-red-400', className)}>
      <Icon className="w-3.5 h-3.5" />
      {pct(value)}
    </span>
  )
}

export function PriceDelta({ value }) {
  const up = value >= 0
  const Icon = up ? ArrowUpRight : ArrowDownRight
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-xs font-semibold', up ? 'text-emerald-400' : 'text-red-400')}>
      <Icon className="w-3 h-3" />
      {Math.abs(value).toFixed(2)}%
    </span>
  )
}

export function StatusBadge({ status }) {
  return <Badge variant={STATUS_VARIANT[status] || 'default'}>{String(status).replace('_', ' ')}</Badge>
}

export function TransactionRow({ tx, className }) {
  const meta = TX_META[tx.type] || { label: tx.type, color: 'text-slate-400', sign: '' }
  const credit = isCredit(tx.type)
  return (
    <div className={cn('p-4 sm:p-5 flex items-center gap-4 hover:bg-slate-800/40 transition-colors', className)}>
      <div
        className={cn(
          'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
          credit ? 'bg-emerald-500/20' : 'bg-rose-500/20',
        )}
      >
        {credit ? <ArrowDownRight className="w-5 h-5 text-emerald-400" /> : <ArrowUpRight className="w-5 h-5 text-rose-400" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white truncate">{meta.label}</p>
        <p className="text-xs text-slate-400 truncate">{tx.description || '—'}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">{dateTime(tx.created_date)}</p>
      </div>
      <div className="text-right shrink-0">
        <p className={cn('font-bold', meta.color)}>
          {credit ? '+' : '−'}
          {usd(tx.amount)}
        </p>
        <div className="mt-1 flex justify-end">
          <StatusBadge status={tx.status} />
        </div>
      </div>
    </div>
  )
}

export function StatCard({ title, value, icon: Icon, color = 'cyan', delay = 0, className }) {
  const COLORS = {
    cyan: { bg: 'from-cyan-500/20 to-cyan-600/10', text: 'text-cyan-400', border: 'border-cyan-500/30' },
    emerald: { bg: 'from-emerald-500/20 to-emerald-600/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
    purple: { bg: 'from-purple-500/20 to-purple-600/10', text: 'text-purple-400', border: 'border-purple-500/30' },
    amber: { bg: 'from-amber-500/20 to-amber-600/10', text: 'text-amber-400', border: 'border-amber-500/30' },
    rose: { bg: 'from-rose-500/20 to-rose-600/10', text: 'text-rose-400', border: 'border-rose-500/30' },
    blue: { bg: 'from-blue-500/20 to-blue-600/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  }
  const c = COLORS[color] || COLORS.cyan
  return (
    <div
      className={cn('panel bg-gradient-to-br p-5 animate-fade-in', c.bg, c.border, className)}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={cn('w-11 h-11 rounded-xl bg-slate-900/60 flex items-center justify-center mb-4', c.text)}>
        {Icon && <Icon className="w-5 h-5" />}
      </div>
      <p className="text-sm text-slate-400">{title}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  )
}
