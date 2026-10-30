import { useState } from 'react'
import { Info, RefreshCw } from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Table, TableWrap, Td, Th } from '../components/ui/feedback'
import { Spinner } from '../components/ui/form'
import { CoinIcon, Delta } from '../components/shared'
import { useToast } from '../components/ui/toast'
import { api } from '../lib/api'
import { useDb } from '../lib/useDb'
import { compact, usd } from '../lib/utils'

export default function Market() {
  const db = useDb()
  const toast = useToast()
  const [busy, setBusy] = useState(false)

  const refresh = async () => {
    setBusy(true)
    await api.market.refresh()
    setBusy(false)
    toast.info('Prices refreshed', 'Simulated tick data.')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Crypto Market</h1>
          <p className="text-slate-400 mt-1">Real-time cryptocurrency prices</p>
        </div>
        <Button variant="outline" onClick={refresh} disabled={busy}>
          {busy ? <Spinner className="h-4 w-4" /> : <RefreshCw className="w-4 h-4" />}
          Refresh
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <TableWrap>
            <Table>
              <thead className="border-b border-slate-700/50">
                <tr>
                  <Th className="w-12">#</Th>
                  <Th>Name</Th>
                  <Th className="text-right">Price</Th>
                  <Th className="text-right">24h %</Th>
                  <Th className="text-right">7d %</Th>
                  <Th className="text-right">Market Cap</Th>
                  <Th className="text-right">Volume (24h)</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/40">
                {db.market.map((c, i) => (
                  <tr key={c.symbol} className="hover:bg-slate-800/40 transition-colors">
                    <Td className="text-slate-500">{i + 1}</Td>
                    <Td>
                      <div className="flex items-center gap-3">
                        <CoinIcon symbol={c.symbol} color={c.color} className="w-9 h-9 text-xs" />
                        <div>
                          <p className="font-semibold text-white">{c.name}</p>
                          <p className="text-xs text-slate-500">{c.symbol}</p>
                        </div>
                      </div>
                    </Td>
                    <Td className="text-right font-semibold text-white">
                      ${c.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: c.price < 1 ? 4 : 2 })}
                    </Td>
                    <Td className="text-right">
                      <Delta value={c.change24h} className="justify-end" />
                    </Td>
                    <Td className="text-right">
                      <Delta value={c.change7d} className="justify-end" />
                    </Td>
                    <Td className="text-right text-slate-300">{compact(c.marketCap)}</Td>
                    <Td className="text-right text-slate-300">{compact(c.volume)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrap>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-slate-700/60 bg-slate-800/40 p-4 flex gap-3">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-400">
          * Prices are simulated for demonstration purposes. Real-time data integration available.
        </p>
      </div>
    </div>
  )
}
