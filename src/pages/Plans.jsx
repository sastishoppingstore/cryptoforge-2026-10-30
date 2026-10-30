import { useState } from 'react'
import { AlertTriangle, Check, CheckCircle2, Layers, Sparkles, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge, Dialog, DialogCancel, DialogContent, DialogFooter, EmptyState } from '../components/ui/feedback'
import { Input, Label, Progress, Spinner } from '../components/ui/form'
import { useToast } from '../components/ui/toast'
import { api, maybePayReferralBonus } from '../lib/api'
import { useAuth } from '../lib/auth'
import { useDb } from '../lib/useDb'
import { usd, shortDate } from '../lib/utils'

const ACCENTS = {
  cyan: { gradient: 'from-cyan-500 to-blue-500', text: 'text-cyan-400', ring: 'border-cyan-500/30' },
  emerald: { gradient: 'from-emerald-500 to-teal-500', text: 'text-emerald-400', ring: 'border-emerald-500/30' },
  purple: { gradient: 'from-purple-500 to-pink-500', text: 'text-purple-400', ring: 'border-purple-500/30' },
  amber: { gradient: 'from-amber-500 to-orange-500', text: 'text-amber-400', ring: 'border-amber-500/30' },
}

export default function Plans() {
  const { user, setUser } = useAuth()
  const db = useDb()
  const toast = useToast()

  const plans = db.plans.filter((p) => p.is_active)
  const mine = db.investments.filter((i) => i.user_id === user.id)

  const [selected, setSelected] = useState(null)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(null)

  const open = (plan) => {
    setSelected(plan)
    setAmount(String(plan.minimum_investment || ''))
    setError('')
    setDone(null)
  }

  const invest = async () => {
    setError('')
    const value = parseFloat(amount)
    if (!value || value <= 0) return setError('Enter a valid amount')
    if (value < selected.minimum_investment) return setError(`Minimum investment is ${usd(selected.minimum_investment, 0)}`)
    if (selected.maximum_investment && value > selected.maximum_investment)
      return setError(`Maximum investment is ${usd(selected.maximum_investment, 0)}`)
    if (value > (user.balance || 0)) return setError('Insufficient balance. Please recharge your wallet to activate this plan.')

    setBusy(true)
    try {
      await api.entities.UserInvestment.create({
        user_id: user.id,
        user_email: user.email,
        plan_id: selected.id,
        plan_name: selected.name,
        amount: value,
        status: 'active',
        profit_earned: 0,
        start_date: new Date().toISOString().split('T')[0],
      })
      await api.entities.Transaction.create({
        user_id: user.id,
        user_email: user.email,
        type: 'investment',
        amount: value,
        status: 'completed',
        description: `Investment in ${selected.name}`,
      })
      const updated = await api.auth.updateMe({
        balance: Number(((user.balance || 0) - value).toFixed(2)),
        total_deposit: Number(((user.total_deposit || 0) + value).toFixed(2)),
      })
      setUser(updated)

      const bonus = await maybePayReferralBonus({ userId: user.id, amount: value })
      if (bonus) toast.success('Referral bonus paid', `Your referrer earned ${usd(bonus)} from this investment.`)

      setDone({ plan: selected, value })
      toast.success('Plan activated', `${selected.name} is now running with ${usd(value)}.`)
    } catch {
      setError('Failed to process investment. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Investment Plans</h1>
        <p className="text-slate-400 mt-1">Choose a plan that fits your investment goals</p>
      </div>

      {plans.length === 0 ? (
        <Card>
          <EmptyState icon={TrendingUp} title="No investment plans available at the moment." />
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan, i) => {
            const accent = ACCENTS[plan.accent] || ACCENTS.cyan
            return (
              <Card
                key={plan.id}
                className={`relative overflow-hidden animate-fade-in ${plan.name === 'Gold' ? 'ring-1 ring-purple-500/30' : ''}`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                {plan.name === 'Gold' && (
                  <span className="absolute top-4 right-4 text-[10px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/15 border border-purple-500/30 rounded-full px-2 py-0.5">
                    Popular
                  </span>
                )}
                <CardHeader>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${accent.gradient} flex items-center justify-center on-accent mb-4`}>
                    <Layers className="w-6 h-6" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <p className="text-sm text-slate-400 mt-1">{plan.description}</p>
                </CardHeader>
                <CardContent className="pt-4">
                  <p className={`text-3xl font-extrabold ${accent.text}`}>
                    {plan.profit_min}% - {plan.profit_max}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Estimated monthly profit range</p>

                  <div className="mt-5 space-y-2 text-sm">
                    <Row label="Minimum" value={usd(plan.minimum_investment, 0)} />
                    <Row label="Maximum" value={usd(plan.maximum_investment, 0)} />
                    <Row label="Profit Range" value={`${plan.profit_min}% - ${plan.profit_max}%`} valueClass="text-emerald-400" />
                    {plan.duration_days && <Row label="Duration" value={`${plan.duration_days} days`} />}
                  </div>

                  {plan.features?.length > 0 && (
                    <ul className="mt-5 space-y-2">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-slate-300">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  )}

                  <Button
                    className={`w-full mt-6 bg-gradient-to-r ${accent.gradient}`}
                    onClick={() => open(plan)}
                  >
                    <Sparkles className="w-4 h-4" />
                    Invest Now
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {mine.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Your Active Plans</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mine.map((inv) => {
              const plan = db.plans.find((p) => p.id === inv.plan_id)
              const target = inv.amount * (1 + (plan?.profit_max || 20) / 100)
              return (
                <div key={inv.id} className="rounded-xl bg-slate-800/40 border border-slate-700/50 p-4">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-white">{inv.plan_name}</p>
                    <Badge variant={inv.status === 'active' ? 'emerald' : 'default'}>{inv.status}</Badge>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    {usd(inv.amount)} • started {shortDate(inv.start_date)}
                  </p>
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                      <span>Profit earned</span>
                      <span className="text-emerald-400 font-semibold">{usd(inv.profit_earned)}</span>
                    </div>
                    <Progress value={Math.min(100, (inv.profit_earned / target) * 100)} />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 flex gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-300">
          <strong>Risk Disclaimer:</strong> Profits are not fixed. Earnings fluctuate based on real-time mining output and
          market conditions. Only invest what you can afford to lose.
        </p>
      </div>

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        {selected && (
          <DialogContent
            title={done ? 'Investment confirmed' : `Invest in ${selected.name}`}
            description={done ? undefined : `Available balance: ${usd(user.balance)}`}
          >
            {done ? (
              <div className="text-center py-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <p className="text-lg font-bold text-white">
                  {usd(done.value)} invested in {done.plan.name}
                </p>
                <p className="text-sm text-slate-400 mt-2">
                  Your plan is active. Profits are credited to your balance as they are distributed.
                </p>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setSelected(null)}>
                    Close
                  </Button>
                  <Button onClick={() => setSelected(null)}>View dashboard</Button>
                </DialogFooter>
              </div>
            ) : (
              <>
                <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-4 space-y-2 text-sm">
                  <Row label="Plan" value={selected.name} />
                  <Row label="Profit range" value={`${selected.profit_min}% - ${selected.profit_max}% / month`} valueClass="text-emerald-400" />
                  <Row label="Duration" value={`${selected.duration_days} days`} />
                  <Row label="Limits" value={`${usd(selected.minimum_investment, 0)} – ${usd(selected.maximum_investment, 0)}`} />
                </div>

                <div className="mt-5">
                  <Label htmlFor="invest-amount">Amount (USDT)</Label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">$</span>
                    <Input
                      id="invest-amount"
                      type="number"
                      min={selected.minimum_investment}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  <div className="flex gap-2 mt-3">
                    {[selected.minimum_investment, Math.round((selected.minimum_investment + selected.maximum_investment) / 2), selected.maximum_investment].map(
                      (v) => (
                        <button
                          key={v}
                          onClick={() => setAmount(String(v))}
                          className="flex-1 h-9 rounded-lg border border-slate-700 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                        >
                          {usd(v, 0)}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {error && (
                  <p className="mt-4 text-sm text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    {error}
                  </p>
                )}

                <DialogFooter>
                  <DialogCancel />
                  <Button onClick={invest} disabled={busy}>
                    {busy && <Spinner className="h-4 w-4" />}
                    Confirm investment
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}

function Row({ label, value, valueClass = 'text-white' }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-slate-700/30">
      <span className="text-slate-400">{label}</span>
      <span className={`font-bold ${valueClass}`}>{value}</span>
    </div>
  )
}
