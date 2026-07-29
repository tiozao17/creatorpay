# CreatorPay — Global Creator Payments via USDC on Arc

> **Stablecoin Commerce Stack Hackathon** · Track 1: Best Cross-Border Payments & Remittance Experience (UAE → Global)
> Built with Circle's CCTP V2, Bridge Kit, and Arc Testnet

---

## What it does

CreatorPay is a platform that lets UAE-based brands pay global creators and vendors instantly in USDC — with zero banks, zero FX fees, and on-chain proof of every payment.

A brand in Dubai opens the app, enters the creator's wallet address, picks the destination network, and sends. The USDC burns on Arc via CCTP V2, Circle attests the burn, and the same amount is minted on the creator's network (Base, Ethereum, Arbitrum) within seconds. The creator sees the payment land in real time on their dashboard, with a link to the transaction on the Arc explorer.

**Target corridor:** UAE brands → creators in Brazil, India, Philippines, and other high-remittance markets where traditional payment rails are slow, expensive, or simply unavailable.

---

## Architecture

```
Brand (UAE)
    │
    ▼
CreatorPay Frontend (index.html)
    │  MetaMask signature
    ▼
Arc Testnet (L1)
    ├── USDC contract   — primary stablecoin rail
    └── CCTP V2         — burns USDC, emits attestation request
              │
              ▼
    Circle Attestation Service
              │  validates burn proof
              ▼
Destination Network (Base Sepolia / Ethereum Sepolia / Arbitrum Sepolia)
    └── CCTP Mint       — creates equivalent USDC for creator
              │
              ▼
    Creator wallet + CreatorPay Dashboard
```

---

## Circle products used

| Product | How it's used |
|---|---|
| **USDC** | Primary settlement rail — all payments denominated and settled in USDC |
| **CCTP V2 + Bridge Kit** | Cross-chain transfer: burn on Arc, mint on destination network |
| **Arc Testnet** | Source chain — all payments originate here using Arc's dollar-denominated gas |

---

## Live demo

- **Frontend:** open `index.html` in any browser — no server needed
- **Bridge scripts:** Node.js CLI that executes real CCTP V2 transfers on testnet
- **Explorer:** every testnet transaction is verifiable at `https://testnet.arcscan.app`

---

## How to run

### Prerequisites
- Node.js 18+
- A test wallet with USDC on Arc Testnet (free at `faucet.circle.com`)
- ETH on Base Sepolia for destination gas (free at `portal.cdp.coinbase.com/products/faucet`)

### Setup

```bash
git clone https://github.com/tiozao17/creatorpay.git
cd creatorpay
npm install @circle-fin/app-kit @circle-fin/adapter-viem-v2 dotenv chalk viem
```

Copy `.env.example` to `.env` and add your test wallet private key:

```
PRIVATE_KEY=your_64_char_hex_private_key_here
AMOUNT=1
```

### Step 1 — Check supported networks

```bash
npm run listar-redes
```

Lists all networks supported by the Bridge Kit today, with exact name identifiers.

### Step 2 — Run the bridge

```bash
npm run bridge
```

The script will:
1. Calculate a cost estimate
2. Ask for your confirmation before doing anything
3. Execute: Approve → Burn on Arc → Circle attestation → Mint on destination
4. Print the transaction hash with a link to the Arc explorer

### Step 3 — Open the frontend

Open `index.html` in your browser. Use the **Payer** tab to send a payment and the **Creator Dashboard** tab to see incoming payments.

---

## Project structure

```
creatorpay/
├── index.html                     # Frontend: Payer UI + Creator Dashboard
├── 1-listar-redes.js              # Lists Bridge Kit supported networks
├── 2-estimar-e-fazer-bridge.js    # Estimates and executes CCTP V2 bridge
├── package.json
├── .env.example                   # Environment variable template
└── README.md
```

---

## Circle Product Feedback

### Why we chose these products

**USDC on Arc** was the natural choice for this use case. Creator payments need a stable unit of account — a brand in Dubai shouldn't need to think about price volatility when paying a creator in Brazil. USDC on Arc gives dollar-denominated settlement with gas fees also in dollars, which removes a major UX friction point for non-crypto-native users.

**CCTP V2 with Bridge Kit** solved the hardest problem in cross-border payments: the creator and the brand are almost never on the same network. CCTP's burn-and-mint model means no liquidity pools, no slippage, and no wrapped tokens — the creator receives native USDC on their preferred network. The Bridge Kit made this accessible without needing to understand the low-level attestation flow.

### What worked well

- The Bridge Kit abstraction is well-designed. The high-level `bridge()` call hides the complexity of the attestation cycle, which is exactly right for a developer building a product rather than studying the protocol.
- Dollar-denominated gas on Arc is a genuine UX improvement. Knowing that gas will cost `$0.01` instead of `0.000023 ETH` makes fee estimation trivial to show to end users.
- The `faucet.circle.com` multi-token faucet (USDC, EURC, cirBTC in one place) made testnet onboarding fast.
- Arc's explorer (`testnet.arcscan.app`) was reliable and showed transaction details clearly.

### What could be improved

- **RPC reliability:** The default RPC bundled with the Bridge Kit for Arc Testnet returned `Network connection failed` on the first few attempts. We had to explicitly pass a custom RPC URL (`https://rpc.testnet.arc.network`) to the Viem adapter. Hardening the default RPC or providing fallback endpoints in the SDK would reduce friction for new developers.
- **Chain name consistency:** The Bridge Kit uses underscore identifiers (`Arc_Testnet`) internally but the chain objects expose a display name (`Arc Testnet`) and a title (`ArcTestnet`). We had to map all three variants to handle every code path. A single canonical identifier per chain would make integrations more predictable.
- **Browser wallet integration:** The current Bridge Kit is designed around private key signers (server-side or CLI). A browser-compatible signer adapter that works directly with MetaMask/WalletConnect would make it much easier to build frontend dApps without a backend.
- **Error messages:** `KitError` with `errorCategory: 'unknown'` is hard to debug. More specific error codes (e.g. `INSUFFICIENT_GAS_ON_DESTINATION`, `RPC_TIMEOUT`) would help developers fix issues faster.

### Recommendations

The CCTP V2 + Arc combination is genuinely well-suited for the creator economy corridor. The main gap is UX for non-technical users: right now, a creator needs to understand wallets, networks, and gas to receive a payment. A hosted Circle Wallets integration on the receiving end — where the creator just gives an email and Circle manages the key — would unlock the full potential of this use case without requiring crypto literacy from the payee.

---

## Hackathon submission

- **Track:** Track 1 — Best Cross-Border Payments & Remittance Experience (UAE → Global)
- **Circle products used:** USDC, CCTP V2 + Bridge Kit
- **Network:** Arc Testnet
- **Repository:** https://github.com/tiozao17/creatorpay
