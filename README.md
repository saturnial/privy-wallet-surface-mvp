# Privy Wallet Management Surface MVP

An enterprise payments wallet prototype built on Privy's embedded wallet infrastructure. This app demonstrates how to build a fully abstracted fintech-style wallet UI where all crypto implementation details are hidden from the end user.

## What This Demonstrates

- **Real authentication** via Privy (email login with embedded wallet creation)
- **Abstracted UX** showing only USD — no chain names, token tickers, wallet addresses, or gas in the primary UI
- **Mocked data layer** for deterministic, reliable demos (in-memory store, no database)
- **Optional testnet mode** for real on-chain transactions behind a feature flag

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
| `NEXT_PUBLIC_ENABLE_TESTNET_MODE` | No | Set to `true` to enable on-chain testnet sends (default: `false`) |
| `NEXT_PUBLIC_DEMO_FORCE_MODE` | No | Set to `abstracted` or `crypto` to lock the interface mode and hide the toggle |

### Getting a Privy App ID

1. Go to [dashboard.privy.io](https://dashboard.privy.io/)
2. Create a new app (or use an existing one)
3. Copy the App ID from your app settings
4. Make sure "Email" is enabled as a login method in the dashboard

## Two Interface Modes

The app supports two interface modes, toggled via a pill-style control in the header:

### Abstracted Mode (Default)

The standard fintech-style experience. All crypto details are hidden — users see USD balances, send to named recipients, and never encounter wallet addresses, token tickers, or transaction hashes. This is the original MVP experience and remains completely unchanged.

### Crypto-Native Mode

A bare-bones crypto wallet experience. Users see their ETH balance, full wallet address, network badge (Base Sepolia), and on-chain activity with transaction hashes linked to the block explorer. The send flow requires manual address entry (0x-validated) and ETH amount input, with a confirmation screen showing token, network, and address. The receive screen displays the full wallet address with a copy button.

### Forcing a Mode

Set `NEXT_PUBLIC_DEMO_FORCE_MODE=crypto` (or `abstracted`) to lock the interface to a single mode. When forced, the toggle is hidden. This is useful for demos where you want to show only one experience.

The selected mode persists across page refresh via localStorage.

## Mock Mode vs Testnet Mode

### Mock Mode (Default)

All transactions are simulated in-memory. The app seeds each new user with:
- $1,250.00 balance
- 2 initial transactions (deposits)
- 3 pre-seeded recipients

Send and receive operations update the in-memory balance. Data resets on server restart. This mode requires no blockchain interaction and works without testnet funds.

### Testnet Mode

When `NEXT_PUBLIC_ENABLE_TESTNET_MODE=true`:
- A "Testnet Mode" banner appears on the dashboard
- After completing a mock send, a "Send On-Chain (Testnet)" button appears
- This sends 0.001 ETH on Base Sepolia using the embedded wallet
- The transaction hash is displayed with a link to the block explorer

Testnet mode is **additive** — it doesn't replace the mock flow. The standard send/receive operations remain mocked for reliability.

To use testnet mode, the embedded wallet needs Base Sepolia ETH. You can get testnet ETH from a Base Sepolia faucet.

## Why Crypto Details Are Abstracted

This prototype represents an enterprise payments surface where:
- End users think in **USD**, not tokens
- The underlying rails (stablecoins on Base) are an **implementation detail**
- Wallet addresses, gas fees, and chain names create unnecessary cognitive load
- The UX should feel like Venmo or a banking app, not a crypto wallet

The wallet address is only visible in a debug panel (toggled from Settings), intended for developers and support, not end users.

## Architecture

```
app/
  page.tsx              → Dashboard (balance, activity, action buttons)
  login/page.tsx        → Privy email authentication
  send/page.tsx         → Multi-step send flow
  receive/page.tsx      → Simulate deposit + debug panel
  settings/page.tsx     → Display name, logout, debug toggle
  api/
    user/route.ts       → User CRUD
    transactions/route.ts → Transaction CRUD + balance mutation
    statements/route.ts → CSV export
    recipients/route.ts → Recipient list

components/
  Providers.tsx         → PrivyProvider + InterfaceModeProvider wrapper
  AuthGuard.tsx         → Auth redirect guard
  AppShell.tsx          → Header + footer layout + mode toggle
  ModeToggle.tsx        → Abstracted/Crypto pill-style toggle
  BalanceCard.tsx       → USD balance display
  ActionButtons.tsx     → Send / Receive / Statements
  TransactionList.tsx   → Activity list
  TransactionRow.tsx    → Single transaction row
  SendFlow.tsx          → 4-step send wizard
  DebugPanel.tsx        → Wallet address (hidden by default)

  crypto/
    CryptoBalanceCard.tsx      → ETH balance + address + network badge
    CryptoActionButtons.tsx    → Send ETH / Receive ETH buttons
    CryptoTransactionList.tsx  → "On-chain Activity" list
    CryptoTransactionRow.tsx   → Tx row with address, ETH, tx hash link
    CryptoSendFlow.tsx         → 4-step crypto send wizard
    CryptoReceive.tsx          → Wallet address display + copy button

lib/
  config.ts             → Branding + feature flags + force mode
  mode.ts               → InterfaceMode context, provider, useInterfaceMode hook
  mockStore.ts          → In-memory data store (USD/abstracted)
  cryptoMockStore.ts    → In-memory data store (ETH/crypto)
  types.ts              → TypeScript interfaces
  wallet.ts             → Testnet transaction helpers
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
  // ...
}
```

## Scope Constraints

This is a narrow, opinionated prototype. By design, it does **not** include:
- Multiple assets or tokens
- Chain switching or network selection
- Token imports, swaps, or NFTs
- Production security hardening
- Database persistence
- Compliance or KYC logic
