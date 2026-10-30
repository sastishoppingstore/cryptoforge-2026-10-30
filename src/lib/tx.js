/** Shared display metadata for the transaction types the app records. */
export const TX_TYPES = [
  { value: 'all', label: 'All' },
  { value: 'deposit', label: 'Deposits' },
  { value: 'withdrawal', label: 'Withdrawals' },
  { value: 'transfer_in', label: 'Transfers In' },
  { value: 'transfer_out', label: 'Transfers Out' },
  { value: 'profit', label: 'Profits' },
]

export const TX_META = {
  deposit: { label: 'Deposit', color: 'text-emerald-400', sign: '+' },
  withdrawal: { label: 'Withdrawal', color: 'text-amber-400', sign: '-' },
  transfer_in: { label: 'Transfer In', color: 'text-cyan-400', sign: '+' },
  transfer_out: { label: 'Transfer Out', color: 'text-rose-400', sign: '-' },
  investment: { label: 'Investment', color: 'text-purple-400', sign: '-' },
  profit: { label: 'Profit', color: 'text-emerald-400', sign: '+' },
  bonus: { label: 'Bonus', color: 'text-pink-400', sign: '+' },
  referral_bonus: { label: 'Referral Bonus', color: 'text-blue-400', sign: '+' },
}

export const CREDIT_TYPES = ['deposit', 'transfer_in', 'profit', 'bonus', 'referral_bonus']

export const isCredit = (type) => CREDIT_TYPES.includes(type)

export const STATUS_VARIANT = {
  completed: 'emerald',
  pending: 'amber',
  processing: 'blue',
  declined: 'red',
  active: 'emerald',
  open: 'cyan',
  in_progress: 'blue',
  resolved: 'emerald',
  closed: 'default',
}

export const PRIORITIES = ['low', 'medium', 'high', 'urgent']

export const PRIORITY_VARIANT = {
  low: 'default',
  medium: 'cyan',
  high: 'amber',
  urgent: 'red',
}
