Build an MVP prototype for a Privy Wallet Management Surface.

This prototype must demonstrate:
	1.	Real Privy authentication and embedded wallet creation
	2.	A fully abstracted fintech-style wallet UI
	3.	Mocked balance + transaction history for deterministic UX
	4.	Optional testnet transfer mode behind a feature flag

This is not a general crypto wallet.
This is a narrow, opinionated enterprise payments wallet.

⸻

PRODUCT CONSTRAINTS (Must Follow)

Abstraction Rules

The UI must show only:
	•	“USD”
	•	Balance in USD
	•	Send USD
	•	Receive USD
	•	Activity
	•	Statements

Do NOT display:
	•	Chain names
	•	Token tickers (no USDC / ETH)
	•	Wallet addresses in primary UI
	•	Gas
	•	Network selection

Crypto is implementation detail only.

If needed, expose raw wallet address only in a hidden debug panel.

⸻

Scope Constraints
	•	Single asset: USD
	•	Single network (Base Sepolia if testnet mode enabled)
	•	No swaps
	•	No token import
	•	No NFT support
	•	No chain switching
	•	No advanced wallet settings

This is a constrained enterprise payments surface.

⸻

Branding Constraints
	•	Privy-branded header
	•	Configurable via config.ts:
	•	logoText
	•	primaryColor
	•	customerName
	•	No deep customization
	•	Must include “Powered by Privy” somewhere in footer

⸻

TECH STACK
	•	Next.js (App Router)
	•	TypeScript
	•	TailwindCSS
	•	Privy React SDK
	•	Ethers (only if testnet mode enabled)
	•	In-memory store (or local JSON) for mocked balances and transactions

Do not use a database.

⸻

FEATURES TO BUILD

1. Authentication (REAL)

Use PrivyProvider with App ID from environment variable.
	•	Email login
	•	On login:
	•	Ensure embedded wallet exists
	•	Store wallet address server-side
	•	Do not show wallet address in main UI

Persist session normally via Privy SDK.

⸻

2. Dashboard (Mocked Data Layer)

Display:
	•	USD Balance
	•	Recent Activity (transaction list)
	•	Buttons:
	•	Send USD
	•	Receive USD
	•	Download Statements (CSV export)

Balance logic:
	•	Stored as balanceCents in local server memory
	•	Seed default: $1,250.00

⸻

3. Receive USD

Screen includes:
	•	“Deposit Instructions” text
	•	Button: “Simulate Deposit $100”

When clicked:
	•	Increase balance
	•	Add transaction to history

Optional:
	•	Collapsible debug panel revealing wallet address

⸻

4. Send USD (Mock Mode Default)

Flow:
	1.	Select recipient (pre-seeded whitelist)
	2.	Enter amount
	3.	Confirmation screen
	4.	Success screen

On submit:
	•	Reduce balance
	•	Create transaction entry
	•	Show success state

Validation:
	•	Amount must be positive
	•	Cannot exceed balance
	•	Recipient must be selected

⸻

5. Optional Testnet Mode (Feature Flag)

Add environment flag:

ENABLE_TESTNET_MODE=true

If enabled:
	•	Add “Send On-Chain (Testnet)” button
	•	Use embedded wallet signer
	•	Send small fixed amount (e.g., 0.001 ETH or test token)
	•	Display transaction hash on success screen
	•	Clearly label this “Testnet Mode”

If disabled:
	•	Do not expose any on-chain functionality

The default behavior must be fully mocked and deterministic.

⸻

6. Settings Page

Include:
	•	Display name edit
	•	Logout
	•	Debug panel toggle

⸻

DATA MODEL (Minimum)

User:
	•	id
	•	email
	•	walletAddress
	•	displayName
	•	balanceCents
	•	createdAt

Recipient:
	•	id
	•	name
	•	nickname
	•	createdAt

Transaction:
	•	id
	•	type (“send” | “receive”)
	•	amountCents
	•	counterpartyLabel
	•	createdAt
	•	optional txHash

Seed at least 3 recipients.

⸻

FILE STRUCTURE (Propose Before Coding)

Before implementing, outline:
	•	Routes
	•	API endpoints
	•	Folder structure
	•	Mock store architecture
	•	Config object
	•	Testnet toggle behavior

Then implement.

Suggested structure:

app/
  page.tsx
  send/
  receive/
  settings/

components/
  BalanceCard.tsx
  TransactionList.tsx
  SendFlow.tsx
  ReceivePanel.tsx

lib/
  mockStore.ts
  wallet.ts
  config.ts

app/api/
  user/
  transactions/


⸻

NON-GOALS
	•	No production security hardening
	•	No database
	•	No compliance logic
	•	No multi-chain logic
	•	No token management UI

⸻

README REQUIREMENTS

Include:
	•	Setup instructions
	•	How to add Privy App ID
	•	How to enable testnet mode
	•	Explanation of mock mode vs testnet mode
	•	Why crypto details are abstracted in UI

⸻

IMPORTANT

This prototype must demonstrate:
	•	Product scoping discipline
	•	Clear abstraction boundaries
	•	Enterprise-ready UX
	•	Separation between wallet infrastructure and user experience
	•	Deterministic demo reliability

Start by outlining the architecture and route structure.
Then implement the application.