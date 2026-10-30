# CryptoForge / CryptoMine — cloned crypto-mining investment app

A working, editable re-implementation of `https://crypto-forge-06f49e9a.base44.app`: a dark-themed
crypto **mining-investment platform** with a user dashboard (fund / invest / transfer / withdraw /
referrals / market / support) and a full admin panel.

Built with **Vite + React 18 + Tailwind CSS v3 + Radix UI + Recharts + lucide-react**.

---

## Quick start

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # serve the built bundle
```

Requires Node 18+ (developed on Node 24).

### Demo accounts

| Role     | Email                  | Password    |
| -------- | ---------------------- | ----------- |
| Investor | `investor@demo.com`    | `demo1234`  |
| Admin    | `admin@cryptomine.io`  | `admin1234` |

The login screen has click-to-fill shortcuts for both. Anyone can also **sign up** — the whole
auth flow is real (see *Sign-up / OTP* below).

Everything lives in `localStorage`, so the data is yours to break. To start over:
**topbar avatar menu → Reset demo data** (or clear site data).

---

## How this was built

The live app is a base44 deployment. Its server does not publish source, and the shipped bundle is
minified, so a faithful **rebuild** was the only route to an editable project. The live app was
inspected directly (a disposable mailbox was used to complete real sign-up + login so every
authenticated route could be captured) and the following was extracted rather than guessed:

- the full route table and which routes are role-gated,
- the entity/field names (`User`, `InvestmentPlan`, `UserInvestment`, `Transaction`, `Referral`,
  `Notification`, `SupportTicket`),
- form-level validation rules (deposit minimum, withdrawal minimum, plan min/max, balance checks),
- the withdrawal lifecycle (pending → admin approve/decline),
- the profit-engine and referral-bonus formulas,
- the landing-page copy, all 8 sections, and the visual design tokens.

The mock SDK in `src/lib/api.js` deliberately mirrors the base44 client surface
(`api.auth.*`, `api.entities.*.filter/create/update/delete`) so page code reads like the original.

---

## Routes

| Path                                                              | Access    | Page                                    |
| ----------------------------------------------------------------- | --------- | --------------------------------------- |
| `/login`                                                          | public    | Sign in / sign up / OTP / reset (tabs)  |
| `/Home`                                                           | public    | Marketing landing page                  |
| `/Dashboard`                                                      | signed in | Balances, stats, live market, activity  |
| `/Fund`                                                           | signed in | Add funds (simulated payment)           |
| `/Transfer`                                                       | signed in | Send funds to another user              |
| `/Withdraw`                                                       | signed in | Request withdrawal + history            |
| `/Plans`                                                          | signed in | Investment plans + invest dialog        |
| `/Transactions`                                                   | signed in | Filterable history (`?type=`, `?q=`)    |
| `/Referrals`                                                      | signed in | Referral link, code, earnings           |
| `/Market`                                                         | signed in | Coin price table                        |
| `/Support`                                                        | signed in | Tickets + message threads               |
| `/AdminDashboard` `/AdminUsers` `/AdminPlans` `/AdminWithdrawals` `/AdminProfits` `/AdminNotifications` | admin     | Admin panel                             |
| anything else                                                     | —         | 404 (`Page Not Found`)                  |

Lowercase aliases (`/dashboard`, `/plans`, …) redirect to the PascalCase routes. Signing out and
hitting a protected route redirects to `/login?from_url=…` and returns you there after sign-in.

---

## What the app does

### Investor side

- **Dashboard** — account balance, total deposit, total profit, total withdrawn, referral bonus,
  active-plan count; three action tiles; live market list; recent transactions.
- **Fund Account** — quick-select amounts, min **$10 USDT**, payment-method picker, then a
  simulated checkout. Creates a `deposit` transaction and credits the wallet.
- **Investment Plans** — plan cards (profit band, min/max, duration, feature list) with an invest
  dialog that enforces min / max / sufficient-balance. Claims a `UserInvestment`, writes an
  `investment` transaction, debits the balance, and pays the referrer if this was the
  user's **first** investment.
- **Transfer** — send by email *or* user ID, optional note, confirmation step that resolves the
  recipient and shows the resulting balance. Writes paired `transfer_out` + `transfer_in`
  transactions and moves the money in one step.
- **Withdraw** — exchange name, wallet address, min **$10**, insufficient-balance and
  locked-account checks. Creates a `pending` withdrawal and lists history with status badges.
- **Transactions** — tabs for all / deposits / withdrawals / transfers in / transfers out / profits,
  plus in/out summaries and the topbar search (`?q=`).
- **Referrals** — referral link and code, copy button, X/Telegram share, referral list with status
  and earnings, "how it works" explainer. **10% of a referred user's first investment** is credited.
- **Market** — 10 coins with price, 24h/7d change, market cap and volume; "Refresh" applies a
  random walk so the table feels live.
- **Support** — create tickets (subject, priority, message), then chat in a threaded view.
- **Notifications** — bell with unread badge, dropdown list, mark-one/mark-all read.

### Admin side

- **Admin Dashboard** — users, deposits, active AUM, profits paid, pending payouts; distribution
  chart; pending-withdrawal and newest-user tables; one-click profit run.
- **User Management** — search/filter, per-user drill-down, promote/revoke admin, lock/unlock,
  delete, and credit/debit a balance (writes a transaction + notification).
- **Manage Plans** — full CRUD, accent colour, feature list, live/hidden toggle.
- **Withdrawals** — filter by status, copy wallet address, **approve** (debits the user,
  increments `total_withdrawn`, notifies) or **decline** with a reason.
- **Profit Distribution** — credits every active investment
  `capital × plan percentage × (30 ÷ duration_days)` — i.e. one month of the plan's quoted band —
  writing `profit` transactions and notifications, and recording the run.
- **Notifications** — broadcast to all investors or one specific user, with type + delivery log.

---

## Data model

All entities live in one `localStorage` document (`cryptoforge.db`, `SCHEMA_VERSION = 4`); the
schema version is checked on load and a fresh seed is written when it changes.

| Entity           | Notable fields                                                                                                                       |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `User`           | `email`, `full_name`, `role` (`user`/`admin`), `balance`, `total_deposit`, `total_profit`, `total_withdrawn`, `total_referral_bonus`, `referral_code`, `referred_by`, `is_locked`, `password_hashes` |
| `InvestmentPlan` | `name`, `description`, `minimum_investment`, `maximum_investment`, `profit_min`, `profit_max`, `duration_days`, `features[]`, `is_active`, `accent` |
| `UserInvestment` | `user_id`, `plan_id`, `plan_name`, `amount`, `status`, `profit_earned`, `start_date`                                                  |
| `Transaction`    | `user_id`, `type`, `amount`, `status`, `description`, `exchange_name`, `exchange_id`, `reference_id`                                  |
| `Referral`       | `referrer_id`, `referred_id`, `status`, `bonus_earned`                                                                                |
| `Notification`   | `user_id`, `title`, `message`, `type`, `is_read`                                                                                      |
| `SupportTicket`  | `subject`, `priority`, `status`, `messages[{ sender, sender_role, message, timestamp }]`                                              |

Transaction types: `deposit`, `withdrawal`, `transfer_in`, `transfer_out`, `investment`, `profit`,
`referral_bonus`, `bonus`.

---

## Sign-up / OTP

Real base44 sign-up is `POST /api/apps/{appId}/auth/register` followed by
`POST .../auth/verify-otp` — a 6-digit code is emailed. There is no mail server here, so the demo
**generates a real code, runs the same two-step flow, and prints the code on screen** in a panel
labelled *Demo mode — no email is sent*. Resend, and a full forgot/reset-password flow, work the
same way. Referral codes are carried through `?ref=CODE` on the sign-up link and linked at
verification time.

---

## What is simulated (and what to harden before real use)

| Area              | Here                                                       | Real deployment                                                          |
| ----------------- | ---------------------------------------------------------- | ------------------------------------------------------------------------ |
| Payments/deposits | "Simulate payment" button, no processor                     | Payment gateway or on-chain deposit addresses + webhook confirmation      |
| Withdrawals       | Admin clicks Approve                                       | Payout service, hot/cold wallet controls, KYC/AML, 2FA on approval        |
| Mining profits    | Admin-triggered run using the plan's percentage band        | Real mining telemetry/job writing signed, auditable ledger entries        |
| Market prices     | Static snapshot + random walk                               | Live price API                                                            |
| Persistence       | `localStorage` (per browser)                                | Server + database; no client-side writes to balances                      |
| Passwords         | SHA-256 (Web Crypto) in `localStorage`                      | Argon2id/bcrypt server-side, httpOnly session cookies, rate limiting      |
| Google sign-in    | Button shows "not wired up"                                 | OAuth provider                                                            |
| Emails/OTP        | Code echoed in the UI                                       | Transactional email/SMS provider                                          |

**No real cryptocurrency, money, or payment rail is touched anywhere in this project**, and no
deposit/withdrawal/transfer moves real value. Password hashing here is a hygiene detail, not a
security boundary — anything in browser storage is readable and editable by the user.

---

## Deliberate deviations from the live app

1. **Plans and Market stay gated behind login** (matching the live app), but the **landing page is
   public** here — in the live app even `/` redirects to `/login`. Keeping it public makes the
   clone demonstrable without an account.
2. **The sign-in card follows the theme.** In the live app the login screen is always light while
   the rest of the app is dark; here it participates in the theme toggle.
3. **The brand mismatch is preserved.** The live app's login card says *"Welcome to CryptoForge"*
   while its navbar, sidebar and footer say *"CryptoMine"*. That inconsistency was reproduced
   rather than "fixed", so the clone matches what shipped.
4. **The theme toggle actually works.** The live topbar shows a sun/moon button but the app is
   dark-only; here it switches a real light theme (see *Theming* below).
5. **Admin pages are a reconstruction, not a copy.** The live bundle contains the admin *nav labels*
   but no admin page components (no lazy chunks either) — they are role-gated server-side. They were
   rebuilt from the nav names plus the entity model, so they are functionally complete and
   consistent, but not pixel-identical to something that was never observable.
6. **Small additions** for usability: topbar search wired to Transactions, an "active plans"
   progress section on Plans, recipient shortcut chips on Transfer, and *Reset demo data*.
7. **Footer legal links are inert** (Terms, Privacy, AML…) — the live app's equivalents were not
   captured and are out of scope.

---

## Theming

The live app is dark-first, so the design is written once using normal Tailwind `slate` /
`cyan` / `emerald` utilities and the palette is defined as **CSS variables** in
`src/index.css` (`:root` = the live app's dark values, `html.light` = the light remap).
`tailwind.config.js` points the colour scales at those variables with the `<alpha-value>`
placeholder, so opacity modifiers like `bg-slate-800/50` and `border-cyan-500/30` keep working in
both themes without duplicating a single class. Surfaces that sit on a saturated gradient use the
`.on-accent` helper so they stay true white in light mode. An inline script in `index.html` applies
the stored theme before first paint, so there is no flash.

---

## Project structure

```
src/
  lib/
    db.js        # localStorage store, seed data, schema versioning, password hashing
    api.js       # mock base44-shaped SDK: auth + entities + admin operations
    auth.jsx     # AuthProvider, useAuth, RequireAuth, RequireAdmin
    theme.jsx    # theme provider (dark/light, persisted)
    useDb.js     # subscribes components to store mutations
    tx.js        # transaction type metadata
    utils.js     # cn(), currency/date formatting, ids
  data/market.js # coin list + random-walk drift
  components/
    ui/          # button, card, form, feedback (badge/dialog/tabs/table), select, dropdown, toast
    layout/      # AppLayout (sidebar + topbar), PublicLayout (navbar + footer)
    shared.jsx   # StatCard, TransactionRow, StatusBadge, CoinIcon, Delta
    MarketTicker.jsx
  pages/
    Home, Login, Dashboard, Fund, Transfer, Withdraw, Plans, Transactions,
    Referrals, Market, Support, NotFound, admin/*
  App.jsx        # route table + aliases
  index.css      # design tokens (dark + light), base styles
```

## Tech notes / trade-offs

- **JavaScript + JSX, not TypeScript.** Fewer moving parts for a clone of this size; the entity
  shapes are documented above instead of typed.
- **Tailwind v3, not v4.** Chosen so the class names extracted from the live app
  (`bg-gradient-to-r`, `bg-slate-900/50`, …) work verbatim.
- **Radix primitives, hand-rolled styling** rather than a component library — dialog/tabs/select
  get real focus handling and Escape-to-close, matching the original's stack.
- **One `localStorage` document + an event emitter** instead of Redux/Zustand: mutations notify
  subscribers, so every page stays in sync (including across browser tabs).
- **Recharts** powers the two area charts (landing performance, admin distributions).

## Known limitations

- No test suite.
- No server, so nothing is shared between browsers or users.
- Admin notifications have no read-receipt fan-out beyond the `is_read` flag.
- The profit engine is manual on purpose; a real system needs a scheduled, auditable job.
