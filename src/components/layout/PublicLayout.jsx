import { Link, NavLink, Outlet } from 'react-router-dom'
import { Mail, MapPin, Moon, Phone, Sun } from 'lucide-react'
import { useAuth } from '../../lib/auth'
import { useTheme } from '../../lib/theme'
import { cn } from '../../lib/utils'
import { Button } from '../ui/button'

const NAV = [
  { name: 'Home', to: '/Home' },
  { name: 'Plans', to: '/Plans' },
  { name: 'Market', to: '/Market' },
]

export default function PublicLayout() {
  const { user } = useAuth()
  const { theme, toggle } = useTheme()

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/Home" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl grad-btn flex items-center justify-center on-accent font-extrabold">C</div>
            <span className="text-lg font-bold text-white">CryptoMine</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn('text-sm font-medium transition-colors', isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-white')
                }
              >
                {item.name}
              </NavLink>
            ))}
            {user && (
              <NavLink
                to="/Dashboard"
                className={({ isActive }) =>
                  cn('text-sm font-medium transition-colors', isActive ? 'text-cyan-400' : 'text-slate-400 hover:text-white')
                }
              >
                Dashboard
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="w-9 h-9 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            {user ? (
              <Button asChild size="sm">
                <Link to="/Dashboard">Dashboard</Link>
              </Button>
            ) : (
              <Button asChild size="sm">
                <Link to="/login">Sign in</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1">
        <Outlet />
      </div>

      <Footer />
    </div>
  )
}

function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-900/40 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/Home" className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl grad-btn flex items-center justify-center on-accent font-extrabold">C</div>
            <span className="text-lg font-bold text-white">CryptoMine</span>
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed">
            Professional crypto mining operations delivering sustainable returns through advanced technology and
            transparent practices.
          </p>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            <li><Link to="/Home" className="hover:text-cyan-400 transition-colors">Home</Link></li>
            <li><Link to="/Plans" className="hover:text-cyan-400 transition-colors">Investment Plans</Link></li>
            <li><Link to="/Dashboard" className="hover:text-cyan-400 transition-colors">Dashboard</Link></li>
            <li><Link to="/Market" className="hover:text-cyan-400 transition-colors">Market</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm text-slate-400">
            {['Terms of Service', 'Privacy Policy', 'Risk Disclosure', 'AML Policy'].map((l) => (
              <li key={l}>
                <span className="cursor-default hover:text-cyan-400 transition-colors" title="Demo build — legal pages are not included">
                  {l}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Contact Us</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-cyan-400" /> support@cryptomine.io</li>
            <li className="flex items-center gap-2"><Phone className="w-4 h-4 text-cyan-400" /> +1 (555) 123-4567</li>
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-cyan-400 mt-0.5" />
              123 Blockchain Avenue, Suite 100, Tech City, TC 12345
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 py-5 px-4 flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto text-xs text-slate-500">
        <p>© {new Date().getFullYear()} CryptoMine. All rights reserved.</p>
        <p>Cryptocurrency investments are subject to market risks. Read all terms carefully.</p>
      </div>
    </footer>
  )
}
