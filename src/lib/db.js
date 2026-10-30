/**
 * Demo persistence layer.
 *
 * The live app keeps its records in base44's cloud (entities: User, InvestmentPlan,
 * UserInvestment, Transaction, Referral, Notification, SupportTicket). A clone cannot
 * carry that backend, so this module reproduces the same shapes in localStorage.
 *
 * SECURITY NOTE (demo only): passwords are stored as SHA-256 digests so no plaintext
 * sits in storage, but browser-side storage is NOT a security boundary — anyone with
 * devtools can read/rewrite this data. A real deployment needs a server, argon2/bcrypt
 * hashing, and httpOnly session cookies. See README "What's simulated".
 */
import { COINS } from '../data/market'
import { uid } from './utils'

const STORAGE_KEY = 'cryptoforge.db'
const SCHEMA_VERSION = 4

const hex = (buf) =>
  Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

/** Non-crypto fallback digest for non-secure contexts where crypto.subtle is unavailable. */
function fnv1a(input) {
  const bytes = new TextEncoder().encode(String(input))
  let h = 0x811c9dc5
  for (const b of bytes) {
    h ^= b
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

/**
 * Hash a password. Uses SHA-256 via Web Crypto when available (localhost and https
 * are secure contexts). Over plain http on a LAN address crypto.subtle is undefined,
 * so it degrades to a 32-bit FNV-1a digest — weak, but this is a client-side demo
 * either way and the fallback keeps the demo usable when served over http.
 */
export async function hashPassword(password) {
  if (globalThis.crypto?.subtle) return `sha256:${hex(await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(String(password))))}`
  return `fnv1a:${fnv1a(password)}`
}

/** Compare a password against the digests stored on a user record. */
export async function verifyPassword(password, user) {
  const stored = user?.password_hashes || {}
  const candidates = [stored.sha256, stored.fnv1a].filter(Boolean)
  if (!candidates.length) return false
  const computed = await hashPassword(password)
  // sha256 is the strong digest; only fall back to fnv1a when it is all we can compute.
  if (computed.startsWith('sha256:') && stored.sha256) return computed === stored.sha256
  if (stored.fnv1a) return computed.replace(/^.*?:/, 'fnv1a:') === stored.fnv1a
  return false
}

// Seed digests so the demo accounts can sign in before any password is ever set.
const DEMO_HASHES = {
  sha256: 'sha256:0ead2060b65992dca4769af601a1b3a35ef38cfad2c2c465bb160ea764157c5d',
  fnv1a: 'fnv1a:1f4a8392',
}
const ADMIN_HASHES = {
  sha256: 'sha256:ac9689e2272427085e35b9d3e3e8bed88cb3434828b43b86fc0596cad4c6e270',
  fnv1a: 'fnv1a:f56d9128',
}

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString()
const daysAhead = (n) => new Date(Date.now() + n * 86400000).toISOString()

function buildSeed() {
  const plans = [
    {
      id: 'plan_starter',
      name: 'Starter',
      description: 'Best for testing the waters with a small position.',
      minimum_investment: 100,
      maximum_investment: 999,
      profit_min: 10,
      profit_max: 15,
      duration_days: 30,
      features: ['Daily profit updates', 'Instant withdrawals', 'Email support', 'Real-time dashboard'],
      is_active: true,
      accent: 'cyan',
    },
    {
      id: 'plan_silver',
      name: 'Silver',
      description: 'Balanced plan for consistent monthly output.',
      minimum_investment: 1000,
      maximum_investment: 4999,
      profit_min: 15,
      profit_max: 25,
      duration_days: 60,
      features: ['All Starter features', 'Priority support', 'Weekly payout reports', 'Compound option'],
      is_active: true,
      accent: 'emerald',
    },
    {
      id: 'plan_gold',
      name: 'Gold',
      description: 'Higher hash power allocation and better profit share.',
      minimum_investment: 5000,
      maximum_investment: 19999,
      profit_min: 25,
      profit_max: 35,
      duration_days: 90,
      features: ['All Silver features', 'Dedicated rig allocation', 'Dedicated account manager', 'Custom payout schedule'],
      is_active: true,
      accent: 'purple',
    },
    {
      id: 'plan_platinum',
      name: 'Platinum',
      description: 'Institutional tier with the maximum revenue share.',
      minimum_investment: 20000,
      maximum_investment: 100000,
      profit_min: 35,
      profit_max: 45,
      duration_days: 180,
      features: ['All Gold features', 'Institutional revenue share', 'Quarterly strategy calls', 'Early access to new farms'],
      is_active: true,
      accent: 'amber',
    },
  ]

  const mkUser = (o) => ({
    id: o.id,
    email: o.email,
    full_name: o.full_name,
    role: o.role || 'user',
    balance: o.balance || 0,
    total_deposit: o.total_deposit || 0,
    total_profit: o.total_profit || 0,
    total_withdrawn: o.total_withdrawn || 0,
    total_referral_bonus: o.total_referral_bonus || 0,
    referral_code: o.referral_code,
    referred_by: o.referred_by || null,
    is_locked: o.is_locked || false,
    password_hashes: o.password_hashes || DEMO_HASHES,
    created_date: o.created_date || daysAgo(120),
  })

  const users = [
    mkUser({
      id: 'usr_admin',
      email: 'admin@cryptomine.io',
      full_name: 'Platform Admin',
      role: 'admin',
      referral_code: 'ADMIN01',
      password_hashes: ADMIN_HASHES,
      created_date: daysAgo(400),
    }),
    mkUser({
      id: 'usr_demo',
      email: 'investor@demo.com',
      full_name: 'Demo Investor',
      balance: 4820.55,
      total_deposit: 5000,
      total_profit: 620.55,
      total_withdrawn: 800,
      total_referral_bonus: 120,
      referral_code: 'REF6DA8C5',
      created_date: daysAgo(95),
    }),
    mkUser({ id: 'usr_sarah', email: 'sarah@example.com', full_name: 'Sarah Khan', balance: 12480.2, total_deposit: 12000, total_profit: 1980.2, referral_code: 'REFSA123', created_date: daysAgo(70) }),
    mkUser({ id: 'usr_mike', email: 'mike@example.com', full_name: 'Mike Ross', balance: 640.1, total_deposit: 1500, total_profit: 140.1, referral_code: 'REFMI456', created_date: daysAgo(52) }),
    mkUser({ id: 'usr_aisha', email: 'aisha@example.com', full_name: 'Aisha Malik', balance: 0, total_deposit: 2500, total_profit: 310, is_locked: true, referral_code: 'REFAI789', created_date: daysAgo(40) }),
    mkUser({ id: 'usr_john', email: 'john@example.com', full_name: 'John Doe', balance: 3120.75, total_deposit: 3000, total_profit: 420.75, referral_code: 'REFJO321', created_date: daysAgo(28) }),
    mkUser({ id: 'usr_lena', email: 'lena@example.com', full_name: 'Lena Petrova', balance: 20450, total_deposit: 20000, total_profit: 2450, referral_code: 'REFLE654', created_date: daysAgo(14) }),
  ]
  // Demo investor was referred by Sarah, and referred Mike + John itself.
  users.find((u) => u.id === 'usr_demo').referred_by = 'usr_sarah'
  users.find((u) => u.id === 'usr_mike').referred_by = 'usr_demo'
  users.find((u) => u.id === 'usr_john').referred_by = 'usr_demo'

  const investments = [
    { id: 'inv_1', user_id: 'usr_demo', user_email: 'investor@demo.com', plan_id: 'plan_silver', plan_name: 'Silver', amount: 1500, status: 'active', profit_earned: 212.4, start_date: daysAgo(45).slice(0, 10) },
    { id: 'inv_2', user_id: 'usr_demo', user_email: 'investor@demo.com', plan_id: 'plan_gold', plan_name: 'Gold', amount: 3000, status: 'active', profit_earned: 408.15, start_date: daysAgo(22).slice(0, 10) },
    { id: 'inv_3', user_id: 'usr_sarah', user_email: 'sarah@example.com', plan_id: 'plan_gold', plan_name: 'Gold', amount: 10000, status: 'active', profit_earned: 1920.2, start_date: daysAgo(60).slice(0, 10) },
    { id: 'inv_4', user_id: 'usr_lena', user_email: 'lena@example.com', plan_id: 'plan_platinum', plan_name: 'Platinum', amount: 20000, status: 'active', profit_earned: 2450, start_date: daysAgo(12).slice(0, 10) },
    { id: 'inv_5', user_id: 'usr_mike', user_email: 'mike@example.com', plan_id: 'plan_starter', plan_name: 'Starter', amount: 1000, status: 'completed', profit_earned: 140.1, start_date: daysAgo(48).slice(0, 10) },
  ]

  const t = (o) => ({
    id: uid('tx'),
    user_id: o.user_id,
    user_email: o.user_email,
    type: o.type,
    amount: o.amount,
    status: o.status || 'completed',
    description: o.description,
    created_date: o.created_date,
    ...(o.exchange_name ? { exchange_name: o.exchange_name } : {}),
    ...(o.exchange_id ? { exchange_id: o.exchange_id } : {}),
    ...(o.reference_id ? { reference_id: o.reference_id } : {}),
  })

  const transactions = [
    t({ user_id: 'usr_demo', user_email: 'investor@demo.com', type: 'deposit', amount: 2000, description: 'Deposit via USDT', created_date: daysAgo(90) }),
    t({ user_id: 'usr_demo', user_email: 'investor@demo.com', type: 'deposit', amount: 3000, description: 'Deposit via Bitcoin', created_date: daysAgo(60) }),
    t({ user_id: 'usr_demo', user_email: 'investor@demo.com', type: 'investment', amount: 1500, description: 'Investment in Silver', created_date: daysAgo(45) }),
    t({ user_id: 'usr_demo', user_email: 'investor@demo.com', type: 'investment', amount: 3000, description: 'Investment in Gold', created_date: daysAgo(22) }),
    t({ user_id: 'usr_demo', user_email: 'investor@demo.com', type: 'profit', amount: 96.4, description: 'Mining profit — Silver', created_date: daysAgo(30) }),
    t({ user_id: 'usr_demo', user_email: 'investor@demo.com', type: 'profit', amount: 116.0, description: 'Mining profit — Silver', created_date: daysAgo(15) }),
    t({ user_id: 'usr_demo', user_email: 'investor@demo.com', type: 'profit', amount: 208.15, description: 'Mining profit — Gold', created_date: daysAgo(7) }),
    t({ user_id: 'usr_demo', user_email: 'investor@demo.com', type: 'referral_bonus', amount: 120, description: 'Referral bonus — Mike Ross', created_date: daysAgo(20) }),
    t({ user_id: 'usr_demo', user_email: 'investor@demo.com', type: 'transfer_in', amount: 300, description: 'Transfer from sarah@example.com', created_date: daysAgo(11) }),
    t({ user_id: 'usr_demo', user_email: 'investor@demo.com', type: 'transfer_out', amount: 150, description: 'Transfer to mike@example.com', created_date: daysAgo(9) }),
    t({ user_id: 'usr_demo', user_email: 'investor@demo.com', type: 'withdrawal', amount: 800, status: 'completed', description: 'Withdrawal to Binance', exchange_name: 'Binance', exchange_id: 'bc1qxy2k...7f3a', created_date: daysAgo(5) }),
    t({ user_id: 'usr_demo', user_email: 'investor@demo.com', type: 'withdrawal', amount: 250, status: 'pending', description: 'Withdrawal to Bybit', exchange_name: 'Bybit', exchange_id: '0x9f2c...41ab', created_date: daysAgo(1) }),
    t({ user_id: 'usr_sarah', user_email: 'sarah@example.com', type: 'deposit', amount: 12000, description: 'Deposit via USDT', created_date: daysAgo(70) }),
    t({ user_id: 'usr_sarah', user_email: 'sarah@example.com', type: 'withdrawal', amount: 1500, status: 'pending', description: 'Withdrawal to OKX', exchange_name: 'OKX', exchange_id: '0x71ba...9c02', created_date: daysAgo(2) }),
    t({ user_id: 'usr_lena', user_email: 'lena@example.com', type: 'withdrawal', amount: 4000, status: 'pending', description: 'Withdrawal to Kraken', exchange_name: 'Kraken', exchange_id: 'bc1qzz9...21de', created_date: daysAgo(1) }),
    t({ user_id: 'usr_mike', user_email: 'mike@example.com', type: 'deposit', amount: 1500, description: 'Deposit via Ethereum', created_date: daysAgo(50) }),
    t({ user_id: 'usr_john', user_email: 'john@example.com', type: 'deposit', amount: 3000, description: 'Deposit via USDT', created_date: daysAgo(26) }),
  ]

  const referrals = [
    { id: 'ref_1', referrer_id: 'usr_demo', referrer_email: 'investor@demo.com', referred_id: 'usr_mike', referred_email: 'mike@example.com', status: 'active', bonus_earned: 100, created_date: daysAgo(50) },
    { id: 'ref_2', referrer_id: 'usr_demo', referrer_email: 'investor@demo.com', referred_id: 'usr_john', referred_email: 'john@example.com', status: 'pending', bonus_earned: 20, created_date: daysAgo(26) },
    { id: 'ref_3', referrer_id: 'usr_sarah', referrer_email: 'sarah@example.com', referred_id: 'usr_demo', referred_email: 'investor@demo.com', status: 'active', bonus_earned: 500, created_date: daysAgo(95) },
  ]

  const notifications = [
    { id: uid('ntf'), user_id: 'usr_demo', title: 'Profit distributed', message: 'A mining profit of $208.15 was credited to your Gold plan.', type: 'profit', is_read: false, created_date: daysAgo(7) },
    { id: uid('ntf'), user_id: 'usr_demo', title: 'Withdrawal requested', message: 'Your $250.00 withdrawal to Bybit is pending review.', type: 'withdrawal', is_read: false, created_date: daysAgo(1) },
    { id: uid('ntf'), user_id: 'usr_demo', title: 'Referral bonus earned', message: 'You earned $100.00 because Mike Ross activated a plan.', type: 'referral', is_read: true, created_date: daysAgo(20) },
    { id: uid('ntf'), user_id: 'usr_demo', title: 'Welcome to CryptoMine', message: 'Your account is ready. Fund your wallet to activate a plan.', type: 'system', is_read: true, created_date: daysAgo(95) },
    { id: uid('ntf'), user_id: 'usr_sarah', title: 'Profit distributed', message: 'A mining profit of $520.00 was credited to your Gold plan.', type: 'profit', is_read: false, created_date: daysAgo(6) },
    { id: uid('ntf'), user_id: 'usr_lena', title: 'Profit distributed', message: 'A mining profit of $1,120.00 was credited to your Platinum plan.', type: 'profit', is_read: false, created_date: daysAgo(4) },
  ]

  const tickets = [
    {
      id: uid('tkt'),
      user_id: 'usr_demo',
      user_email: 'investor@demo.com',
      user_name: 'Demo Investor',
      subject: 'Withdrawal still pending after 24 hours',
      priority: 'high',
      status: 'in_progress',
      messages: [
        { sender: 'Demo Investor', sender_role: 'user', message: 'Hi, my $250 withdrawal to Bybit has been pending for a day now. Could you check the status?', timestamp: daysAgo(1) },
        { sender: 'Support Team', sender_role: 'admin', message: 'Thanks for reaching out. Your request is in the payout queue and is normally processed within 48 hours.', timestamp: daysAgo(1) },
        { sender: 'Demo Investor', sender_role: 'user', message: 'Understood, thanks for the quick reply.', timestamp: daysAgo(0.5) },
      ],
      created_date: daysAgo(1),
    },
    {
      id: uid('tkt'),
      user_id: 'usr_mike',
      user_email: 'mike@example.com',
      user_name: 'Mike Ross',
      subject: 'How do I upgrade from Starter to Silver?',
      priority: 'low',
      status: 'open',
      messages: [
        { sender: 'Mike Ross', sender_role: 'user', message: 'My Starter plan is still running. Can I move the remaining capital into Silver?', timestamp: daysAgo(3) },
      ],
      created_date: daysAgo(3),
    },
  ]

  return {
    version: SCHEMA_VERSION,
    users,
    plans,
    investments,
    transactions,
    referrals,
    notifications,
    tickets,
    market: COINS,
    session: null,
    pending_otp: null,
    profitRuns: [
      { id: uid('run'), date: daysAgo(30), amount: 1420.5, users: 3 },
      { id: uid('run'), date: daysAgo(15), amount: 1890.25, users: 4 },
      { id: uid('run'), date: daysAgo(7), amount: 2140.8, users: 4 },
    ],
    txSeq: 0,
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.version === SCHEMA_VERSION) return parsed
    }
  } catch {
    /* corrupted payload -> fall through to a fresh seed */
  }
  const fresh = buildSeed()
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh))
  return fresh
}

let state = load()
const listeners = new Set()

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    /* quota / private mode: keep the in-memory copy */
  }
}

function emit() {
  listeners.forEach((fn) => fn(state))
}

export function subscribe(fn) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

export function getState() {
  return state
}

export function mutate(fn) {
  const next = fn(state)
  state = next || state
  persist()
  emit()
  return state
}

export function resetDb() {
  state = buildSeed()
  persist()
  emit()
}

export { SCHEMA_VERSION }
