import { useEffect, useState } from 'react'
import { useDb } from '../lib/useDb'
import { driftCoins } from '../data/market'
import { TICKER_COINS } from '../data/market'
import { CoinIcon, PriceDelta } from './shared'

/** Infinite price strip used on the landing page. */
export default function MarketTicker() {
  const [coins, setCoins] = useState(TICKER_COINS)

  useEffect(() => {
    const id = setInterval(() => setCoins((c) => driftCoins(c)), 6000)
    return () => clearInterval(id)
  }, [])

  const strip = [...coins, ...coins, ...coins]

  return (
    <div className="border-y border-slate-800 bg-slate-900/50 py-4 overflow-hidden">
      <div className="flex w-max animate-marquee gap-10">
        {strip.map((c, i) => (
          <div key={`${c.symbol}-${i}`} className="flex items-center gap-3 shrink-0">
            <CoinIcon symbol={c.symbol} color={c.color} className="w-7 h-7 text-[10px]" />
            <span className="text-sm font-semibold text-white">{c.symbol}</span>
            <span className="text-sm text-slate-400">
              ${c.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: c.price < 1 ? 4 : 2 })}
            </span>
            <PriceDelta value={c.change24h} />
          </div>
        ))}
      </div>
    </div>
  )
}
