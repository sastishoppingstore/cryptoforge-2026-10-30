import { useState } from 'react'
import { AlertCircle, CreditCard, Info, Wallet } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Dialog, DialogCancel, DialogContent, DialogFooter } from '../components/ui/feedback'
import { Input, Label, Spinner } from '../components/ui/form'
import { useToast } from '../components/ui/toast'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { uid, usd } from '../lib/utils'
import { mutate } from '../lib/db'

const QUICK = [100, 250, 500, 1000, 2500, 5000, 7500, 10000]
const MIN_DEPOSIT = 10
const METHODS = ['Bitcoin', 'Ethereum', 'USDT', 'BNB']

export default function Fund() {
  const { user, setUser } = useAuth()
  const toast = useToast()
  const [amount, setAmount] = useState('')
  const [method, setMethod] = useState('USDT')
  const [error, setError] = useState('')
  const [checkout, setCheckout] = useState(false)
  const [busy, setBusy] = useState(false)

  const start = () => {
    setError('')
    const value = parseFloat(amount)
    if (!value || value <= 0) return setError('Enter a valid amount')
    if (value < MIN_DEPOSIT) return setError(`Minimum deposit amount is $${MIN_DEPOSIT} USDT`)
    setCheckout(true)
  }

  const confirm = async () => {
    setBusy(true)
    const value = parseFloat(amount)
    try {
      await api.entities.Transaction.create({
        user_id: user.id,
        user_email: user.email,
        type: 'deposit',
        amount: value,
        status: 'completed',
        description: `Deposit via ${method}`,
      })
      const updated = await api.auth.updateMe({
        balance: Number(((user.balance || 0) + value).toFixed(2)),
        total_deposit: Number(((user.total_deposit || 0) + value).toFixed(2)),
      })
      setUser(updated)
      mutate((s) => ({
        ...s,
        notifications: [
          {
            id: uid('ntf'),
            user_id: user.id,
            title: 'Deposit confirmed',
            message: `${usd(value)} was added to your wallet via ${method}.`,
            type: 'system',
            is_read: false,
            created_date: new Date().toISOString(),
          },
          ...s.notifications,
        ],
      }))
      toast.success('Funds added', `${usd(value)} credited to your wallet.`)
      setCheckout(false)
      setAmount('')
    } catch {
      toast.error('Deposit failed', 'Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Fund Account</h1>
        <p className="text-slate-400 mt-1">Add funds to your investment wallet</p>
      </div>

      <Card className="bg-gradient-to-r from-cyan-500/20 to-emerald-500/10 border-cyan-500/30">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-cyan-500/30 flex items-center justify-center">
            <Wallet className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Current Balance</p>
            <p className="text-3xl font-extrabold text-white">{usd(user.balance)}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Enter Amount</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
            <Input
              type="number"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="pl-8 pr-16 text-lg font-semibold"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-500">USDT</span>
          </div>

          <p className="text-sm text-slate-400 mt-5 mb-2">Quick Select</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {QUICK.map((v) => (
              <button
                key={v}
                onClick={() => setAmount(String(v))}
                className="h-11 rounded-xl border border-slate-700 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                ${v.toLocaleString('en-US')}
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-slate-700/60 bg-slate-800/40 p-4 flex gap-3">
            <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400">
              Minimum deposit amount is <span className="font-semibold text-white">${MIN_DEPOSIT} USDT</span>. Funds will be
              available immediately after confirmation.
            </p>
          </div>

          {error && (
            <p className="mt-4 text-sm text-red-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          )}

          <Button className="w-full mt-5" size="lg" onClick={start}>
            <CreditCard className="w-4 h-4" />
            Continue to Payment
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Supported Payment Methods</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {METHODS.map((m) => (
            <button
              key={m}
              onClick={() => setMethod(m)}
              className={`h-11 px-5 rounded-xl border text-sm font-medium transition-colors ${
                method === m
                  ? 'border-cyan-500/50 bg-cyan-500/15 text-cyan-400'
                  : 'border-slate-700 text-slate-300 hover:bg-slate-800'
              }`}
            >
              {m}
            </button>
          ))}
        </CardContent>
      </Card>

      <Dialog open={checkout} onOpenChange={setCheckout}>
        <DialogContent
          title="Confirm deposit"
          description="This demo build has no payment processor connected, so the transfer is simulated."
        >
          <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Amount</span>
              <span className="font-bold text-white">{usd(parseFloat(amount) || 0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Method</span>
              <span className="font-semibold text-white">{method}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Network fee</span>
              <span className="font-semibold text-emerald-400">$0.00 (demo)</span>
            </div>
            <div className="flex justify-between border-t border-slate-700/60 pt-3">
              <span className="text-slate-400">Credited balance</span>
              <span className="font-bold text-cyan-400">{usd(parseFloat(amount) || 0)}</span>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
            <p className="text-xs text-amber-300">
              In production you would be redirected to a real payment gateway or shown a deposit address. No real crypto is
              moved in this clone.
            </p>
          </div>

          <DialogFooter>
            <DialogCancel />
            <Button onClick={confirm} disabled={busy}>
              {busy && <Spinner className="h-4 w-4" />}
              Simulate payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
