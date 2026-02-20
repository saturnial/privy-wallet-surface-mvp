# Privy Wallet Management Surface MVP

An enterprise payments wallet prototype built on Privy's embedded wallet infrastructure. Demonstrates both a standalone wallet app and an embeddable widget that host applications (like Gusto) can integrate with custom branding.

## What This Demonstrates

- **Embeddable `<PrivyWalletWidget />`** — drop-in widget with per-host branding, compact mode, and inline auth
- **Gusto embedding demo** (`/gusto`) — simulated host app embedding the widget with custom teal branding
- **Real authentication** via Privy (email login with embedded wallet creation)
- **Two interface modes** — Abstracted (USD) and Crypto-Native (ETH + USDC) — togglable from the header
- **Live-updating transaction list** — 3-second polling keeps balances and activity current
- **Send/Receive as modal overlays** — the wallet screen stays fixed in place
- **Mocked data layer** for deterministic, reliable demos (in-memory store, no database)
- **Optional testnet mode** for real onchain transactions behind a feature flag

## Quick Start

```bash
# Install dependencies
npm install

# Copy env file and add your Privy App ID
cp .env.local.example .env.local
# Edit .env.local with your NEXT_PUBLIC_PRIVY_APP_ID

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the standalone wallet, or [http://localhost:3000/gusto](http://localhost:3000/gusto) for the Gusto embedding demo.

## Gusto Embedding Demo

The `/gusto` route shows how a host application embeds the Privy wallet widget:

- Gusto-branded host shell (top nav, left nav, content area)
- Widget rendered in **compact mode** with Gusto teal (`#0A8080`) branding
- **Inline sign-in** — unauthenticated users see a sign-in button inside the widget (no redirect)
- **"Powered by Privy"** footer with optional customer support link
- Embed configuration panel showing the exact `BrandingConfig` parameters

The standalone app sidebar includes a "Gusto Demo" link that opens the embedded experience in a new tab.

### How Embedding Works

```tsx
import { PrivyWalletWidget } from '@/components/PrivyWalletWidget';

<PrivyWalletWidget
  branding={{
    brandName: 'Gusto',
    primaryColor: '#0A8080',
    surfaceStyle: 'compact',
    customerSupportUrl: 'https://support.gusto.com',
  }}
/>
```

The widget composes: `BrandingProvider` > `WidgetFrame` > `WidgetAuth` > `WalletDashboard`. All sub-components read branding from context — no prop drilling.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_PRIVY_APP_ID` | Yes | Your Privy App ID from the [Privy Dashboard](https://dashboard.privy.io/) |
| `NEXT_PUBLIC_ENABLE_TESTNET_MODE` | No | Set to `true` to enable onchain testnet sends (default: `false`) |
| `NEXT_PUBLIC_DEMO_FORCE_MODE` | No | Set to `abstracted` or `crypto` to lock the interface mode and hide the toggle |
| `NEXT_PUBLIC_USDC_ADDRESS` | No | USDC contract address on your testnet (e.g., Base Sepolia) for real USDC sends |

### Getting a Privy App ID

1. Go to [dashboard.privy.io](https://dashboard.privy.io/)
2. Create a new app (or use an existing one)
3. Copy the App ID from your app settings
4. Make sure "Email" is enabled as a login method in the dashboard

## Two Interface Modes

The app supports two interface modes, toggled via a pill-style control in the header (standalone) or widget header (embedded):

### Abstracted Mode (Default)

The standard fintech-style experience. All crypto details are hidden — users see USD balances, send to named recipients, and never encounter wallet addresses, token tickers, or transaction hashes.

### Crypto-Native Mode

A bare-bones crypto wallet experience with support for exactly two assets: **ETH** and **USDC**. Features:

- **Unified USD balance** with expandable token breakdown (ETH + USDC)
- **Onchain activity** list with transaction hashes linked to the block explorer
- **Send flow**: asset selector, manual address entry (0x-validated), amount, confirmation
- **Receive**: full wallet address display with copy button

### USDC Support

In crypto mode, USDC is a first-class asset alongside ETH:
- **Mock mode**: USDC balance is seeded at 250.00 USDC with a seed receive transaction
- **Testnet mode**: If `NEXT_PUBLIC_USDC_ADDRESS` is set, the app reads the real ERC-20 balance and sends via `transfer()` with 6 decimals. If the address is not configured or the call fails, it falls back to mocked balances

### Forcing a Mode

Set `NEXT_PUBLIC_DEMO_FORCE_MODE=crypto` (or `abstracted`) to lock the interface to a single mode. When forced, the toggle is hidden.

## Mock Mode vs Testnet Mode

### Mock Mode (Default)

All transactions are simulated in-memory. The app seeds each new user with:
- $1,250.00 USD balance (Abstracted) / 0.6 ETH + 250 USDC balance (Crypto)
- Seed transactions (deposits)
- 3 pre-seeded recipients (Abstracted mode)

Send and receive operations update the in-memory balance. Data resets on server restart.

### Testnet Mode

When `NEXT_PUBLIC_ENABLE_TESTNET_MODE=true`:
- A "Testnet Mode" banner appears on the Abstracted dashboard
- In Abstracted mode, after completing a mock send, a "Send Onchain (Testnet)" button appears
- In Crypto mode, sends attempt real onchain transactions (ETH via `sendTransaction`, USDC via ERC-20 `transfer`)
- Transaction hashes are displayed with links to the block explorer

## Architecture

```
app/
  layout.tsx                      → Root layout (Providers only, no shell)
  (standalone)/
    layout.tsx                    → AppShell wrapper (header + sidebar + footer)
    page.tsx                      → Standalone wallet (BrandingProvider + AuthGuard + WalletDashboard)
    login/page.tsx                → Privy email authentication
    send/page.tsx                 → Redirect to /
    receive/page.tsx              → Redirect to /
    settings/page.tsx             → Redirect to /
  (embedded)/
    gusto/page.tsx                → Gusto host shell embedding PrivyWalletWidget
  api/
    user/route.ts                 → User CRUD
    transactions/route.ts         → Transaction CRUD + balance mutation
    statements/route.ts           → CSV export
    recipients/route.ts           → Recipient list

