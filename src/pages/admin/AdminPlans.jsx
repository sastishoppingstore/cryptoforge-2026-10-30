import { useState } from 'react'
import { Check, Layers, Pencil, Plus, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge, Dialog, DialogCancel, DialogContent, DialogFooter } from '../../components/ui/feedback'
import { Input, Label, Switch, Textarea } from '../../components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { useToast } from '../../components/ui/toast'
import { api } from '../../lib/api'
import { useDb } from '../../lib/useDb'
import { usd } from '../../lib/utils'

const EMPTY = {
  name: '',
  description: '',
  minimum_investment: 100,
  maximum_investment: 1000,
  profit_min: 10,
  profit_max: 20,
  duration_days: 30,
  features: '',
  accent: 'cyan',
  is_active: true,
}

export default function AdminPlans() {
  const db = useDb()
  const toast = useToast()
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [busy, setBusy] = useState(false)

  const openNew = () => {
    setForm(EMPTY)
    setEditing('new')
  }

  const openEdit = (plan) => {
    setForm({ ...plan, features: (plan.features || []).join('\n') })
    setEditing(plan.id)
  }

  const save = async () => {
    if (!form.name.trim()) return toast.error('Plan name is required')
    if (Number(form.minimum_investment) > Number(form.maximum_investment))
      return toast.error('Minimum cannot exceed maximum')
    if (Number(form.profit_min) > Number(form.profit_max)) return toast.error('Profit min cannot exceed profit max')

    setBusy(true)
    const payload = {
      ...form,
      minimum_investment: Number(form.minimum_investment),
      maximum_investment: Number(form.maximum_investment),
      profit_min: Number(form.profit_min),
      profit_max: Number(form.profit_max),
      duration_days: Number(form.duration_days),
      features: String(form.features)
        .split('\n')
        .map((f) => f.trim())
        .filter(Boolean),
    }
    try {
      if (editing === 'new') {
        await api.entities.InvestmentPlan.create(payload)
        toast.success('Plan created', `${payload.name} is now available to investors.`)
      } else {
        await api.entities.InvestmentPlan.update(editing, payload)
        toast.success('Plan updated')
      }
      setEditing(null)
    } finally {
      setBusy(false)
    }
  }

  const toggle = async (plan) => {
    await api.entities.InvestmentPlan.update(plan.id, { is_active: !plan.is_active })
    toast.success(plan.is_active ? 'Plan hidden from investors' : 'Plan is now live')
  }

  const remove = async (plan) => {
    await api.entities.InvestmentPlan.delete(plan.id)
    toast.success('Plan deleted')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Manage Plans</h1>
          <p className="text-slate-400 mt-1">{db.plans.length} investment plans</p>
        </div>
        <Button onClick={openNew}>
          <Plus className="w-4 h-4" />
          New plan
        </Button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {db.plans.map((plan) => (
          <Card key={plan.id}>
            <CardHeader className="flex-row items-start justify-between flex pb-0 gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle className="text-base">{plan.name}</CardTitle>
                  <p className="text-xs text-slate-500 capitalize">{plan.accent} · {plan.duration_days} days</p>
                </div>
              </div>
              <Badge variant={plan.is_active ? 'emerald' : 'default'}>{plan.is_active ? 'live' : 'hidden'}</Badge>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-slate-400 min-h-[40px]">{plan.description}</p>
              <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
                <Info label="Profit" value={`${plan.profit_min}–${plan.profit_max}%`} accent="text-emerald-400" />
                <Info label="Duration" value={`${plan.duration_days} days`} />
                <Info label="Min" value={usd(plan.minimum_investment, 0)} />
                <Info label="Max" value={usd(plan.maximum_investment, 0)} />
              </div>
              {plan.features?.length > 0 && (
                <ul className="mt-4 space-y-1.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-slate-400">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-700/50">
                <div className="flex items-center gap-2">
                  <Switch checked={plan.is_active} onCheckedChange={() => toggle(plan)} aria-label="Toggle plan visibility" />
                  <span className="text-xs text-slate-400">{plan.is_active ? 'Live' : 'Hidden'}</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(plan)}>
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => remove(plan)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent title={editing === 'new' ? 'Create plan' : 'Edit plan'} description="Investors can activate any live plan.">
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="p-name">Name</Label>
                <Input id="p-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <Label>Accent colour</Label>
                <Select value={form.accent} onValueChange={(v) => setForm((f) => ({ ...f, accent: v }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['cyan', 'emerald', 'purple', 'amber'].map((a) => (
                      <SelectItem key={a} value={a} className="capitalize">
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="p-desc">Description</Label>
              <Textarea id="p-desc" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="min-h-[70px]" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                ['minimum_investment', 'Min investment'],
                ['maximum_investment', 'Max investment'],
                ['duration_days', 'Duration (days)'],
                ['profit_min', 'Profit min %'],
                ['profit_max', 'Profit max %'],
              ].map(([key, label]) => (
                <div key={key}>
                  <Label htmlFor={`p-${key}`}>{label}</Label>
                  <Input
                    id={`p-${key}`}
                    type="number"
                    value={form[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  />
                </div>
              ))}
            </div>

            <div>
              <Label htmlFor="p-features">Features (one per line)</Label>
              <Textarea
                id="p-features"
                value={form.features}
                onChange={(e) => setForm((f) => ({ ...f, features: e.target.value }))}
                className="min-h-[90px]"
                placeholder={'Daily profit updates\nInstant withdrawals'}
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch checked={form.is_active} onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))} id="p-active" />
              <Label htmlFor="p-active" className="mb-0">
                Visible to investors
              </Label>
            </div>
          </div>

          <DialogFooter>
            <DialogCancel />
            <Button onClick={save} disabled={busy}>
              {editing === 'new' ? 'Create plan' : 'Save changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Info({ label, value, accent = 'text-white' }) {
  return (
    <div className="rounded-xl bg-slate-800/50 border border-slate-700/50 p-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`font-bold mt-0.5 ${accent}`}>{value}</p>
    </div>
  )
}
