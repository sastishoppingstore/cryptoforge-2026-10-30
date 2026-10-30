import { useState } from 'react'
import { AlertCircle, ArrowDownToLine, Building2, CheckCircle2, Lock, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { EmptyState } from '../components/ui/feedback'
import { Input, Label, Spinner } from '../components/ui/form'
import { useToast } from '../components/ui/toast'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { useDb } from '../lib/useDb'
import { usd, dateTime } from '../lib/utils'
import { StatusBadge } from '../components/shared'

const EXCHANGES = ['Binance', 'Coinbase', 'Kraken', 'Bybit', 'OKX', 'Other']
const MIN_WITHDRAWAL = 10

export default function Withdraw() {
  const { user } = useAuth()
  const db = useDb()
  const toast = useToast()

  const [exchange, setExchange] = useState('')
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)

  const history = db.transactions
    .filter((t) => t.user_id === user.id && t.type === 'withdrawal')
    .sort((a, b) => (a.created_date < b.created_date ? 1 : -1))

  const submit = async () => {
    setError('')
    const value = parseFloat(amount)
    if (!exchange || !address || !amount) return setError('Please fill in all fields')
    if (value < MIN_WITHDRAWAL) return setError(`Minimum withdrawal amount is $${MIN_WITHDRAWAL}`)
    if (value > (user.balance || 0)) return setError('Insufficient balance')
    if (user.is_locked) return setError('Your account is locked. Please contact support.')

    setBusy(true)
    try {
      await api.entities.Transaction.create({
        user_id: user.id,
        user_email: user.email,
        type: 'withdrawal',
        amount: value,
        status: 'pending',
        description: `Withdrawal to ${exchange}`,
        exchange_name: exchange,
        exchange_id: address,
      })
      setDone(true)
      setExchange('')
      setAddress('')
      setAmount('')
      toast.success('Withdrawal requested', 'Your request is now pending admin review.')
    } catch {
      setError('Failed to submit withdrawal request')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Withdraw Funds</h1>
        <p className="text-slate-400 mt-1">Request a withdrawal to your exchange wallet</p>
      </div>

      <Card className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-500/30">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-purple-500/30 flex items-center justify-center">
            <ArrowDownToLine className="w-7 h-7 text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Available Balance</p>
            <p className="text-3xl font-extrabold text-white">{usd(user.balance)}</p>
          </div>
        </CardContent>
      </Card>

      {user.is_locked && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex gap-3">
          <Lock className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">
            Your account is locked, so withdrawals are disabled. Please contact support.
          </p>
        </div>
      )}

      {done && (
        <Card className="border-emerald-500/40">
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
            <p className="font-bold text-white">Withdrawal request submitted</p>
            <p className="text-sm text-slate-400 mt-1">
              Requests are reviewed by an admin. Check the history below for status updates.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Withdrawal Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div>
            <Label htmlFor="exchange">Exchange Name</Label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10" />
              <Input
                id="exchange"
                list="exchanges"
                value={exchange}
                onChange={(e) => setExchange(e.target.value)}
                placeholder="Binance, Coinbase, ..."
                className="pl-10"
              />
            </div>
            <datalist id="exchanges">
              {EXCHANGES.map((e) => (
                <option key={e} value={e} />
              ))}
            </datalist>
          </div>

          <div>
            <Label htmlFor="address">Exchange Wallet ID / Address</Label>
            <div className="relative">
              <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <Input
                id="address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="bc1q... or 0x..."
                className="pl-10 font-mono text-sm"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="withdraw-amount">Amount (USDT)</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
              <Input
                id="withdraw-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="pl-8"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Minimum withdrawal: <span className="text-slate-300 font-semibold">${MIN_WITHDRAWAL} USDT</span>
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}

          <Button className="w-full" size="lg" onClick={submit} disabled={busy || user.is_locked}>
            {busy && <Spinner className="h-4 w-4" />}
            Submit Withdrawal Request
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {history.length === 0 ? (
            <EmptyState icon={ArrowDownToLine} title="No withdrawal history" />
          ) : (
            <div className="divide-y divide-slate-700/50">
              {history.map((tx) => (
                <div key={tx.id} className="p-4 sm:p-5 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
                    <ArrowDownToLine className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white truncate">
                      {tx.exchange_name || 'Wallet'} withdrawal
                    </p>
                    <p className="text-xs text-slate-500 font-mono truncate">{tx.exchange_id}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{dateTime(tx.created_date)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-amber-400">−{usd(tx.amount)}</p>
                    <div className="mt-1 flex justify-end">
                      <StatusBadge status={tx.status} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
