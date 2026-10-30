/**
 * Mock SDK. Deliberately mirrors the base44 client surface the original app calls:
 *
 *   We.auth.me() / login() / register() / verifyOtp() / logout() / updateMe()
 *   We.entities.Transaction.create({...})   We.entities.InvestmentPlan.filter({is_active:!0})
 *
 * Keeping the same call shape meant the page components could be ported almost 1:1
 * against this file instead of base44's cloud.
 */
import { getState, mutate, hashPassword, verifyPassword, resetDb } from './db'
import { COINS, driftCoins } from '../data/market'
import { uid, sleep } from './utils'

const LATENCY = 120
const DEMO_OTP_ECHO = true // surface the OTP in the UI because no mail server is attached

const byId = (arr, id) => arr.find((x) => x.id === id)

/* ------------------------------- query helpers ----------------------------- */

function applyQuery(rows, query, sort, limit) {
  let out = [...rows]
  if (query && typeof query === 'object') {
    out = out.filter((row) =>
      Object.entries(query).every(([k, v]) => {
        if (v && typeof v === 'object' && !Array.isArray(v)) {
          if ('$ne' in v) return row[k] !== v.$ne
          if ('$in' in v) return v.$in.includes(row[k])
          if ('$gte' in v) return row[k] >= v.$gte
          if ('$lte' in v) return row[k] <= v.$lte
          return true
        }
        return row[k] === v
      }),
    )
  }
  if (sort) {
    const desc = String(sort).startsWith('-')
    const key = desc ? String(sort).slice(1) : String(sort)
    out.sort((a, b) => {
      const av = a[key]
      const bv = b[key]
      if (av === bv) return 0
      return (av > bv ? 1 : -1) * (desc ? -1 : 1)
    })
  }
  if (limit) out = out.slice(0, limit)
  return out
}

function makeEntity(name, collection) {
  return {
    async list(sort = '-created_date', limit) {
      await sleep(LATENCY)
      return applyQuery(getState()[collection], null, sort, limit)
    },
    async filter(query = {}, sort = '-created_date', limit) {
      await sleep(LATENCY)
      return applyQuery(getState()[collection], query, sort, limit)
    },
    async get(id) {
      await sleep(LATENCY)
      return byId(getState()[collection], id) || null
    },
    async create(data) {
      await sleep(LATENCY)
      const row = { id: uid(name.toLowerCase().slice(0, 3)), created_date: new Date().toISOString(), ...data }
      mutate((s) => ({ ...s, [collection]: [row, ...s[collection]] }))
      return row
    },
    async update(id, patch) {
      await sleep(LATENCY)
      let updated = null
      mutate((s) => ({
        ...s,
        [collection]: s[collection].map((r) => {
          if (r.id !== id) return r
          updated = { ...r, ...patch, updated_date: new Date().toISOString() }
          return updated
        }),
      }))
      return updated
    },
    async delete(id) {
      await sleep(LATENCY)
      mutate((s) => ({ ...s, [collection]: s[collection].filter((r) => r.id !== id) }))
      return { id }
    },
  }
}

/* ---------------------------------- auth ----------------------------------- */

let currentUserId = null

function requireUser() {
  const s = getState()
  const u = s.session ? byId(s.users, s.session) : currentUserId ? byId(s.users, currentUserId) : null
  if (!u) throw new Error('not_authenticated')
  return u
}

function makeReferralCode(user) {
  const tail = (user.id || '').replace(/[^a-z0-9]/gi, '').slice(-6).toUpperCase()
  return `REF${tail || Math.random().toString(36).slice(2, 8).toUpperCase()}`
}

