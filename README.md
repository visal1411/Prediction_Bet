# Sport Betting Prediction Market DApp

A decentralized prediction market focused on sports betting. Users can place bets via MetaMask, and outcomes are resolved via smart contracts and Oracle data.

## Project Structure (Monorepo)

- `src/` & `public/`: React + Vite Frontend
- `packages/backend/`: Express + Prisma + MySQL API Backend
- `packages/contracts/`: Hardhat + Solidity Smart Contracts

---

## 🛠️ 1. Smart Contracts Setup

**Navigate to the contracts folder:**
```bash
cd packages/contracts
npm install
```

**Run the test suite to verify the contracts:**
```bash
npx hardhat test
```

*(Optional) Start a local Hardhat node:*
```bash
npx hardhat node
```

---

## 🛠️ 2. Backend Setup

**Navigate to the backend folder:**
```bash
cd packages/backend
npm install
```

**Start the MySQL Database (requires Docker):**
```bash
docker-compose up -d
```
*(If you don't use Docker, ensure you have a local MySQL instance running and update the `.env` file accordingly).*

**Initialize & Seed the Database:**
```bash
# Creates tables
npx prisma migrate dev --name init

# Populates tables with mock events and bets matching the frontend
npm run seed
```

**Start the API server:**
```bash
npm run dev
```
The API will run at `http://localhost:3001/api`.

---

## 🛠️ 3. Frontend Setup

**Navigate back to the project root:**
```bash
cd ../..  # or open a new terminal in the root folder
npm install
```

**Start the Vite development server:**
```bash
npm run dev
```

The frontend will run at `http://localhost:5173`. Make sure you have the **MetaMask** extension installed in your browser to interact with the wallet authentication and betting features!
