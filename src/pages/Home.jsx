import { Link } from 'react-router-dom'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowRight,
  Cpu,
  Globe,
  Lock,
  ShieldCheck,
  Smartphone,
  TrendingUp,
  Users,
  Zap,
  FileText,
  Gauge,
  Leaf,
  Server,
  Clock,
  MonitorSmartphone,
  AlertTriangle,
  PiggyBank,
  Bitcoin,
  Coins,
} from 'lucide-react'
import MarketTicker from '../components/MarketTicker'
import { Button } from '../components/ui/button'
import { useAuth } from '../lib/auth'

const PERFORMANCE = [
  { month: 'Jan', profit: 18.2 },
  { month: 'Feb', profit: 16.4 },
  { month: 'Mar', profit: 20.1 },
  { month: 'Apr', profit: 17.9 },
  { month: 'May', profit: 22.3 },
  { month: 'Jun', profit: 19.6 },
  { month: 'Jul', profit: 21.4 },
  { month: 'Aug', profit: 23.1 },
  { month: 'Sep', profit: 20.8 },
  { month: 'Oct', profit: 22.7 },
  { month: 'Nov', profit: 24.5 },
  { month: 'Dec', profit: 21.9 },
]

const STEPS = [
  { step: 'Step 1', title: 'Pool Investment', body: 'Investors contribute capital to our mining pool, combining resources for maximum efficiency.' },
  { step: 'Step 2', title: 'Mining Operations', body: 'State-of-the-art mining servers operate 24/7, utilizing optimized energy and advanced hardware.' },
  { step: 'Step 3', title: 'Revenue Generation', body: 'Cryptocurrency is mined continuously, generating real revenue from blockchain rewards.' },
  { step: 'Step 4', title: 'Profit Distribution', body: 'Profits are shared among investors based on their active plans and mining performance.' },
]

const ABOUT_FEATURES = [
  { icon: Cpu, title: 'Advanced Hardware', body: 'Latest ASIC miners and GPU rigs' },
  { icon: Zap, title: 'Optimized Energy', body: 'Efficient power consumption' },
  { icon: Globe, title: 'Global Operations', body: 'Data centers worldwide' },
  { icon: Lock, title: 'Secure Infrastructure', body: 'Enterprise-grade security' },
  { icon: MonitorSmartphone, title: '24/7 Monitoring', body: 'Real-time system oversight' },
  { icon: Leaf, title: 'Sustainable Mining', body: 'Eco-friendly practices' },
]

const TRUST = [
  { icon: ShieldCheck, title: 'Bank-Grade Security', body: 'Multi-layer encryption and advanced security protocols protect your investments.' },
  { icon: Gauge, title: 'Full Transparency', body: 'Real-time tracking of all mining operations and profit distributions.' },
  { icon: Lock, title: 'Secure Wallets', body: 'Cold storage and multi-signature wallets for maximum asset protection.' },
  { icon: Smartphone, title: '24/7 Support', body: 'Our dedicated team is available around the clock to assist you.' },
  { icon: FileText, title: 'Regulatory Compliance', body: 'Operating within legal frameworks and industry best practices.' },
  { icon: Clock, title: 'Clear Documentation', body: 'Detailed terms, conditions, and risk disclosures for informed decisions.' },
]

