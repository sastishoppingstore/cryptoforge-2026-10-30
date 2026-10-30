import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AlertCircle, ArrowLeft, CheckCircle2, Copy, KeyRound, Lock, Mail, ShieldCheck } from 'lucide-react'
import { Button } from '../components/ui/button'
import { Input, Label, Spinner } from '../components/ui/form'
import { useToast } from '../components/ui/toast'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { cn } from '../lib/utils'

export default function Login() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { user, login, register, verifyOtp } = useAuth()

  const [mode, setMode] = useState('login')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [otpEcho, setOtpEcho] = useState('')
  const [form, setForm] = useState({ email: '', password: '', confirm: '', code: '', newPassword: '' })

  const fromUrl = params.get('from_url') || ''
  const refCode = params.get('ref') || ''

  // Already signed in? Bounce straight through.
  useEffect(() => {
    if (user && mode === 'login') {
      const dest = user.role === 'admin' ? '/AdminDashboard' : fromUrl || '/Dashboard'
      navigate(dest, { replace: true })
    }
  }, [user, mode, fromUrl, navigate])

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  const finish = (u) => {
    toast.success('Signed in', `Welcome back, ${u.full_name || u.email}`)
    navigate(u.role === 'admin' ? '/AdminDashboard' : fromUrl || '/Dashboard', { replace: true })
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      if (mode === 'login') {
        finish(await login(form.email.trim(), form.password))
      } else if (mode === 'register') {
        if (form.password !== form.confirm) throw new Error('Passwords do not match')
        const res = await register({ email: form.email.trim(), password: form.password, referred_by: refCode || null })
        setOtpEcho(res.otp || '')
        setMode('otp')
        toast.info('Verification code sent', 'Demo mode: the code is shown on screen instead of emailed.')
      } else if (mode === 'otp') {
        finish(await verifyOtp({ email: form.email.trim(), otp_code: form.code.trim() }))
      } else if (mode === 'forgot') {
        const res = await api.auth.resetPasswordRequest(form.email.trim())
        setOtpEcho(res.otp || '')
        setMode('reset')
        toast.info('Reset code sent', 'Demo mode: the code is shown on screen instead of emailed.')
      } else if (mode === 'reset') {
        await api.auth.resetPassword({ email: form.email.trim(), otp_code: form.code.trim(), password: form.newPassword })
        toast.success('Password updated', 'You can sign in with your new password.')
        setMode('login')
        setForm((f) => ({ ...f, password: '', confirm: '', code: '', newPassword: '' }))
      }
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  const resend = async () => {
    try {
      const res = await api.auth.resendOtp(form.email.trim())
      setOtpEcho(res.otp || '')
      toast.info('New code generated', 'Demo mode: the code is shown on screen instead of emailed.')
    } catch (err) {
      setError(err.message)
    }
  }

  const TITLES = {
    login: ['Welcome to CryptoForge', 'Sign in to continue'],
    register: ['Create your account', 'Start investing in mining plans'],
    otp: ['Verify your email', `We sent a 6-digit code to ${form.email}`],
    forgot: ['Reset your password', 'We will generate a reset code'],
    reset: ['Choose a new password', 'Enter the code and your new password'],
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="panel bg-slate-900 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl grad-btn flex items-center justify-center on-accent font-extrabold text-2xl mx-auto mb-5">
              C
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{TITLES[mode][0]}</h1>
            <p className="text-slate-400 mt-2 text-sm">{TITLES[mode][1]}</p>
          </div>

          {mode !== 'login' && (
            <button
              onClick={() => {
                setMode('login')
                setError('')
              }}
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </button>
          )}

          {mode === 'login' && (
            <>
              <button
                onClick={() => toast.info('Google sign-in not wired up', 'The demo build has no OAuth provider. Use the email/password form.')}
                className="w-full h-11 rounded-xl border border-slate-700 bg-slate-800/40 flex items-center justify-center gap-3 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
              >
                <GoogleMark />
                Continue with Google
              </button>
              <div className="flex items-center gap-4 my-6">
                <span className="h-px flex-1 bg-slate-800" />
                <span className="text-xs font-semibold text-slate-500">OR</span>
                <span className="h-px flex-1 bg-slate-800" />
              </div>
            </>
          )}

          <form onSubmit={submit} className="space-y-5">
            {(mode === 'login' || mode === 'register' || mode === 'forgot') && (
              <Field label="Email" icon={Mail}>
                <Input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={set('email')}
                  className="pl-10"
                />
              </Field>
            )}

            {(mode === 'login' || mode === 'register') && (
              <Field label="Password" icon={Lock}>
                <Input
                  type="password"
                  required
                  autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                  placeholder={mode === 'register' ? 'Min. 8 characters' : '••••••••'}
                  value={form.password}
                  onChange={set('password')}
                  className="pl-10"
                />
              </Field>
            )}

            {mode === 'register' && (
              <Field label="Confirm Password" icon={Lock}>
                <Input type="password" required placeholder="Re-enter password" value={form.confirm} onChange={set('confirm')} className="pl-10" />
              </Field>
            )}

            {(mode === 'otp' || mode === 'reset') && (
              <Field label="Verification code" icon={KeyRound}>
                <Input
                  required
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6-digit code"
                  value={form.code}
                  onChange={set('code')}
                  className="pl-10 tracking-[0.4em] font-semibold"
                />
              </Field>
            )}

            {mode === 'reset' && (
              <Field label="New Password" icon={Lock}>
                <Input type="password" required placeholder="Min. 8 characters" value={form.newPassword} onChange={set('newPassword')} className="pl-10" />
              </Field>
            )}

            {otpEcho && (
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
                <p className="text-xs text-cyan-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  Demo mode — no email is sent. Your code is:
                </p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xl font-extrabold tracking-[0.3em] text-white">{otpEcho}</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard?.writeText(otpEcho)
                      toast.success('Code copied')
                    }}
                    className="text-cyan-400 hover:text-cyan-300"
                    aria-label="Copy code"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {refCode && mode === 'register' && (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <p className="text-xs text-emerald-300">
                  Referral code <span className="font-bold">{refCode}</span> will be applied to your account.
                </p>
              </div>
            )}

            {error && (
              <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-sm text-red-300">{error}</p>
              </div>
            )}

            <Button type="submit" className="w-full" size="lg" disabled={busy}>
              {busy && <Spinner className="h-4 w-4" />}
              {{ login: 'Sign in', register: 'Create account', otp: 'Verify & continue', forgot: 'Send reset code', reset: 'Update password' }[mode]}
            </Button>
          </form>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
            {mode === 'login' && (
              <>
                <button onClick={() => { setMode('forgot'); setError('') }} className="text-slate-400 hover:text-cyan-400 transition-colors">
                  Forgot password?
                </button>
                <button onClick={() => { setMode('register'); setError('') }} className="text-slate-400 hover:text-cyan-400 transition-colors">
                  Need an account? Sign up
                </button>
              </>
            )}
            {mode === 'otp' && (
              <button onClick={resend} className="text-slate-400 hover:text-cyan-400 transition-colors mx-auto">
                Resend code
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 panel bg-slate-900/60 p-4">
          <p className="text-xs font-semibold text-slate-400 mb-2">Demo accounts</p>
          <div className="space-y-1.5 text-xs">
            <DemoRow role="Investor" email="investor@demo.com" password="demo1234" />
            <DemoRow role="Admin" email="admin@cryptomine.io" password="admin1234" />
          </div>
          <Link to="/Home" className="inline-block mt-3 text-xs text-cyan-400 hover:underline">
            ← Back to landing page
          </Link>
        </div>
      </div>
    </div>
  )
}

function DemoRow({ role, email, password }) {
  const toast = useToast()
  const fill = () => {
    const emailInput = document.querySelector('input[type="email"]')
    const pwInput = document.querySelector('input[type="password"]')
    if (emailInput && pwInput) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
      setter.call(emailInput, email)
      emailInput.dispatchEvent(new Event('input', { bubbles: true }))
      setter.call(pwInput, password)
      pwInput.dispatchEvent(new Event('input', { bubbles: true }))
      toast.info('Credentials filled', 'Press "Sign in" to continue.')
    }
  }
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-500">{role}</span>
      <span className="text-slate-300 font-mono text-[11px] truncate">{email}</span>
      <button onClick={fill} className="text-cyan-400 hover:underline shrink-0">
        use
      </button>
    </div>
  )
}

function Field({ label, icon: Icon, children }) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 z-10" />
        {children}
      </div>
    </div>
  )
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47a5.54 5.54 0 0 1-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A11.99 11.99 0 0 0 12 24z"
      />
      <path fill="#FBBC05" d="M5.27 14.29a7.2 7.2 0 0 1 0-4.58V6.62H1.29a12 12 0 0 0 0 10.76l3.98-3.09z" />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.7 0 3.99 2.47 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  )
}
