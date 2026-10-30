import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const usd = (n, digits = 2) =>
  `$${Number(n || 0).toLocaleString('en-US', {
    minimumFractionDigits: digits === 0 ? 0 : digits,
    maximumFractionDigits: digits,
  })}`

export const compact = (n) => {
  const abs = Math.abs(n)
  if (abs >= 1e12) return `$${(n / 1e12).toFixed(2)}T`
  if (abs >= 1e9) return `$${(n / 1e9).toFixed(2)}B`
  if (abs >= 1e6) return `$${(n / 1e6).toFixed(2)}M`
  if (abs >= 1e3) return `$${(n / 1e3).toFixed(2)}K`
  return `$${n.toFixed(2)}`
}

export const pct = (n) => `${n > 0 ? '+' : ''}${Number(n).toFixed(2)}%`

export const shortDate = (iso) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

export const dateTime = (iso) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })

let seq = 0
export const uid = (prefix = 'id') =>
  `${prefix}_${Date.now().toString(36)}${(seq++).toString(36)}${Math.random().toString(36).slice(2, 7)}`

export const initials = (nameOrEmail = '') => {
  const s = String(nameOrEmail).trim()
  if (!s) return 'U'
  if (s.includes('@')) return s[0].toUpperCase()
  return s
    .split(/[\s._-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('')
}

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
