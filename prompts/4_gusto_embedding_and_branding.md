Update the existing MVP so it clearly feels like:
- A Privy-provided embeddable widget
- Customized and embedded into a Gusto experience for Gusto users

Do not broaden product scope beyond embedding + branding. This is a UX packaging change.

------------------------------------------------------------
GOAL
------------------------------------------------------------
When someone opens the app, they should immediately understand:
- They are in a Gusto product page
- The wallet experience is a Privy widget embedded inside Gusto
- Gusto can customize limited branding (cosmetic only)
- Privy remains the wallet provider (“Powered by Privy”)

------------------------------------------------------------
HIGH-LEVEL CHANGES (MUST DO)
------------------------------------------------------------

1) Add a “Host App” shell that simulates Gusto
- Create a new route: /gusto (or /demo/gusto)
- This route represents a Gusto page (e.g., “Payroll > Contractor Payments”)
- The page should have a Gusto-like layout:
  - Top nav with “Gusto” wordmark
  - Left nav with a few items (Payroll, People, Benefits, Reports)
  - Main content area with a section titled something like:
    “Wallet & Payouts” or “Contractor Wallet”
- Within that main content area, embed the Privy wallet widget (see below)

2) Make the wallet UI a true “widget” component
- Refactor the wallet surface into a single embeddable component:
  - <PrivyWalletWidget />
- This component should accept a “branding config” object:
  - brandName (string) -> “Gusto”
  - logo (text or simple SVG)
  - primaryColor
  - surfaceStyle ("compact" | "full")
  - optional: customerSupportUrl (displayed as “Need help?” link)
- The widget should render within a “card” or “embed frame” that makes it feel embedded.
- IMPORTANT: This does not need to be a published NPM package; just structure it as if it could be.

3) Add a compact widget layout (MUST DO)
We need the widget to visually read as an embedded module, not a full-page app.

Implement `surfaceStyle: "compact"` that:
- Reduces vertical padding and overall whitespace
- Uses smaller typography and tighter spacing
- Minimizes the widget header height
- Keeps balance + activity visible without scrolling on laptop screens
- Keeps “Send” and “Receive” as buttons in the widget body (not in the page header)
- Keeps modals the same, but the trigger buttons live in a compact action row
- Avoids any large hero sections or oversized cards

Implement `surfaceStyle: "full"` that:
- Preserves the existing richer layout for standalone viewing

On /gusto:
- Use compact mode by default.

On the standalone demo route (existing /):
- Use full mode by default.

4) Show clear “Powered by Privy” attribution
- Inside the widget frame, show a footer line:
  - “Powered by Privy”
- This must be present in both abstracted and crypto modes.

5) Embedding behavior
- The Gusto host page should embed the widget as if it were a drop-in integration:
  - The host passes branding config + user context (mocked)
  - The host does NOT reach into widget internals
- The widget should feel self-contained:
  - It controls Send/Receive modals
  - It controls wallet display
  - If a mode toggle exists, it lives inside the widget (not the host header)

6) Optional: Add an iframe-style demo wrapper (nice-to-have)
- Provide a boolean (config or query param) that wraps the widget in an “iframe-like” container:
  - Adds a thin border, subtle shadow, and an “Embedded via <PrivyWalletWidget />” label
- This is purely for demo clarity.

------------------------------------------------------------
COPY / STORYTELLING REQUIREMENTS (MUST DO)
------------------------------------------------------------
On the /gusto page, include a short “integration explanation” block above the widget:
- 1–2 sentences:
  - “Gusto uses Privy to provide embedded wallets for payouts.”
  - “This wallet experience is embedded in Gusto and lightly branded; Privy provides the underlying security and wallet infrastructure.”

Keep language simple. No crypto jargon in abstracted mode.

------------------------------------------------------------
BRANDING DETAILS (MUST DO)
------------------------------------------------------------
Gusto branding should be obvious at a glance:
- Gusto header and left nav on the host page
- Widget is branded as Gusto (logo/color), but clearly “Powered by Privy”

Constraints:
- Only cosmetic customization (logo, color, labels).
- No feature-level customization.
- Do NOT add customer-specific forks.

Implement a clear boundary in code:
- Host app controls branding inputs only
- Widget owns everything else

------------------------------------------------------------
STRUCTURE / FILES (SUGGESTED)
------------------------------------------------------------
- app/
  - page.tsx (existing)
  - gusto/page.tsx (new host shell)
- components/
  - PrivyWalletWidget/
    - PrivyWalletWidget.tsx
    - WidgetFrame.tsx
    - widgetTypes.ts
    - styles.ts (compact vs full helpers)
- lib/
  - branding.ts (types + sample configs)
  - demo.ts (helpers for demo routing)

Provide at least two configs:
- default Privy config (full)
- gusto config (compact)

------------------------------------------------------------
AUTH BEHAVIOR (MUST DO)
------------------------------------------------------------
Keep existing Privy auth behavior.
- If user is not authenticated, the widget should show a contained sign-in panel
  inside the widget frame (not a full-page redirect).
- The host page should remain visible even when auth is required.

This is critical to making it feel like an embedded widget.

------------------------------------------------------------
DELIVERABLES
------------------------------------------------------------
1) A new /gusto page that looks like a Gusto product area embedding the widget
2) Wallet surface refactored into <PrivyWalletWidget /> with branding config inputs
3) Compact widget layout implemented and used on /gusto by default
4) “Powered by Privy” attribution inside widget
5) README update: “Gusto embedding demo” + how to access /gusto
6) Keep existing functionality intact

Before coding:
- Summarize the refactor plan (widget extraction + host shell + compact layout)
- List new files/routes
Then implement.