export const api = {
  /* ------------------------------ store plumbing --------------------------- */
  resetDemoData() {
    resetDb()
    currentUserId = null
  },
  subscribeDb: null, // re-exported by hooks
  getOtpEcho() {
    return DEMO_OTP_ECHO ? getState().pending_otp?.code || null : null
  },

  auth: {
    async me() {
      await sleep(LATENCY)
      const s = getState()
      const id = s.session || currentUserId
      const u = id ? byId(s.users, id) : null
      if (!u) throw new Error('not_authenticated')
      return u
    },

    async login(email, password) {
      await sleep(260)
      const s = getState()
      const u = s.users.find((x) => x.email.toLowerCase() === String(email).toLowerCase())
      if (!u) throw new Error('No account found for that email')
      if (!(await verifyPassword(password, u))) throw new Error('Incorrect password')
      if (u.is_locked) throw new Error('This account is locked. Please contact support.')
      mutate((st) => ({ ...st, session: u.id }))
      currentUserId = u.id
      return u
    },

    async register({ email, password, referred_by = null, full_name = null }) {
      await sleep(260)
      const s = getState()
      if (s.users.some((x) => x.email.toLowerCase() === String(email).toLowerCase()))
        throw new Error('An account with that email already exists')
      if (String(password).length < 8) throw new Error('Password must be at least 8 characters')

      const id = uid('usr')
      const user = {
        id,
        email,
        full_name: full_name || String(email).split('@')[0],
        role: 'user',
        balance: 0,
        total_deposit: 0,
        total_profit: 0,
        total_withdrawn: 0,
        total_referral_bonus: 0,
        referral_code: makeReferralCode({ id }),
        referred_by: referred_by || null,
        is_locked: false,
        password_hashes: await hashPassword(password),
        created_date: new Date().toISOString(),
      }
      const code = String(Math.floor(100000 + Math.random() * 900000))
      mutate((st) => ({
        ...st,
        users: [...st.users, user],
        pending_otp: { email, code, created_date: new Date().toISOString() },
      }))
      return { email, otp: DEMO_OTP_ECHO ? code : undefined }
    },

    async verifyOtp({ email, otp_code }) {
      await sleep(260)
      const s = getState()
      const pending = s.pending_otp
      if (!pending || pending.email.toLowerCase() !== String(email).toLowerCase())
        throw new Error('No pending verification for that email')
      if (String(pending.code) !== String(otp_code)) throw new Error('Invalid verification code')
      const u = s.users.find((x) => x.email.toLowerCase() === String(email).toLowerCase())
      if (!u) throw new Error('Account no longer exists')

      // Link the referrer once the account is verified.
      if (u.referred_by) {
        const referrer = s.users.find((x) => x.referral_code === u.referred_by)
        if (referrer) {
          mutate((st) => ({
            ...st,
            referrals: [
              {
                id: uid('ref'),
                referrer_id: referrer.id,
                referrer_email: referrer.email,
                referred_id: u.id,
                referred_email: u.email,
                status: 'pending',
                bonus_earned: 0,
                created_date: new Date().toISOString(),
              },
              ...st.referrals,
            ],
            notifications: [
              {
                id: uid('ntf'),
                user_id: referrer.id,
                title: 'New referral joined',
                message: `${u.email} signed up with your referral link.`,
                type: 'referral',
                is_read: false,
                created_date: new Date().toISOString(),
              },
              ...st.notifications,
            ],
          }))
        }
      }
      mutate((st) => ({
        ...st,
        pending_otp: null,
        session: u.id,
        notifications: [
          {
            id: uid('ntf'),
            user_id: u.id,
            title: 'Welcome to CryptoMine',
            message: 'Your account is verified. Fund your wallet to activate a plan.',
            type: 'system',
            is_read: false,
            created_date: new Date().toISOString(),
          },
          ...st.notifications,
        ],
      }))
      currentUserId = u.id
      return u
    },

    async resendOtp(email) {
      await sleep(200)
      const s = getState()
      const code = String(Math.floor(100000 + Math.random() * 900000))
      mutate((st) => ({ ...st, pending_otp: { email, code, created_date: new Date().toISOString() } }))
      if (!s.users.some((x) => x.email.toLowerCase() === String(email).toLowerCase()))
        throw new Error('No account found for that email')
      return { email, otp: DEMO_OTP_ECHO ? code : undefined }
    },

    async resetPasswordRequest(email) {
      await sleep(220)
      const s = getState()
      if (!s.users.some((x) => x.email.toLowerCase() === String(email).toLowerCase()))
        throw new Error('No account found for that email')
      const code = String(Math.floor(100000 + Math.random() * 900000))
      mutate((st) => ({ ...st, pending_otp: { email, code, created_date: new Date().toISOString(), reset: true } }))
      return { email, otp: DEMO_OTP_ECHO ? code : undefined }
    },

    async resetPassword({ email, otp_code, password }) {
      await sleep(240)
      const s = getState()
      const pending = s.pending_otp
      if (!pending || String(pending.code) !== String(otp_code)) throw new Error('Invalid reset code')
      if (String(password).length < 8) throw new Error('Password must be at least 8 characters')
      const u = s.users.find((x) => x.email.toLowerCase() === String(email).toLowerCase())
      if (!u) throw new Error('No account found for that email')
      const hashes = await hashPassword(password)
      mutate((st) => ({
        ...st,
        pending_otp: null,
        users: st.users.map((x) => (x.id === u.id ? { ...x, password_hashes: hashes } : x)),
      }))
      return true
    },

    async updateMe(patch) {
      await sleep(LATENCY)
      const me = requireUser()
      mutate((st) => ({
        ...st,
        users: st.users.map((u) => (u.id === me.id ? { ...u, ...patch, updated_date: new Date().toISOString() } : u)),
      }))
      return byId(getState().users, me.id)
    },

    async logout() {
      await sleep(120)
      currentUserId = null
      mutate((st) => ({ ...st, session: null }))
    },

    redirectToLogin() {
      window.location.assign('/login')
    },
  },

  /* -------------------------------- entities ------------------------------- */
  entities: {
    User: makeEntity('User', 'users'),
    InvestmentPlan: makeEntity('InvestmentPlan', 'plans'),
    UserInvestment: makeEntity('UserInvestment', 'investments'),
    Transaction: makeEntity('Transaction', 'transactions'),
    Referral: makeEntity('Referral', 'referrals'),
    Notification: makeEntity('Notification', 'notifications'),
    SupportTicket: makeEntity('SupportTicket', 'tickets'),
  },

  /* --------------------------- market + wallet utils ----------------------- */
  market: {
    async list() {
      await sleep(LATENCY)
      return getState().market
    },
    async refresh() {
      await sleep(200)
      let next = []
      mutate((s) => {
        next = driftCoins(s.market)
        return { ...s, market: next }
      })
      return next
    },
    reset() {
      mutate((s) => ({ ...s, market: COINS }))
    },
  },

  /*
   * Domain operations that in the real app live in the admin panel / scheduled
   * jobs (profit engine, payout approvals, wallet adjustments).
   */
  admin: {
    async adjustBalance(userId, amount, note = 'Manual adjustment') {
      await sleep(160)
      const delta = Number(amount)
      mutate((s) => ({
        ...s,
        users: s.users.map((u) =>
          u.id === userId
            ? {
                ...u,
                balance: Number((u.balance + delta).toFixed(2)),
                total_deposit: delta > 0 ? Number((u.total_deposit + delta).toFixed(2)) : u.total_deposit,
              }
            : u,
        ),
        transactions: [
          {
            id: uid('tx'),
            created_date: new Date().toISOString(),
            user_id: userId,
            user_email: byId(s.users, userId)?.email,
            type: delta > 0 ? 'deposit' : 'withdrawal',
            amount: Math.abs(delta),
            status: 'completed',
            description: note,
          },
          ...s.transactions,
        ],
        notifications: [
          {
            id: uid('ntf'),
            user_id: userId,
            title: delta > 0 ? 'Balance credited' : 'Balance debited',
            message: `${delta > 0 ? '+' : '-'}$${Math.abs(delta).toFixed(2)} — ${note}`,
            type: 'system',
            is_read: false,
            created_date: new Date().toISOString(),
          },
          ...s.notifications,
        ],
      }))
    },

    async setLocked(userId, locked) {
      await sleep(140)
      mutate((s) => ({ ...s, users: s.users.map((u) => (u.id === userId ? { ...u, is_locked: locked } : u)) }))
    },

    async setRole(userId, role) {
      await sleep(140)
      mutate((s) => ({ ...s, users: s.users.map((u) => (u.id === userId ? { ...u, role } : u)) }))
    },

    /** Approve a pending withdrawal: debit the user and mark the tx completed. */
    async approveWithdrawal(txId) {
      await sleep(200)
      const s = getState()
      const tx = byId(s.transactions, txId)
      if (!tx) throw new Error('Transaction not found')
      const user = byId(s.users, tx.user_id)
      if (user && user.balance < tx.amount) throw new Error('User has insufficient balance for this payout')
      mutate((st) => ({
        ...st,
        transactions: st.transactions.map((t) =>
          t.id === txId ? { ...t, status: 'completed', processed_date: new Date().toISOString() } : t,
        ),
        users: st.users.map((u) =>
          u.id === tx.user_id
            ? { ...u, balance: Number((u.balance - tx.amount).toFixed(2)), total_withdrawn: Number((u.total_withdrawn + tx.amount).toFixed(2)) }
            : u,
        ),
        notifications: [
          {
            id: uid('ntf'),
            user_id: tx.user_id,
            title: 'Withdrawal approved',
            message: `Your $${tx.amount.toFixed(2)} withdrawal to ${tx.exchange_name || 'your wallet'} has been processed.`,
            type: 'withdrawal',
            is_read: false,
            created_date: new Date().toISOString(),
          },
          ...st.notifications,
        ],
      }))
    },

    async declineWithdrawal(txId, reason = 'Rejected by compliance review') {
      await sleep(200)
      const tx = byId(getState().transactions, txId)
      mutate((st) => ({
        ...st,
        transactions: st.transactions.map((t) =>
          t.id === txId ? { ...t, status: 'declined', decline_reason: reason, processed_date: new Date().toISOString() } : t,
        ),
        notifications: [
          {
            id: uid('ntf'),
            user_id: tx.user_id,
            title: 'Withdrawal declined',
            message: `Your $${tx.amount.toFixed(2)} withdrawal was declined. ${reason}`,
            type: 'withdrawal',
            is_read: false,
            created_date: new Date().toISOString(),
          },
          ...st.notifications,
        ],
      }))
    },

    /**
     * Profit engine. Plans quote a monthly percentage band, so a single run credits
     * amount x pct/100 x (30 / duration_days) to every active investment.
     */
    async distributeProfits() {
      await sleep(400)
      const s = getState()
      const active = s.investments.filter((i) => i.status === 'active')
      let total = 0
      const affected = new Set()
      const txRows = []
      const notifRows = []

      const investmentPatch = {}
      active.forEach((inv) => {
        const plan = byId(s.plans, inv.plan_id)
        const min = plan?.profit_min ?? 10
        const max = plan?.profit_max ?? 20
        const rate = (min + Math.random() * (max - min)) / 100
        const monthly = rate * (30 / (plan?.duration_days || 30))
        const profit = Number((inv.amount * monthly).toFixed(2))
        if (profit <= 0) return
        total += profit
        affected.add(inv.user_id)
        investmentPatch[inv.id] = Number((inv.profit_earned + profit).toFixed(2))
        txRows.push({
          id: uid('tx'),
          created_date: new Date().toISOString(),
          user_id: inv.user_id,
          user_email: inv.user_email,
          type: 'profit',
          amount: profit,
          status: 'completed',
          description: `Mining profit — ${inv.plan_name}`,
        })
        notifRows.push({
          id: uid('ntf'),
          user_id: inv.user_id,
          title: 'Profit distributed',
          message: `$${profit.toFixed(2)} was credited to your ${inv.plan_name} plan.`,
          type: 'profit',
          is_read: false,
          created_date: new Date().toISOString(),
        })
      })

      mutate((st) => ({
        ...st,
        investments: st.investments.map((i) =>
          investmentPatch[i.id] != null ? { ...i, profit_earned: investmentPatch[i.id] } : i,
        ),
        transactions: [...txRows, ...st.transactions],
        notifications: [...notifRows, ...st.notifications],
        users: st.users.map((u) => {
          const gain = txRows.filter((t) => t.user_id === u.id).reduce((a, t) => a + t.amount, 0)
          return gain ? { ...u, balance: Number((u.balance + gain).toFixed(2)), total_profit: Number((u.total_profit + gain).toFixed(2)) } : u
        }),
        profitRuns: [
          { id: uid('run'), date: new Date().toISOString(), amount: Number(total.toFixed(2)), users: affected.size },
          ...st.profitRuns,
        ],
      }))
      return { total: Number(total.toFixed(2)), users: affected.size, rows: txRows.length }
    },

    async broadcast({ title, message, audience = 'all', userId = null, type = 'system' }) {
      await sleep(240)
      const targets =
        audience === 'all'
          ? getState().users.filter((u) => u.role !== 'admin')
          : getState().users.filter((u) => u.id === userId)
      const rows = targets.map((u) => ({
        id: uid('ntf'),
        user_id: u.id,
        title,
        message,
        type,
        is_read: false,
        created_date: new Date().toISOString(),
      }))
      mutate((s) => ({ ...s, notifications: [...rows, ...s.notifications] }))
      return rows.length
    },
  },
}

