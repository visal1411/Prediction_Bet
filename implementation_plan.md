# Sport-Betting Prediction Market DApp — Implementation Plan

## Background

A decentralized prediction market DApp based on the architecture plan. Users connect via MetaMask, place bets on sporting events through Solidity smart contracts, and outcomes are resolved using Chainlink Oracle + **SportsData.io dev sandbox**.

## Decisions

| Decision | Choice |
|---|---|
| **Project structure** | Flat — `frontend/`, `backend/`, `contracts/` at root |
| **CSS framework** | Keep TailwindCSS v4 (already configured) |
| **Oracle** | Full Chainlink Functions + Automation setup (no stub) |
| **Sports data API** | SportsData.io developer sandbox |
| **Database** | MySQL + Prisma ORM |

## Project Structure

```
sport_betting/
├── contracts/                        # NEW — Hardhat project
│   ├── contracts/
│   │   ├── MarketFactory.sol
│   │   ├── PredictionMarket.sol
│   │   ├── OracleClient.sol
│   │   └── interfaces/
│   ├── test/
│   │   ├── PredictionMarket.test.ts
│   │   ├── MarketFactory.test.ts
│   │   └── OracleClient.test.ts
│   ├── scripts/
│   │   ├── deploy.ts
│   │   └── chainlink-source.js       # JS executed on Chainlink DON
│   ├── hardhat.config.ts
│   ├── package.json
│   └── .env.example
│
├── backend/                          # Express.js API (currently empty)
│   ├── src/
│   │   ├── server.ts
│   │   ├── routes/
│   │   │   ├── events.ts
│   │   │   ├── bets.ts
│   │   │   ├── auth.ts
│   │   │   └── admin.ts
│   │   ├── controllers/
│   │   ├── services/
│   │   │   └── eventListener.ts      # Blockchain event sync
│   │   ├── middleware/
│   │   │   └── auth.ts
│   │   └── config/
│   │       └── database.ts
│   ├── prisma/
│   │   └── schema.prisma
│   ├── package.json
│   └── .env.example
│
├── frontend/                         # Existing React + Vite + TailwindCSS
│   ├── src/
│   │   ├── context/
│   │   │   ├── Web3Context.tsx       # REFACTOR from WalletContext
│   │   │   └── BetSlipContext.tsx     # Keep as-is
│   │   ├── hooks/
│   │   │   ├── usePlaceBet.ts        # NEW — ethers.js contract call
│   │   │   ├── useClaimWinnings.ts   # NEW
│   │   │   ├── useMarketData.ts      # NEW
│   │   │   └── useEvents.ts          # NEW — backend API calls
│   │   ├── app/
│   │   │   └── contracts.ts          # NEW — addresses + ABIs
│   │   ├── pages/                    # Existing + new pages
│   │   │   ├── EventsPage.tsx        # NEW — /events with filters
│   │   │   ├── LeaderboardPage.tsx   # NEW — /leaderboard
│   │   │   └── AdminPage.tsx         # NEW — /admin (owner only)
│   │   └── ...existing files
│   └── ...existing config
│
├── sportbetting_plan.md
└── .gitignore
```

---

## Phase 0 — UI Foundation (Completed)

- **Admin Dashboard (`AdminPage.tsx`)**: Created `/admin` route with tabs for Active Markets, Create Market, and Emergency Controls. Added an Admin Access button to the Profile page (mocked with `isAdmin = true`).
- **Dynamic Sports Routing (`SportsPage.tsx`)**: Consolidated 6 individual sport pages into a single dynamic template handling `/football`, `/basketball`, etc. via route parameters.
- **Currency Migration**: Replaced all USD (`$`) formatting across the app (Profile, Match Detail, BetSlip, MyBets) with Ethereum (`ETH`) formatting.
- **Mock Data**: Centralized market and match data in `mockData.tsx` to support the frontend demo before contract integration.

---

## Phase 1 — Smart Contracts & Architecture


