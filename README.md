# Privy Wallet Management Surface MVP

An enterprise payments wallet prototype built on Privy's embedded wallet infrastructure. This app demonstrates how to build both an abstracted fintech-style wallet UI and a crypto-native wallet experience, togglable from a single interface.

## What This Demonstrates

- **Real authentication** via Privy (email login with embedded wallet creation)
- **Two interface modes** — Abstracted (USD) and Crypto-Native (ETH + USDC) — togglable from the header
- **Sidebar navigation** with Wallet and Settings views
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

Open [http://localhost:3000](http://localhost:3000).

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

## Layout

### Header
- **Left**: Product title ("Wallet")
- **Right**: Mode toggle (Abstracted / Crypto) — the only CTA in the header

### Sidebar
- **Wallet** — default view showing balance, activity, Send/Receive buttons
- **Settings** — display name, debug panel toggle, sign out

### Send / Receive Modals
Clicking "Send" or "Receive" opens a modal overlay. The underlying wallet screen remains visible and fixed — no route change occurs. Modals support:
- Internal steps (form, confirm, success)
- Dismiss via X button or Escape key
- Focus trap and basic accessibility

The `/send`, `/receive`, and `/settings` routes redirect to `/` since all actions happen on the main page.

## Two Interface Modes

The app supports two interface modes, toggled via a pill-style control in the header:

### Abstracted Mode (Default)

The standard fintech-style experience. All crypto details are hidden — users see USD balances, send to named recipients, and never encounter wallet addresses, token tickers, or transaction hashes.

### Crypto-Native Mode

A bare-bones crypto wallet experience with support for exactly two assets: **ETH** and **USDC**. Features:

- **Asset selector** (ETH / USDC) persisted in localStorage
- **Balance display** for the selected asset with wallet address and network badge
- **Onchain activity** list with transaction hashes linked to the block explorer
- **Send flow**: manual address entry (0x-validated), amount in selected asset, confirmation showing token/network/address
- **Receive**: full wallet address display with Copy Address button

### USDC Support

In crypto mode, USDC is a first-class asset alongside ETH:
- **Mock mode**: USDC balance is seeded at 250.00 USDC with a seed receive transaction
- **Testnet mode**: If `NEXT_PUBLIC_USDC_ADDRESS` is set, the app reads the real ERC-20 balance and sends via `transfer()` with 6 decimals. If the address is not configured or the call fails, it falls back to mocked balances
- USDC is not available in Abstracted mode — it is crypto-mode only

### Forcing a Mode

Set `NEXT_PUBLIC_DEMO_FORCE_MODE=crypto` (or `abstracted`) to lock the interface to a single mode. When forced, the toggle is hidden. This is useful for demos where you want to show only one experience.

The selected mode persists across page refresh via localStorage.

## Mock Mode vs Testnet Mode

### Mock Mode (Default)

All transactions are simulated in-memory. The app seeds each new user with:
- $1,250.00 USD balance (Abstracted) / 0.6 ETH + 250 USDC balance (Crypto)
- Seed transactions (deposits)
- 3 pre-seeded recipients (Abstracted mode)

Send and receive operations update the in-memory balance. Data resets on server restart. This mode requires no blockchain interaction and works without testnet funds.

### Testnet Mode

When `NEXT_PUBLIC_ENABLE_TESTNET_MODE=true`:
- A "Testnet Mode" banner appears on the Abstracted dashboard
- In Abstracted mode, after completing a mock send, a "Send Onchain (Testnet)" button appears
- In Crypto mode, sends attempt real onchain transactions (ETH via `sendTransaction`, USDC via ERC-20 `transfer`)
- Transaction hashes are displayed with links to the block explorer

Testnet mode is **additive** — it doesn't replace the mock flow in Abstracted mode. The standard send/receive operations remain mocked for reliability.

To use testnet mode, the embedded wallet needs Base Sepolia ETH. You can get testnet ETH from a Base Sepolia faucet.

## Terminology

This project uses "onchain" (one word, no hyphen) consistently — not "on-chain" or "on chain".

## Architecture

```
app/
  page.tsx              → Main wallet view (balance, activity, modals)
  login/page.tsx        → Privy email authentication
  send/page.tsx         → Redirect to /
  receive/page.tsx      → Redirect to /
  settings/page.tsx     → Redirect to /
  api/
    user/route.ts       → User CRUD
    transactions/route.ts → Transaction CRUD + balance mutation (abstracted + crypto)
    statements/route.ts → CSV export
    recipients/route.ts → Recipient list

components/
  Providers.tsx         → PrivyProvider + InterfaceModeProvider wrapper
  AuthGuard.tsx         → Auth redirect guard
  AppShell.tsx          → Sidebar + header (title + mode toggle) + main content
  Sidebar.tsx           → Wallet / Settings navigation
  Modal.tsx             → Shared modal with focus trap, escape, X button
  ModeToggle.tsx        → Abstracted/Crypto pill-style toggle
  SettingsView.tsx      → Settings content (display name, debug toggle, logout)
  BalanceCard.tsx       → USD balance display
  ActionButtons.tsx     → Send / Receive / Statements (callbacks, not links)
  TransactionList.tsx   → Activity list
  TransactionRow.tsx    → Single transaction row
  SendFlow.tsx          → 4-step send wizard (abstracted)
  DebugPanel.tsx        → Wallet address (hidden by default)

  crypto/
    CryptoAssetSelector.tsx    → ETH / USDC pill-style selector
    CryptoBalanceCard.tsx      → Balance for selected asset + address + network badge
    CryptoActionButtons.tsx    → Send / Receive buttons (callbacks, not links)
    CryptoTransactionList.tsx  → "Onchain Activity" list
    CryptoTransactionRow.tsx   → Tx row with address, asset, amount, tx hash link
    CryptoSendFlow.tsx         → 4-step crypto send wizard (ETH or USDC)
    CryptoReceive.tsx          → Wallet address display + copy button + asset badge

lib/
  config.ts             → Branding + feature flags + force mode + USDC address
  mode.ts               → InterfaceMode context, provider, useInterfaceMode hook
  mockStore.ts          → In-memory data store (USD/abstracted)
  cryptoMockStore.ts    → In-memory data store (ETH + USDC / crypto)
  types.ts              → TypeScript interfaces (including CryptoAsset)
  wallet.ts             → Testnet transaction helpers (ETH + USDC ERC-20)
  utils.ts              → Formatting utilities
```

## Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **TailwindCSS 4**
- **Privy React SDK** (`@privy-io/react-auth`)
- **ethers.js v6** (testnet mode only)

## Configuration

Branding and feature flags are configured in `lib/config.ts`:

```typescript
{
  logoText: 'Privy Wallet',
  primaryColor: '#6851FF',
  customerName: 'Acme Corp',
  enableTestnetMode: false,
  testnet: {
    usdcAddress: '',  // Set via NEXT_PUBLIC_USDC_ADDRESS
    // ...
  },
  // ...
}
```

## Scope Constraints

This is a narrow, opinionated prototype. By design, it does **not** include:
- Tokens beyond ETH and USDC
- Chain switching or network selection
- Token imports, swaps, or NFTs
- Production security hardening
- Database persistence
- Compliance or KYC logic
