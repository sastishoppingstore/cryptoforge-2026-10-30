import { Navigate, Route, Routes } from 'react-router-dom'
import PublicLayout from './components/layout/PublicLayout'
import AppLayout from './components/layout/AppLayout'
import { RequireAdmin, RequireAuth } from './lib/auth'

import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Fund from './pages/Fund'
import Transfer from './pages/Transfer'
import Withdraw from './pages/Withdraw'
import Plans from './pages/Plans'
import Transactions from './pages/Transactions'
import Referrals from './pages/Referrals'
import Market from './pages/Market'
import Support from './pages/Support'
import NotFound from './pages/NotFound'

import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminPlans from './pages/admin/AdminPlans'
import AdminWithdrawals from './pages/admin/AdminWithdrawals'
import AdminProfits from './pages/admin/AdminProfits'
import AdminNotifications from './pages/admin/AdminNotifications'

/**
 * The live app uses PascalCase routes (/Dashboard, /Plans ...). Lowercase aliases are
 * registered too, because typing /dashboard by hand should not 404.
 */
const ALIASES = [
  ['dashboard', 'Dashboard'],
  ['fund', 'Fund'],
  ['transfer', 'Transfer'],
  ['withdraw', 'Withdraw'],
  ['plans', 'Plans'],
  ['transactions', 'Transactions'],
  ['referrals', 'Referrals'],
  ['market', 'Market'],
  ['support', 'Support'],
  ['home', 'Home'],
  ['login', 'Login'],
  ['admin', 'AdminDashboard'],
  ['admin-users', 'AdminUsers'],
  ['admin-plans', 'AdminPlans'],
  ['admin-withdrawals', 'AdminWithdrawals'],
  ['admin-profits', 'AdminProfits'],
  ['admin-notifications', 'AdminNotifications'],
]

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* public marketing shell — landing page only */}
      <Route element={<PublicLayout />}>
        <Route path="/Home" element={<Home />} />
      </Route>

      {/*
        Authenticated app shell. Plans and Market live here (not in the public shell)
        because the live app gates them behind login too — visiting /Plans signed out
        redirects to the login screen.
      */}
      <Route
        element={
          <RequireAuth>
            <AppLayout />
          </RequireAuth>
        }
      >
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Fund" element={<Fund />} />
        <Route path="/Transfer" element={<Transfer />} />
        <Route path="/Withdraw" element={<Withdraw />} />
        <Route path="/Plans" element={<Plans />} />
        <Route path="/Market" element={<Market />} />
        <Route path="/Transactions" element={<Transactions />} />
        <Route path="/Referrals" element={<Referrals />} />
        <Route path="/Support" element={<Support />} />

        <Route
          path="/AdminDashboard"
          element={
            <RequireAdmin>
              <AdminDashboard />
            </RequireAdmin>
          }
        />
        <Route
          path="/AdminUsers"
          element={
            <RequireAdmin>
              <AdminUsers />
            </RequireAdmin>
          }
        />
        <Route
          path="/AdminPlans"
          element={
            <RequireAdmin>
              <AdminPlans />
            </RequireAdmin>
          }
        />
        <Route
          path="/AdminWithdrawals"
          element={
            <RequireAdmin>
              <AdminWithdrawals />
            </RequireAdmin>
          }
        />
        <Route
          path="/AdminProfits"
          element={
            <RequireAdmin>
              <AdminProfits />
            </RequireAdmin>
          }
        />
        <Route
          path="/AdminNotifications"
          element={
            <RequireAdmin>
              <AdminNotifications />
            </RequireAdmin>
          }
        />
      </Route>

      {ALIASES.map(([from, to]) => (
        <Route key={from} path={`/${from}`} element={<Navigate to={`/${to}`} replace />} />
      ))}

      <Route path="/" element={<Navigate to="/Home" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