#### [NEW] [hardhat.config.ts](file:///c:/Users/Yup%202/Documents/Camtech/Blockchain/sport_betting/contracts/hardhat.config.ts)
- TypeScript config with `localhost` and `sepolia` networks
- Plugins: `@nomicfoundation/hardhat-toolbox` (includes Typechain, gas reporter, coverage)
- `dotenv` for env vars (`SEPOLIA_RPC_URL`, `PRIVATE_KEY`, `ETHERSCAN_API_KEY`)

#### [NEW] [PredictionMarket.sol](file:///c:/Users/Yup%202/Documents/Camtech/Blockchain/sport_betting/contracts/contracts/PredictionMarket.sol)
- **Betting model**: Parimutuel (pool) betting
- **States**: `Open → Locked → Resolved → Settled`
- `placeBet(uint8 outcome)` — payable, records bet in `mapping(uint8 => mapping(address => uint256))`
- `lockMarket()` — called when event starts, prevents new bets
- `resolve(uint8 winningOutcome)` — callable by oracle address or owner
- `claimWinnings()` — winners withdraw proportional share of losing pool
- Security: `ReentrancyGuard`, `Pausable`, Checks-Effects-Interactions
- Events: `BetPlaced(address bettor, uint8 outcome, uint256 amount)`, `MarketResolved(uint8 winningOutcome)`, `WinningsClaimed(address bettor, uint256 amount)`

#### [NEW] [MarketFactory.sol](file:///c:/Users/Yup%202/Documents/Camtech/Blockchain/sport_betting/contracts/contracts/MarketFactory.sol)
- `createMarket(bytes32 eventId, string[] outcomes, uint256 deadline)` — deploys a new `PredictionMarket`
- `getMarket(bytes32 eventId)` — returns market address
- `getActiveMarkets()` / `getResolvedMarkets()` — list markets
- `onlyOwner` access control
- Emits `MarketCreated(address marketAddress, bytes32 eventId, uint256 deadline)`

#### [NEW] [OracleClient.sol](file:///c:/Users/Yup%202/Documents/Camtech/Blockchain/sport_betting/contracts/contracts/OracleClient.sol)
- Extends `FunctionsClient` from `@chainlink/contracts`
- Implements `AutomationCompatibleInterface` for Chainlink Automation
- `requestResult(bytes32 eventId)` — sends request to Chainlink Functions DON
- `fulfillRequest(bytes32 requestId, bytes memory response, bytes memory err)` — callback, decodes result, calls `PredictionMarket.resolve()`
- `checkUpkeep()` — returns `true` when event deadline has passed
- `performUpkeep()` — triggers `requestResult()`
- Stores `subscriptionId`, `donId`, `gasLimit` as configurable params

#### Dependencies
```
@openzeppelin/contracts (ReentrancyGuard, Ownable, Pausable)
@chainlink/contracts (FunctionsClient, FunctionsRequest, AutomationCompatibleInterface)
```

---

### 1.2 Chainlink Oracle + SportsData.io Sandbox

#### [NEW] [chainlink-source.js](file:///c:/Users/Yup%202/Documents/Camtech/Blockchain/sport_betting/contracts/scripts/chainlink-source.js)
JavaScript source executed on Chainlink DON nodes:
```javascript
// Fetches game result from SportsData.io dev sandbox
const eventId = args[0];
const apiKey = secrets.SPORTSDATA_API_KEY; // dev sandbox key

const response = await Functions.makeHttpRequest({
  url: `https://api.sportsdata.io/v3/soccer/scores/json/GameByGameID/${eventId}`,
  headers: { 'Ocp-Apim-Subscription-Key': apiKey }
});

const game = response.data;
if (game.Status !== 'Final') throw Error('Game not yet finished');

let outcome;
if (game.HomeTeamScore > game.AwayTeamScore) outcome = 0;      // home win
else if (game.HomeTeamScore < game.AwayTeamScore) outcome = 1;  // away win
else outcome = 2;                                                // draw

