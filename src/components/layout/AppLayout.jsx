import { useMemo, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity,
  ArrowLeftRight,
  ArrowDownToLine,
  Bell,
  CandlestickChart,
  CheckCheck,
  Coins,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Moon,
  PlusCircle,
  Receipt,
  Search,
  ShieldCheck,
  Sun,
  TrendingUp,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { api } from '../../lib/api'
import { useAuth } from '../../lib/auth'
import { useTheme } from '../../lib/theme'
import { useDb } from '../../lib/useDb'
import { cn, dateTime, initials } from '../../lib/utils'
import { Avatar } from '../ui/form'
import { Button } from '../ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown'
import { mutate } from '../../lib/db'

const USER_NAV = [
  { name: 'Dashboard', to: '/Dashboard', icon: LayoutDashboard },
  { name: 'Fund Account', to: '/Fund', icon: PlusCircle },
  { name: 'Transfer', to: '/Transfer', icon: ArrowLeftRight },
  { name: 'Withdraw', to: '/Withdraw', icon: ArrowDownToLine },
  { name: 'Investment Plans', to: '/Plans', icon: TrendingUp },
  { name: 'Transactions', to: '/Transactions', icon: Receipt },
  { name: 'Referrals', to: '/Referrals', icon: Users },
  { name: 'Market', to: '/Market', icon: CandlestickChart },
  { name: 'Support', to: '/Support', icon: LifeBuoy },
]

const ADMIN_NAV = [
  { name: 'Admin Dashboard', to: '/AdminDashboard', icon: Activity },
  { name: 'User Management', to: '/AdminUsers', icon: Users },
  { name: 'Manage Plans', to: '/AdminPlans', icon: TrendingUp },
  { name: 'Withdrawals', to: '/AdminWithdrawals', icon: ArrowDownToLine },
  { name: 'Profit Distribution', to: '/AdminProfits', icon: Coins },
  { name: 'Notifications', to: '/AdminNotifications', icon: Bell },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const isAdmin = user?.role === 'admin'

  return (
    <div className="h-screen bg-slate-950 flex overflow-hidden">
      {/* mobile scrim */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileOpen(false)} aria-hidden />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-[280px] bg-slate-900 border-r border-slate-800 z-50 shrink-0 flex flex-col',
          'transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <Link to="/Home" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl grad-btn flex items-center justify-center on-accent font-extrabold text-lg">
              C
            </div>
            <span className="text-xl font-bold text-white">CryptoMine</span>
          </Link>
          <button className="lg:hidden text-slate-400 hover:text-white" onClick={() => setMobileOpen(false)} aria-label="Close menu">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-3">
          {isAdmin && (
            <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin Panel</div>
          )}
          <nav className="space-y-1">
            {[
              ...(isAdmin ? ADMIN_NAV : []),
              ...(isAdmin
                ? [{ name: 'User Panel', section: true }]
                : []),
              ...USER_NAV,
            ].map((item) =>
              item.section ? (
                <div key="user-section" className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mt-4">
                  User Panel
                </div>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium',
                      isActive
                        ? 'bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 text-cyan-400 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800',
                    )
                  }
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </NavLink>
              ),
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 mb-3">
            <Avatar name={user?.full_name || user?.email} className="h-9 w-9" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user?.full_name || user?.email}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>
          <Button variant="ghost" className="w-full justify-start" onClick={logout}>
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const db = useDb()

  const myNotifications = useMemo(
    () => db.notifications.filter((n) => n.user_id === user?.id).sort((a, b) => (a.created_date < b.created_date ? 1 : -1)),
    [db.notifications, user?.id],
  )
  const unread = myNotifications.filter((n) => !n.is_read).length

  const markAllRead = () =>
    mutate((s) => ({
      ...s,
      notifications: s.notifications.map((n) => (n.user_id === user?.id ? { ...n, is_read: true } : n)),
    }))

  return (
    <header className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur border-b border-slate-800">
      <div className="flex items-center gap-3 p-4 lg:px-8">
        <button className="lg:hidden text-slate-400 hover:text-white" onClick={onMenuClick} aria-label="Open menu">
          <Menu className="w-6 h-6" />
        </button>

        <form
          className="hidden sm:block flex-1 max-w-md"
          onSubmit={(e) => {
            e.preventDefault()
            navigate(`/Transactions${q ? `?q=${encodeURIComponent(q)}` : ''}`)
          }}
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search..."
              className="w-full h-10 pl-10 pr-4 rounded-xl bg-slate-800/60 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60"
            />
          </div>
        </form>

        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={toggle}
            className="w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="relative w-10 h-10 rounded-xl bg-slate-800/60 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unread > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unread}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[340px] p-0">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
                <p className="text-sm font-semibold text-white">Notifications</p>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs text-cyan-400 hover:underline inline-flex items-center gap-1">
                    <CheckCheck className="w-3.5 h-3.5" />
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-[360px] overflow-y-auto">
                {myNotifications.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">No notifications yet</p>
                ) : (
                  myNotifications.slice(0, 12).map((n) => (
                    <button
                      key={n.id}
                      onClick={() =>
                        mutate((s) => ({
                          ...s,
                          notifications: s.notifications.map((x) => (x.id === n.id ? { ...x, is_read: true } : x)),
                        }))
                      }
                      className="w-full text-left px-4 py-3 border-b border-slate-800/60 last:border-0 hover:bg-slate-800/50 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        {!n.is_read && <span className="w-2 h-2 rounded-full bg-cyan-400 mt-1.5 shrink-0" />}
                        <div className={cn('min-w-0', n.is_read && 'pl-4')}>
                          <p className="text-sm font-medium text-white truncate">{n.title}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{n.message}</p>
                          <p className="text-[11px] text-slate-500 mt-1">{dateTime(n.created_date)}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 pl-3 border-l border-slate-800" aria-label="Account menu">
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-white leading-tight">{user?.full_name || user?.email}</p>
                  <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
                </div>
                <Avatar name={user?.email} className="h-10 w-10" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => api.resetDemoData()}>
                <ShieldCheck className="w-4 h-4" />
                Reset demo data
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout} className="text-red-400 data-[highlighted]:text-red-300">
                <LogOut className="w-4 h-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
