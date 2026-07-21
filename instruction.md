# How to Start the SportBet Demo

This guide walks you through setting up and running the complete SportBet DApp demo (Blockchain, Database, Backend, and Frontend) locally.

## Prerequisites
1. **Docker Desktop** (running)
2. **Node.js** (v18+)
3. **MetaMask** browser extension

---

## 1. Start the Docker Services
Open your terminal in the root folder of this project (`Prediction_Bet`) and run:
```bash
docker compose up -d --build
```
This will spin up four services:
- `sportbet-blockchain`: A local Hardhat Ethereum node.
- `sportbet-mysql`: A MySQL database.
- `sportbet-backend`: The Express.js backend.
- `sportbet-frontend`: The React UI.

> You can monitor the logs of all services in Docker Desktop or by running `docker compose logs -f`.

---

## 2. Deploy the Smart Contracts
The local blockchain starts empty. We need to deploy our core smart contracts (`MarketFactory`) directly inside the running Docker container.

Open a new terminal (while Docker is running) and execute this inside the `blockchain` container:
```bash
docker compose exec blockchain npx hardhat run scripts/deploy.ts --network localhost
```
*This deploys the factory contract. You will need the printed `MarketFactory deployed to:` address for the next step.*

---

## 3. Setup the Database
Next, we need to initialize the MySQL database schema and seed it with dummy users from inside the `backend` container.

Run these commands:
```bash
# Push the database schema
docker compose exec backend npx prisma db push

# Seed the database
docker compose exec backend npx prisma db seed
```

---

## 4. Seed the Demo Markets
Now we'll deploy the actual sports matches (markets) to the blockchain. 

Run this command inside the `blockchain` container:
```bash
docker compose exec blockchain npx hardhat run scripts/demo-setup.ts --network localhost
```
*(If it asks for a FACTORY_ADDRESS, ensure your `.env` files are updated with the factory address from Step 2, or you can temporarily run it locally if the docker environment variables aren't synced yet).*

---

## 5. Setup MetaMask
To interact with the app, you need to connect your MetaMask to your local blockchain and import a test account that has fake ETH.

1. Open MetaMask > Networks > Add Network > Add a network manually.
   - **Network Name**: Hardhat Local
   - **New RPC URL**: `http://127.0.0.1:8545`
   - **Chain ID**: `31337`
   - **Currency Symbol**: `ETH`
2. Save and switch to this network.
3. Import a Test Account:
   - Click your account avatar > **Import Account**
   - Paste this Private Key (Hardhat Account #0): 
     `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
   - You should now see an account with exactly `10,000 ETH`!

---

## 6. Access the App
The frontend is already running inside Docker!

Open your browser and navigate to:
**http://localhost:5173**

Connect your newly imported MetaMask account. You can now place bets on the seeded matches!

---

## 7. How to Resolve a Match (Admin)
Because we aren't using a real Chainlink Oracle in the local demo, you have to resolve the matches manually as the Admin.

1. Ensure you are connected to MetaMask using **Account 0** (the admin wallet).
2. Go to the **Admin Dashboard** (button available on your Profile page).
3. Under the "Active Markets" section, find a market and click **Resolve Market**.
4. Select the winning outcome.
5. Watch the backend logs (`docker logs sportbet-backend`) — you'll see the backend detect the `MarketResolved` event!
6. Go back to your Profile, and if your bet won, click **Claim Winnings**!