return Functions.encodeUint256(outcome);
```

#### Oracle Setup Steps
1. Create a Chainlink Functions subscription on Sepolia
2. Fund subscription with testnet LINK
3. Deploy `OracleClient.sol` with subscription ID and DON config
4. Add deployed contract as consumer to the subscription
5. Register with Chainlink Automation for auto-triggering
6. Configure SportsData.io dev sandbox API key as encrypted secret

#### [NEW] `.env.example` for contracts
```
SEPOLIA_RPC_URL=
PRIVATE_KEY=
ETHERSCAN_API_KEY=
CHAINLINK_SUBSCRIPTION_ID=
CHAINLINK_DON_ID=
SPORTSDATA_API_KEY=        # Dev sandbox key from sportsdata.io
```

---

### 1.3 Backend (`backend/`)

#### [NEW] [server.ts](file:///c:/Users/Yup%202/Documents/Camtech/Blockchain/sport_betting/backend/src/server.ts)
- Express.js entry point
- Middleware: CORS, helmet, express-rate-limit, JSON parser
- Route mounting: `/api/events`, `/api/bets`, `/api/auth`, `/api/admin`

#### [NEW] [schema.prisma](file:///c:/Users/Yup%202/Documents/Camtech/Blockchain/sport_betting/backend/prisma/schema.prisma)
```prisma
model Event {
  id              String   @id @default(uuid())
  sport           String
  league          String?
  teamHome        String
  teamAway        String
  eventDate       DateTime
  externalApiId   String?          // SportsData.io GameID
  marketAddress   String?          // Deployed contract address
  status          String   @default("upcoming")  // upcoming|live|completed|cancelled
  result          Int?             // Winning outcome index
  createdAt       DateTime @default(now())
  bets            Bet[]
}

model Bet {
  id              String   @id @default(uuid())
  eventId         String
  walletAddress   String
  outcome         Int              // 0=home, 1=away, 2=draw
  amountWei       String           // BigInt as string
  txHash          String   @unique
  status          String   @default("pending")  // pending|confirmed|won|lost|claimed
  createdAt       DateTime @default(now())
  event           Event    @relation(fields: [eventId], references: [id])
}

