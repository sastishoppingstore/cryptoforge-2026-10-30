/**
 * Coin list used by the Market page, the dashboard "Live Market" panel and the
 * landing-page ticker. Base prices match the live app's snapshot; the Market page
 * "Refresh" button applies a small random drift so the UI feels live.
 */
export const COINS = [
  { symbol: 'BTC', name: 'Bitcoin', price: 67234.5, change24h: -4.74, change7d: -7.15, marketCap: 1320000000000, volume: 28500000000, color: 'from-amber-400 to-orange-500' },
  { symbol: 'ETH', name: 'Ethereum', price: 3456.78, change24h: -6.34, change7d: 2.83, marketCap: 415000000000, volume: 15200000000, color: 'from-indigo-400 to-purple-500' },
  { symbol: 'BNB', name: 'BNB', price: 598.23, change24h: 1.84, change7d: 5.22, marketCap: 89000000000, volume: 1800000000, color: 'from-yellow-400 to-amber-500' },
  { symbol: 'XRP', name: 'Ripple', price: 0.52, change24h: -8.47, change7d: 3.79, marketCap: 28000000000, volume: 1200000000, color: 'from-slate-400 to-slate-600' },
  { symbol: 'SOL', name: 'Solana', price: 145.67, change24h: -7.08, change7d: -13.76, marketCap: 67000000000, volume: 3500000000, color: 'from-purple-400 to-fuchsia-500' },
  { symbol: 'ADA', name: 'Cardano', price: 0.45, change24h: -2.84, change7d: 7.02, marketCap: 16000000000, volume: 450000000, color: 'from-blue-400 to-cyan-500' },
  { symbol: 'DOGE', name: 'Dogecoin', price: 0.12, change24h: -4.77, change7d: -11.11, marketCap: 17000000000, volume: 800000000, color: 'from-yellow-300 to-amber-400' },
  { symbol: 'DOT', name: 'Polkadot', price: 7.23, change24h: 7.55, change7d: 0.98, marketCap: 10000000000, volume: 320000000, color: 'from-pink-400 to-rose-500' },
  { symbol: 'AVAX', name: 'Avalanche', price: 35.45, change24h: -3.09, change7d: -11.24, marketCap: 14000000000, volume: 520000000, color: 'from-red-400 to-rose-500' },
  { symbol: 'LTC', name: 'Litecoin', price: 84.56, change24h: 1.49, change7d: 3.26, marketCap: 6300000000, volume: 420000000, color: 'from-slate-300 to-slate-500' },
]

export const TICKER_COINS = COINS.slice(0, 5)

/** Random walk used by the Market page refresh + the landing ticker. */
export function driftCoins(coins) {
  return coins.map((c) => {
    const delta = (Math.random() - 0.48) * 1.6
    const price = Math.max(0.01, c.price * (1 + delta / 100))
    return {
      ...c,
      price: Number(price.toFixed(price < 1 ? 4 : 2)),
      change24h: Number((c.change24h + delta).toFixed(2)),
    }
  })
}
