# 🏟️ SportBet — Decentralized Sports Prediction Market

A blockchain-powered sports betting DApp where users bet on real sporting events, and outcomes are automatically resolved using real-world data — no middleman, no trust required.

---

## 💡 What Is This?

Think of it like a betting pool between friends, but on the blockchain:

1. **An event gets created** — e.g. "Manchester Utd vs Arsenal"
2. **Users place bets** — pick a side (Home Win, Away Win, or Draw) and put up ETH
3. **All bets go into a shared pool** on a smart contract — nobody controls the money
4. **When the game ends**, a Chainlink Oracle fetches the real score from SportsData.io
5. **Winners split the losers' pool** — proportional to how much they bet

No bookmaker sets the odds. The odds are determined by how much money is on each side. This is called **parimutuel (pool) betting**.

---

## 🏗️ How It Works (Simple Version)

```
User opens the app
    → Connects MetaMask wallet
    → Browses upcoming sports events
    → Picks a match, chooses "Home Win", bets 0.1 ETH
    → MetaMask pops up, user confirms the transaction
    → Smart contract records the bet on the blockchain

⏳ Game happens in real life...

Game ends (Arsenal wins 2-1)
    → Chainlink Automation detects the deadline has passed
    → Chainlink Functions calls SportsData.io API to get the final score
    → Oracle sends the result back to the smart contract
    → Smart contract marks the market as "Resolved"

Winners come back to the app
    → Click "Claim Winnings"
    → Smart contract calculates their share and sends ETH to their wallet
```

---

## 🧱 Architecture Overview

The project has **4 main layers**:

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                         │
│            React + Vite + TailwindCSS               │
│     Connect wallet, browse events, place bets       │
└──────────────┬──────────────────────┬───────────────┘
               │                      │
          ethers.js               REST API
          (blockchain)            (off-chain data)
               │                      │
┌──────────────▼──────────┐  ┌────────▼──────────────┐
│      SMART CONTRACTS    │  │       BACKEND          │
│   Ethereum Blockchain   │  │   Express.js + MySQL   │
│                         │  │                        │
│  • PredictionMarket.sol │  │  • Event schedules     │
│  • MarketFactory.sol    │  │  • Bet history cache   │
│  • OracleClient.sol     │  │  • User profiles       │
└──────────────▲──────────┘  │  • Listens to chain    │
               │              │    events & syncs DB   │
       ┌───────┴────────┐    └────────────────────────┘
       │  CHAINLINK      │
       │  ORACLE          │
       │                  │
       │  Fetches real    │
       │  scores from     │
       │  SportsData.io   │
       └──────────────────┘
```

### Frontend (`frontend/`)

The user-facing app. Built with React, Vite, and TailwindCSS.

- **MetaMask connection** — users connect their Ethereum wallet
- **Browse events** — see upcoming matches with live odds
- **Place bets** — sends a transaction to the smart contract via ethers.js
- **Claim winnings** — after a match resolves, winners withdraw their share
- **No account creation needed** — your wallet IS your identity

### Smart Contracts (`contracts/`)

The core logic lives on the Ethereum blockchain. Nobody can tamper with it.

| Contract | What It Does |
|---|---|
| **PredictionMarket.sol** | Holds the betting pool for a single event. Accepts bets, tracks who bet what, and pays out winners. |
| **MarketFactory.sol** | A factory that creates new PredictionMarket contracts. One market per sporting event. Keeps a registry of all markets. |
| **OracleClient.sol** | Talks to Chainlink to fetch real-world sports results and triggers market resolution. |

**How the betting math works (parimutuel):**

```
Example: Manchester Utd vs Arsenal

Pool:
  Home Win (MUN): 10 ETH total from various bettors
  Draw:            5 ETH
  Away Win (ARS):  5 ETH
  ─────────────────────
  Total pool:     20 ETH

Result: Home Win (MUN)

Winners share the entire pool (minus a small fee).
If you bet 2 ETH on MUN (20% of the winning pool),
you get 20% of the total 20 ETH = 4 ETH back.
Your profit: 2 ETH (2x return).
```

The more people bet on one side, the lower the payout. The odds balance themselves naturally.

### Oracle — Chainlink + SportsData.io (`contracts/scripts/`)

The oracle is the bridge between the blockchain and the real world. Smart contracts can't browse the internet, so we need Chainlink to fetch sports results for us.

```
How it works:

1. Chainlink Automation monitors event deadlines
2. When a game should be over, it triggers a request
3. Chainlink Functions runs a small JavaScript snippet on decentralized nodes
4. That snippet calls the SportsData.io API → gets the final score
5. The result is sent back on-chain to OracleClient.sol
6. OracleClient calls PredictionMarket.resolve() with the winning outcome
```


### Backend (`backend/`)

An Express.js API server with a MySQL database. This handles stuff that doesn't need to be on-chain:

- **Event schedules** — upcoming matches, dates, leagues
- **Bet history** — cached from blockchain events for fast queries
- **User profiles** — usernames, avatars, stats
- **Event listener** — listens to smart contract events and syncs the database in real-time

Why not put everything on-chain? Because reading blockchain data is slow and expensive. The backend caches it for a fast UI while the blockchain remains the source of truth for money.

---

## 🛠️ Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Smart Contracts** | Solidity, Hardhat, OpenZeppelin | Industry standard for Ethereum development |
| **Oracle** | Chainlink Functions + Automation | Decentralized, tamper-proof data feeds |
| **Sports Data** | SportsData.io (sandbox) | Real sports data API with free developer tier |
| **Frontend** | React 18, Vite, TailwindCSS, ethers.js v6 | Fast dev experience, direct wallet interaction |
| **Backend** | Express.js, TypeScript, Prisma ORM | Clean REST API with type-safe database access |
| **Database** | MySQL | Reliable relational data storage |
| **Wallet** | MetaMask | Most popular Ethereum wallet |
| **Testnet** | Sepolia | Free Ethereum test network for development (see below) |

---

## 🧪 What Is Sepolia? (Testnets Explained)

Ethereum has two types of networks:

| | **Mainnet** | **Testnet (Sepolia)** |
|---|---|---|
| **Real money?** | ✅ Yes — real ETH with real value | ❌ No — fake ETH worth nothing |
| **Cost to use?** | 💰 Every transaction costs gas fees | 🆓 Completely free |
| **Who uses it?** | Real users, real apps | Developers testing their code |
| **How to get ETH?** | Buy it on exchanges | Get it free from "faucets" (websites that give you test ETH) |
| **Permanent?** | Yes — mainnet is forever | Testnets can be shut down and replaced |

**Think of it like this:** Sepolia is a practice server for Ethereum. It works exactly like the real thing — same smart contracts, same MetaMask, same transactions — but with play money. This lets us build, test, and break things without losing real money.

**Why Sepolia specifically?** Ethereum has had several testnets over the years (Ropsten, Rinkeby, Goerli — all deprecated). **Sepolia is the current recommended testnet** as of 2024+. It's maintained by the Ethereum Foundation and is the most reliable option.

### How to get free testnet ETH and LINK

| What | Where | How much |
|---|---|---|
| **Sepolia ETH** | [sepoliafaucet.com](https://sepoliafaucet.com) or [cloud.google.com/web3/faucet](https://cloud.google.com/application/web3/faucet/ethereum/sepolia) | Usually 0.5 ETH per day |
| **Testnet LINK** | [faucets.chain.link](https://faucets.chain.link) | 20 LINK per request |

You just paste your wallet address, click a button, and the test tokens show up in your MetaMask. No payment, no signup (some faucets require a free Alchemy account).

### Our development flow

```
1. Write & test contracts locally (Hardhat local node — instant, no network needed)
2. Deploy to Sepolia testnet (test with real wallets, Chainlink, the full flow)
3. When everything works → deploy to Ethereum mainnet (real money, real users)
```

We're at step 1-2. Mainnet deployment is Phase 4.

---

## 📁 Project Structure

```
sport_betting/
│
├── contracts/          # Solidity smart contracts (Hardhat project)
│   ├── contracts/      # .sol files (PredictionMarket, MarketFactory, OracleClient)
│   ├── test/           # Contract tests
│   ├── scripts/        # Deploy scripts + Chainlink Functions JS source
│   └── hardhat.config.ts
│
├── backend/            # Express.js REST API
│   ├── src/            # Server, routes, controllers, services
│   ├── prisma/         # Database schema
│   └── package.json
│
├── frontend/           # React + Vite + TailwindCSS
│   ├── src/            # Components, pages, hooks, context
│   └── package.json
│
└── README.md           # You are here
```

---

## 🔑 Key Concepts

### Parimutuel Betting
Unlike traditional bookmakers who set odds, parimutuel betting pools all bets together. The payout is determined by the ratio of your bet to the total pool. This removes the need for a centralized bookmaker.

### Smart Contracts
Self-executing code on the blockchain. Once deployed, nobody (not even the creator) can change the rules. The betting logic, payouts, and fund custody are all handled by code — not by a company.

### Chainlink Oracle
Smart contracts can't access the internet. Chainlink is a decentralized network of nodes that fetches real-world data (like sports scores) and delivers it on-chain in a trustworthy way.

### MetaMask
A browser extension that acts as your Ethereum wallet. It holds your private keys and signs transactions. When you place a bet, MetaMask asks you to confirm before any money moves.

---

## 🚀 Getting Started

> Coming soon — the project is under active development.

### Prerequisites
- Node.js 18+
- MetaMask browser extension
- MySQL database
- Free accounts: [SportsData.io](https://sportsdata.io), [Alchemy](https://alchemy.com) (for Sepolia RPC)

### Quick Start
```bash
# Smart contracts
cd contracts && npm install && npx hardhat test

# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

---

## 🏁 The End Stage: What is this project considered as?

Upon completion of the current implementation plan, this project will be considered a **Fully-Functional Testnet MVP (Minimum Viable Product)** or a **Production-Grade Proof of Concept (PoC)**. 

While it will have all the architectural components of a real-world, enterprise-level Web3 application, it is deliberately scoped for a test environment. Specifically:

1. **Network Status:** It will operate on the **Sepolia Testnet** using fake ETH, meaning no real money is at risk. 
2. **Oracle Data:** It will use the **SportsData.io Developer Sandbox**, which provides real API structures but is meant for development, not commercial production.
3. **Architecture:** It will boast a complete, production-ready architecture (Smart Contracts + Chainlink + Express/MySQL + React). If you wanted to move to Mainnet (real money), you would simply change the RPC URLs, deploy the contracts to Ethereum Mainnet, and purchase a commercial SportsData.io API key.

In short: **It is a complete, portfolio-ready Web3 dApp that safely simulates a high-stakes, real-world betting platform.**

---

## 📄 License

MIT