model User {
  walletAddress   String   @id
  username        String?
  avatarUrl       String?
  totalBets       Int      @default(0)
  totalWon        Int      @default(0)
  joinedAt        DateTime @default(now())
}
```

#### [NEW] REST API Routes

| Endpoint | Method | Description |
|---|---|---|
| `/api/events` | GET | List upcoming sporting events |
| `/api/events/:id` | GET | Event details + market address |
| `/api/events/:id/odds` | GET | Current pool sizes / implied odds |
| `/api/bets/history` | GET | User's bet history (query by wallet) |
| `/api/bets/active` | GET | User's active/pending bets |
| `/api/admin/events` | POST | Create event + deploy market |
| `/api/auth/nonce` | GET | Get nonce for wallet signature auth |
| `/api/auth/verify` | POST | Verify signed message for auth |

#### [NEW] [eventListener.ts](file:///c:/Users/Yup%202/Documents/Camtech/Blockchain/sport_betting/backend/src/services/eventListener.ts)
- `ethers.js` WebSocket subscription to contract events
- Listens for `BetPlaced`, `MarketResolved`, `WinningsClaimed`
- Syncs on-chain state to MySQL via Prisma

---

### 1.4 Frontend — Web3 Integration

#### [MODIFY] [WalletContext.tsx](file:///c:/Users/Yup%202/Documents/Camtech/Blockchain/sport_betting/frontend/src/context/WalletContext.tsx) → Refactor into Web3Context
- Install `ethers` v6
- Use `ethers.BrowserProvider` and `ethers.Signer`
- Expose `provider`, `signer`, `account`, `chainId`
- Add network validation (Sepolia chain check)
- Keep existing connect/disconnect UX

#### [NEW] [contracts.ts](file:///c:/Users/Yup%202/Documents/Camtech/Blockchain/sport_betting/frontend/src/app/contracts.ts)
- Import compiled ABIs from `contracts/` artifacts
- Export contract addresses (configurable per network)
- Helper: `getMarketContract(address, signer)` → typed `ethers.Contract`

#### [NEW] Contract interaction hooks
- `usePlaceBet(marketAddress)` — `contract.placeBet(outcome, { value })`
- `useClaimWinnings(marketAddress)` — `contract.claimWinnings()`
- `useMarketData(marketAddress)` — read pool sizes, state, deadline
- `useEvents()` — fetch events from backend API

#### [MODIFY] [App.tsx](file:///c:/Users/Yup%202/Documents/Camtech/Blockchain/sport_betting/frontend/src/App.tsx)
- Add new routes: `/events`, `/events/:id`, `/leaderboard`, `/admin`
- Wrap with `Web3Provider` instead of `WalletProvider`

#### [NEW] New pages
- `EventsPage.tsx` — browse events with sport/league/date filters
- `LeaderboardPage.tsx` — top bettors by winnings
- `AdminPage.tsx` — create events, deploy markets, emergency controls (owner only)

---

## Phase 2 — Core Features & Integration

### 2.1 Backend ↔ Frontend API Integration
- **API Client:** Setup Axios/Fetch client in frontend (`frontend/src/api/client.ts`) pointing to `VITE_API_URL`.
- **Dynamic Data:** Replace `mockData.tsx` with live data fetched from the Express backend:
  - Upcoming events list for Sports pages (`GET /api/events`).
  - Event details, odds, and pool sizes (`GET /api/events/:id`).
  - User bet history and active bets for Profile/My Bets (`GET /api/bets/history`).
- **State Management:** Implement React Query or standard hooks for loading states, caching, and polling live odds.

### 2.2 Smart Contract ↔ Frontend Integration
- **Transactions:** Wire the "Place Bet" button on the Event Detail page to the smart contract `placeBet` function via `ethers.js`.
- **Claiming:** Wire the "Claim" button on the My Bets page to `claimWinnings`.
- **UX:** Add comprehensive transaction status UI (pending spinners, confirmed toasts, failed alerts) and handle wallet rejections / insufficient funds gracefully.

### 2.3 Backend ↔ Smart Contract Integration
- **Event Listener:** Build backend service (`eventListener.ts`) to listen to Sepolia RPC for `BetPlaced`, `MarketResolved`, and `WinningsClaimed` events.
- **Database Sync:** Sync the on-chain state to the MySQL database via Prisma in real-time so the frontend API serves fast, cached data without overloading the RPC node.

## Phase 3 — Oracle Integration

- Deploy `OracleClient.sol` to Sepolia
- Create Chainlink Functions subscription + fund with LINK
- Configure SportsData.io dev sandbox API key as encrypted DON secret
- Register Chainlink Automation upkeep for auto-resolution
- Test full cycle on Sepolia: place bet → game finishes → oracle resolves → claim

## Phase 4 — Polish & Launch

- Premium UI (stadium aesthetics, dynamic animations)
- Leaderboard + user profiles
- Admin panel (market creation, emergency pause, manual resolution fallback)
- Deploy to Sepolia for public testing

---

## Verification Plan

### Automated Tests
```bash
# Smart contract tests
cd contracts && npx hardhat test --coverage

# Backend API tests
cd backend && npm test

# Frontend type check
cd frontend && npx tsc --noEmit
```

### Manual Verification
- Deploy to local Hardhat node, place bets via UI, verify state sync
- Test MetaMask connect/disconnect + network switching
- Test full lifecycle: place bet → oracle resolution → claim winnings
- Verify MySQL mirrors on-chain state via event listener
- Test edge cases: double-betting, claiming before resolution, expired markets