components/
  PrivyWalletWidget/
    widgetTypes.ts                → BrandingConfig, SurfaceStyle, WidgetProps types
    BrandingContext.tsx            → React Context + useBranding() + useCompact() hooks
    WidgetFrame.tsx               → Card container (branded header, mode toggle, footer)
    WidgetAuth.tsx                → Inline sign-in panel
    WalletDashboard.tsx           → Dashboard logic (data fetching, state, modals, polling)
    PrivyWalletWidget.tsx         → Composition root
    index.ts                      → Barrel exports

  Providers.tsx                   → PrivyProvider + InterfaceModeProvider
  AuthGuard.tsx                   → Auth redirect guard
  AppShell.tsx                    → Sidebar + header + footer (standalone only)
  Sidebar.tsx                     → Wallet / Settings nav + Gusto Demo link
  Modal.tsx                       → Focus-trapped modal overlay
  ModeToggle.tsx                  → Abstracted/Crypto toggle (used in both AppShell and WidgetFrame)
  BalanceCard.tsx                 → USD balance (compact-aware)
  ActionButtons.tsx               → Send / Receive buttons (compact-aware)
  TransactionList.tsx             → Activity list (compact-aware)
  TransactionRow.tsx              → Transaction row (compact-aware)
  SendFlow.tsx                    → 4-step send wizard (branding-aware)
  SettingsView.tsx                → Settings content
  DebugPanel.tsx                  → Wallet address debug info

  crypto/
    CryptoBalanceCard.tsx         → Unified USD balance + token breakdown (compact-aware)
    CryptoActionButtons.tsx       → Send / Receive buttons (compact-aware)
    CryptoTransactionList.tsx     → Onchain activity list (compact-aware)
    CryptoTransactionRow.tsx      → Tx row with hash link (compact-aware)
    CryptoSendFlow.tsx            → Crypto send wizard (branding-aware)
    CryptoReceive.tsx             → Address display + copy
    CopyableAddress.tsx           → Truncated address with copy-on-click

lib/
  branding.ts                     → Branding presets (privyDefaultBranding, gustoBranding)
  config.ts                       → Feature flags + testnet config
  mode.ts                         → InterfaceMode context + provider
  mockStore.ts                    → In-memory store (USD/abstracted)
  cryptoMockStore.ts              → In-memory store (ETH + USDC)
  types.ts                        → TypeScript interfaces
  wallet.ts                       → Testnet transaction helpers
  utils.ts                        → Formatting utilities
```

## Tech Stack

- **Next.js** (App Router with route groups)
- **TypeScript**
- **TailwindCSS 4**
- **Privy React SDK** (`@privy-io/react-auth`)
- **ethers.js v6** (testnet mode only)

## Scope Constraints

This is a narrow, opinionated prototype. By design, it does **not** include:
- Tokens beyond ETH and USDC
- Chain switching or network selection
- Token imports, swaps, or NFTs
- Production security hardening
- Database persistence
- Compliance or KYC logic
