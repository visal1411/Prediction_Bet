# 🏟️ SportBet — Decentralized Sports Prediction Market

A blockchain-powered sports betting DApp (Decentralized Application) that allows users to place wagers on real-world sporting events using cryptocurrency. 

---

## 🎯 The Problem It Solves

Traditional sports betting platforms suffer from several inherent flaws:
1. **Centralized Custody:** Users must deposit funds into a platform's wallet, risking losing their money if the platform is hacked, goes bankrupt, or freezes their account.
2. **Unfair Odds & Hidden Fees:** Centralized bookmakers set the odds to guarantee themselves a profit (the "vig" or "juice") and often restrict profitable bettors.
3. **Lack of Transparency:** It is difficult to verify if the betting pool is fair, or if the platform is honoring payouts without delays.

**SportBet solves this by using Smart Contracts.** 
Users never deposit funds into a centralized company account. Instead, bets are sent directly to a transparent, immutable smart contract. The odds are dynamically determined by the free market (parimutuel betting), and payouts are hardcoded into the blockchain, guaranteeing that winners will always be able to claim their funds instantly.

---

## 💡 What Is This? (Overview)

Think of it like a betting pool between friends, but on the blockchain:

1. **An admin creates an event** — e.g. "Manchester Utd vs Arsenal"
2. **Users place bets** — pick a side (Home Win, Away Win, or Draw) and put up ETH
3. **All bets go into a shared pool** on a smart contract — nobody controls the money
4. **When the game ends**, the admin resolves the market via the Admin Dashboard.
5. **Winners split the losers' pool** — proportional to how much they bet

No bookmaker sets the odds. The odds are determined by how much money is on each side. This is called **parimutuel (pool) betting**.

---

## 🏗️ How It Works (Simple Version)

```
Admin creates a market
    → Uses the Admin Dashboard to deploy a new PredictionMarket contract

User opens the app
    → Connects MetaMask wallet
    → Browses upcoming sports events
    → Picks a match, chooses "Home Win", bets 0.1 ETH
    → MetaMask pops up, user confirms the transaction
    → Smart contract records the bet on the blockchain

⏳ Game happens in real life...

Game ends (Arsenal wins 2-1)
    → Admin clicks "Resolve Market" on the Admin Dashboard
    → Admin selects the winning outcome
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
└──────────────▲──────────┘  │  • User profiles       │
               │             │  • Listens to chain    │
          Admin Action       │    events & syncs DB   │
                             └────────────────────────┘
```

### Frontend (`frontend/`)

The user-facing app. Built with React, Vite, and TailwindCSS.

- **MetaMask connection** — users connect their Ethereum wallet
- **Browse events** — see upcoming matches with live odds
- **Place bets** — sends a transaction to the smart contract via ethers.js
- **Claim winnings** — after a match resolves, winners withdraw their share
- **Admin Dashboard** — create, pause, and resolve markets directly from the UI

### Smart Contracts (`contracts/`)

The core logic lives on the Ethereum blockchain (currently deployed to a local Hardhat node).

| Contract | What It Does |
|---|---|
| **PredictionMarket.sol** | Holds the betting pool for a single event. Accepts bets, tracks who bet what, and pays out winners. |
| **MarketFactory.sol** | A factory that creates new PredictionMarket contracts. One market per sporting event. Keeps a registry of all markets. |

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
| **Frontend** | React 18, Vite, TailwindCSS, ethers.js v6 | Fast dev experience, direct wallet interaction |
| **Backend** | Express.js, TypeScript, Prisma ORM | Clean REST API with type-safe database access |
| **Database** | MySQL | Reliable relational data storage |
| **Wallet** | MetaMask | Most popular Ethereum wallet |

---

## 🧪 Development Environment (Docker)

The entire application runs seamlessly using Docker Compose.

### Quick Start
```bash
# Start all services (MySQL, Hardhat Node, Backend, Frontend)
docker compose up -d
```

Once running:
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:3001`
- **Hardhat Node**: `http://localhost:8545`

You can connect your MetaMask to the local Hardhat network (`http://localhost:8545` with chain ID `31337`) to interact with the DApp locally without spending real money.

---

## 📁 Project Structure

```
sport_betting/
│
├── contracts/          # Solidity smart contracts (Hardhat project)
│   ├── contracts/      # .sol files (PredictionMarket, MarketFactory)
│   ├── test/           # Contract tests
│   ├── scripts/        # Deploy scripts
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
└── docker-compose.yml  # Local dev orchestration
```

---

## 🔑 Key Concepts

### Parimutuel Betting
Unlike traditional bookmakers who set odds, parimutuel betting pools all bets together. The payout is determined by the ratio of your bet to the total pool. This removes the need for a centralized bookmaker.

### Smart Contracts
Self-executing code on the blockchain. Once deployed, nobody (not even the creator) can change the rules. The betting logic, payouts, and fund custody are all handled by code — not by a company.

### MetaMask
A browser extension that acts as your Ethereum wallet. It holds your private keys and signs transactions. When you place a bet, MetaMask asks you to confirm before any money moves.

---

## 🏁 The End Stage: What is this project considered as?

Upon completion, this project serves as a **Local-First Web3 Proof of Concept (PoC)**. 

While it has all the architectural components of a real-world Web3 application, it is deliberately scoped for a local testing environment. Specifically:

1. **Network Status:** It operates on a **Local Hardhat Network** using fake ETH, meaning no real money is at risk. 
2. **Oracle Data:** It uses an **Admin Dashboard** for manual resolution rather than a decentralized oracle like Chainlink, simplifying the testing flow.
3. **Architecture:** It boasts a complete, production-ready full-stack architecture (Smart Contracts + Express/MySQL + React). To move to Mainnet (real money), one would change the RPC URLs, deploy the contracts to Ethereum Mainnet, and integrate an Oracle for automatic resolution.

In short: **It is a complete, portfolio-ready Web3 dApp that safely simulates a high-stakes, real-world betting platform.**

---

## 📄 License

MIT