export default function Home() {
  const { user } = useAuth()
  const startHref = user ? '/Dashboard' : '/login'

  return (
    <div>
      {/* ------------------------------- hero ------------------------------- */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full bg-cyan-500/10 blur-3xl animate-pulse-glow" />
          <div className="absolute top-40 right-0 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-14 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-semibold text-cyan-400">
            <Zap className="w-3.5 h-3.5" />
            Next-Gen Mining Technology
          </div>

          <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-[1.1]">
            Powering the Future of
            <br />
            <span className="grad-text">Crypto Mining</span>
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-slate-400">
            Earn from real mining operations, not empty promises. Our high-performance infrastructure delivers
            transparent, sustainable returns based on actual mining output.
          </p>

          <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link to={startHref}>
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/Plans">View Plans</Link>
            </Button>
          </div>

          <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {[
              ['12,500+', 'Active Investors'],
              ['$45M+', 'Total Mined'],
              ['120+', 'Countries'],
              ['99.9%', 'Uptime'],
            ].map(([value, label]) => (
              <div key={label} className="panel bg-slate-900/50 p-5">
                <p className="text-2xl sm:text-3xl font-bold text-white">{value}</p>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <MarketTicker />
      </section>

      {/* ------------------------------ how it works ------------------------ */}
      <Section eyebrow="How it works" title="Mining Made Simple" subtitle="We pool investor capital to operate high-performance crypto mining servers. Our infrastructure mines cryptocurrency continuously, sharing rewards transparently.">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <div key={s.title} className="panel p-6 relative">
              <span className="absolute top-5 right-5 text-4xl font-extrabold text-slate-700/60">{i + 1}</span>
              <p className="text-xs font-semibold uppercase tracking-wider text-cyan-400">{s.step}</p>
              <h3 className="text-lg font-bold text-white mt-2">{s.title}</h3>
              <p className="text-sm text-slate-400 mt-3 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-300">
            <strong>Important:</strong> Profits are shared as a percentage of actual mining output — not fixed returns.
            This ensures transparency and long-term sustainability.
          </p>
        </div>
      </Section>

      {/* --------------------------- profit distribution -------------------- */}
      <Section eyebrow="Profit distribution" title="Transparent Profit Sharing" subtitle="Profit sharing starts from a minimum of 10% on starter plans and can reach up to 45%, depending on the investment plan and mining performance. All profits fluctuate according to real mining results and market conditions.">
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            ['10% - 45%', 'Profit Range', 'Based on plan and performance'],
            ['Daily', 'Profit Updates', 'Real-time tracking'],
            ['100%', 'Transparent', 'Open profit records'],
          ].map(([value, label, sub]) => (
            <div key={label} className="panel p-6">
              <p className="text-3xl font-bold grad-text">{value}</p>
              <p className="font-semibold text-white mt-2">{label}</p>
              <p className="text-sm text-slate-400 mt-1">{sub}</p>
            </div>
          ))}
        </div>

        <div className="panel p-6 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Mining Performance</h3>
              <p className="text-sm text-slate-400">Monthly profit percentage (sample)</p>
            </div>
            <span className="text-sm font-semibold text-emerald-400">+24.5%</span>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PERFORMANCE}>
                <defs>
                  <linearGradient id="perf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--slate-700))" vertical={false} />
                <XAxis dataKey="month" stroke="rgb(var(--slate-500))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="rgb(var(--slate-500))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
                <Tooltip
                  contentStyle={{
                    background: 'rgb(var(--slate-900))',
                    border: '1px solid rgb(var(--slate-700))',
                    borderRadius: 12,
                    color: 'rgb(var(--slate-200))',
                  }}
                  formatter={(v) => [`${v}%`, 'Profit']}
                />
                <Area type="monotone" dataKey="profit" stroke="#22d3ee" strokeWidth={2} fill="url(#perf)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            * Historical data shown for illustration. Past performance does not guarantee future results.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mt-6">
          {[
            [Server, '500+', 'Mining Rigs'],
            [Bitcoin, '15', 'Data Centers'],
            [Coins, '5 PH/s', 'Hash Power'],
          ].map(([Icon, value, label]) => (
            <div key={label} className="panel p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-sm text-slate-400">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* -------------------------------- about ------------------------------ */}
      <Section eyebrow="About our company" title="Professional Mining Operations" subtitle="We are a digital crypto mining operation leveraging advanced mining infrastructure, optimized energy usage, and professional management to deliver sustainable mining performance for our investors. Our team of experts manages operations around the clock to maximize returns while maintaining the highest security standards.">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ABOUT_FEATURES.map((f) => (
            <div key={f.title} className="panel p-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 flex items-center justify-center text-cyan-400 mb-4">
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white">{f.title}</h3>
              <p className="text-sm text-slate-400 mt-1">{f.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ------------------------------ trust ------------------------------- */}
      <Section eyebrow="Trust & security" title="Your Security is Our Priority" subtitle="We employ industry-leading security measures and maintain full transparency to protect your investments and build lasting trust.">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TRUST.map((t) => (
            <div key={t.title} className="panel p-6">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <t.icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-white">{t.title}</h3>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">{t.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* -------------------------- risk + final CTA ------------------------ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 sm:p-8">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h3 className="text-lg font-bold text-amber-300">Important Risk Disclosure</h3>
              <p className="text-sm text-amber-200/80 mt-2 leading-relaxed">
                Cryptocurrency mining and investments involve substantial risk. Profits are not guaranteed and fluctuate
                based on market conditions, mining difficulty, and cryptocurrency prices. The profit percentages shown
                are estimated ranges based on historical performance and do not represent guaranteed returns. Only invest
                what you can afford to lose. Past performance is not indicative of future results. Please read our full
                terms and conditions before investing.
              </p>
            </div>
          </div>
        </div>

        <div className="panel mt-8 p-8 sm:p-12 text-center bg-gradient-to-br from-cyan-500/10 to-emerald-500/10">
          <Users className="w-10 h-10 text-cyan-400 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Start mining in minutes</h2>
          <p className="text-slate-400 mt-3 max-w-xl mx-auto">
            Fund your wallet, pick a plan, and track your mining profits from a single dashboard.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg">
              <Link to={startHref}>
                <PiggyBank className="w-4 h-4" />
                Get Started
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link to="/Market">
                <TrendingUp className="w-4 h-4" />
                Live Market
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Section({ eyebrow, title, subtitle, children }) {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="max-w-3xl mb-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400">{eyebrow}</p>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-3">{title}</h2>
        {subtitle && <p className="text-slate-400 mt-4 leading-relaxed">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}