/** Referral bonus hook: 10% of the referred user's first investment. */
export async function maybePayReferralBonus({ userId, amount }) {
  const s = getState()
  const user = byId(s.users, userId)
  if (!user?.referred_by) return null
  const referrer = s.users.find((u) => u.referral_code === user.referred_by)
  if (!referrer) return null
  const priorInvestments = s.investments.filter((i) => i.user_id === userId)
  if (priorInvestments.length > 1) return null // only the first investment pays out
  const bonus = Number((amount * 0.1).toFixed(2))
  if (bonus <= 0) return null

  mutate((st) => ({
    ...st,
    referrals: st.referrals.map((r) =>
      r.referred_id === userId && r.referrer_id === referrer.id
        ? { ...r, status: 'active', bonus_earned: Number((r.bonus_earned + bonus).toFixed(2)) }
        : r,
    ),
    transactions: [
      {
        id: uid('tx'),
        created_date: new Date().toISOString(),
        user_id: referrer.id,
        user_email: referrer.email,
        type: 'referral_bonus',
        amount: bonus,
        status: 'completed',
        description: `Referral bonus — ${user.email}`,
      },
      ...st.transactions,
    ],
    users: st.users.map((u) =>
      u.id === referrer.id
        ? { ...u, balance: Number((u.balance + bonus).toFixed(2)), total_referral_bonus: Number((u.total_referral_bonus + bonus).toFixed(2)) }
        : u,
    ),
    notifications: [
      {
        id: uid('ntf'),
        user_id: referrer.id,
        title: 'Referral bonus earned',
        message: `You earned $${bonus.toFixed(2)} because ${user.email} activated a plan.`,
        type: 'referral',
        is_read: false,
        created_date: new Date().toISOString(),
      },
      ...st.notifications,
    ],
  }))
  return bonus
}
