Add Crypto-Native Mode + In-App Toggle (Demo Switch)

Extend the existing “Privy Wallet Management Surface” MVP to support two interface modes and a UI toggle to switch between them for demo/comparison purposes.

Modes:
	1.	Abstracted (Enterprise) — current implementation
	2.	Crypto-Native (Bare Bones) — new implementation

Do NOT remove or break the existing Abstracted mode.

This is a demo tool to show product tradeoffs, not a production customer feature.

⸻

Core Requirements

A) UI Toggle

Add a small “Mode” switch in the app shell (header area), visible after login:
	•	Label: Mode
	•	Options:
	•	Abstracted
	•	Crypto

Requirements:
	•	Switching mode updates the experience immediately.
	•	Persist selected mode in localStorage so refresh preserves the selection.
	•	Default to Abstracted if nothing is set.
	•	Also allow forcing a mode via env/config for reviewers:
	•	DEMO_FORCE_MODE=abstracted|crypto
	•	If set, hide the UI toggle and hard-lock the mode.

B) Shared Infrastructure

Both modes must share:
	•	Privy auth
	•	Embedded wallet creation
	•	Core routes/pages (dashboard, send, receive, settings)

Do not fork the entire app. Diverge only at presentation and semantics.

C) Two Experiences Must Be Visibly Different

The whole point is to show the tradeoffs.

⸻

Mode 1: Abstracted (Enterprise) — Preserve Existing Behavior

Must remain unchanged:
	•	UI displays only “USD”
	•	No chain/network names
	•	No token tickers
	•	No wallet address visible in primary UI
	•	No gas references
	•	Send/Receive/Activity/Statements using mock store for deterministic UX

Optional: address may exist only in a hidden debug panel.

⸻

Mode 2: Crypto-Native (Bare Bones) — New

Crypto mode must expose a minimal crypto wallet UI.

Dashboard changes

Display prominently:
	•	Wallet address (shortened, e.g. 0x12ab…89cd)
	•	Network (Base Sepolia if testnet is used)
	•	Asset label with ticker (e.g. ETH or USDC)

Balance card:
	•	Show crypto balance with ticker (e.g. 0.42 ETH)
	•	Do NOT translate to USD in this mode.

Activity:
	•	Rename section title to On-chain activity
	•	Show tx hash (shortened) when present.

Receive screen changes
	•	Show wallet address as the primary receive identifier
	•	Add “Copy address”
	•	Optional: QR code
	•	No “deposit instructions” abstraction.

Send flow changes
	•	Allow manual address entry (validated 0x + length)
	•	Show network and token being sent
	•	Confirmation screen must show:
	•	amount
	•	token
	•	destination address (shortened)
	•	network

Testnet behavior (optional but recommended)

If ENABLE_TESTNET_MODE=true:
	•	Crypto mode “Send” should perform a real testnet transaction using the embedded wallet signer (ethers).
	•	Display tx hash and status.
If disabled:
	•	Fall back to mocked “on-chain” tx objects in memory, but keep crypto semantics visible.

⸻

Still Minimal Scope (Do Not Add)

Even in crypto mode, do NOT add:
	•	Swaps
	•	Bridging
	•	Multi-chain selection
	•	Token import
	•	NFTs
	•	DeFi interactions

This is “bare bones wallet,” not MetaMask.

⸻

Implementation Guidance

1) Mode state

Create a single source of truth:
	•	lib/mode.ts:
	•	reads forced mode from env
	•	otherwise reads/writes localStorage
	•	exposes useInterfaceMode() hook

2) Presentation split (recommended pattern)

Keep routes the same, but switch components by mode:
	•	Dashboard:
	•	AbstractedDashboard
	•	CryptoDashboard
	•	Send:
	•	AbstractedSendFlow
	•	CryptoSendFlow
	•	Receive:
	•	AbstractedReceive
	•	CryptoReceive

Share lower-level components where possible.

3) Data

Keep existing mockStore for abstracted mode.

For crypto mode:
	•	Prefer real on-chain reads if feasible (only if testnet enabled).
	•	Otherwise create a separate cryptoMockStore that stores:
	•	tokenSymbol
	•	network
	•	txHash
but keep it minimal.

Do NOT introduce a database.

⸻

README update

Add a section:
	•	“Two interface modes”
	•	How to toggle in UI
	•	How to force mode via env
	•	Why the toggle exists (to illustrate product tradeoffs)
	•	What each mode is meant to prove

⸻

Deliverable

After changes:
	•	Abstracted mode still works exactly as before (deterministic)
	•	Crypto mode works and looks meaningfully different
	•	UI toggle reliably switches modes and persists
	•	Optional: crypto mode can execute real testnet send if enabled

Start by outlining the planned code changes and new files, then implement.