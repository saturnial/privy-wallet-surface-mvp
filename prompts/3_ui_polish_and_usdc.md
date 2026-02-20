The MVP is working but the UI/UX is sloppy. Refactor to implement the following UI and product changes precisely. Do not broaden scope beyond what is listed.s

------------------------------------------------------------
GOALS
------------------------------------------------------------
- Clean, consistent, fintech-quality layout
- Keep the core “wallet screen” fixed in place; actions happen in modals
- Make mode switching (Abstracted vs Crypto) the primary UI affordance
- Add USDC support for crypto mode (first-class, but not open-ended tokens)
- Move Settings to a sidebar
- Ensure “onchain” spelling (not “on-chain”)

------------------------------------------------------------
UI / IA CHANGES (MUST DO)
------------------------------------------------------------

1) Header: Mode toggle as the primary and sole CTA
- The header should contain:
  - Left: product title (e.g., “Wallet”)
  - Center/right: Mode toggle (Abstracted / Crypto) — this is the ONLY CTA in the header
- Remove Send/Receive buttons from the header entirely.
- Keep header minimal and clean.

2) Main view: fixed wallet screen + action entry points
- Main view should always show:
  - Balance card(s)
  - Activity list
  - (Crypto mode only) wallet address + network + asset selector (see USDC section)
- Add two primary buttons within the main content area (NOT header):
  - “Send”
  - “Receive”
- These open modals (see below).

3) Send + Receive as modals
- Clicking “Send” opens a modal overlay.
- Clicking “Receive” opens a modal overlay.
- When a modal is open:
  - The underlying wallet screen remains visible and fixed (no route change).
  - Modal has its own internal steps (form -> confirm -> success).
  - Modal can be dismissed via “X” and Escape key.
- Implement focus trap and basic accessibility (at minimum: focus initial field, return focus to triggering button on close).
- Do NOT navigate to /send or /receive routes when modals are used.
  - If those routes exist, either remove them or redirect to the main page.

4) Sidebar: Settings live in a sidebar
- Add a left sidebar (collapsible OK, but default open on desktop).
- Sidebar items:
  - Wallet (main)
  - Settings
- Settings view should render in the main area when selected, but keep the header and sidebar consistent.
- Wallet view is the default.
- Do not put Settings in the header.

5) Terminology
- Replace all instances of “on-chain” / “On-chain” with “onchain” / “Onchain”.
- Ensure Activity section label in crypto mode uses “Onchain activity”.

------------------------------------------------------------
CRYPTO MODE: ADD USDC SUPPORT (MUST DO)
------------------------------------------------------------
We want USDC treated as a first-class citizen in crypto mode. Not open-ended tokens.

Requirements:
- In crypto mode only, support exactly two assets:
  - ETH
  - USDC
- Add an “Asset” selector in the crypto dashboard main view (NOT header):
  - Options: ETH, USDC
  - Persist selection in localStorage
- Balance display:
  - If ENABLE_TESTNET_MODE=true:
    - Try to read actual balances:
      - ETH balance via provider.getBalance
      - USDC balance via ERC20 balanceOf for a configured USDC contract address on the chosen network
    - If reading USDC fails (no contract configured), gracefully fall back to mocked balance with an explicit “Test balance (mocked)” label.
  - If ENABLE_TESTNET_MODE=false:
    - Use mocked balances for both ETH and USDC, stored in memory/local JSON.
- Send flow in crypto mode:
  - Must allow sending ETH and USDC (selected asset).
  - For ETH: sendTransaction value.
  - For USDC: call ERC20 transfer(to, amount) using decimals=6.
  - Show tx hash on success if testnet mode is enabled and a real transaction is performed.
  - If real send is not possible (missing RPC, missing USDC address), fall back to mocked tx but keep crypto semantics.

Config:
- Add to config.ts (or env) a single USDC contract address for the testnet network you’re using (e.g., Base Sepolia).
- Do not add a “custom token” entry or token import UX.
- Do not add multi-chain selection.

------------------------------------------------------------
IMPLEMENTATION NOTES
------------------------------------------------------------
- Keep the existing mode toggle logic (localStorage + optional DEMO_FORCE_MODE) but adjust header UI per requirements.
- Prefer a shared modal component (e.g., <Modal />) used by both modes.
- Keep Abstracted mode deterministic (mock store unchanged).
- In Crypto mode, the asset selector should only affect crypto mode UI and sending logic; abstracted mode remains “USD” only.
- Keep routes simple. Prefer a single main route with conditional rendering for Wallet vs Settings via sidebar state (or a lightweight route) but do NOT reintroduce Send/Receive routes.

------------------------------------------------------------
DELIVERABLES
------------------------------------------------------------
1) Refactored UI meeting all requirements above
2) README update documenting:
   - Header/Sidebar layout
   - Send/Receive modal behavior
   - Crypto mode assets: ETH + USDC only
   - “onchain” spelling decision
3) Ensure lint/build succeeds

Before coding:
- Summarize the current layout problems you’ll fix (briefly).
- Propose the new component structure (sidebar, header, wallet view, modals, crypto asset selector).
Then implement.