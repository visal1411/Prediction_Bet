import { ethers } from 'ethers';
import { prisma } from '../config/database';

const MARKET_ABI = [
  "event BetPlaced(address indexed bettor, uint8 outcome, uint256 amount)",
  "event MarketResolved(uint8 winningOutcome)",
  "function state() view returns (uint8)",
  "function winningOutcome() view returns (uint8)"
];

const FACTORY_ABI = [
  "event MarketCreated(address indexed marketAddress, bytes32 indexed eventId, string[] outcomes, uint256 deadline)"
];

// Helper to attach listeners to a specific market
function attachMarketListener(marketAddress: string, provider: ethers.Provider) {
  const contract = new ethers.Contract(marketAddress, MARKET_ABI, provider);

  contract.on("BetPlaced", async (bettor: string, outcome: number, amount: bigint, event: any) => {
    try {
      const amountStr = amount.toString();
      console.log(`🎉 BetPlaced caught! Bettor: ${bettor}, Outcome: ${outcome}, Amount: ${amountStr}`);

      // 1. Find Event by marketAddress
      const dbEvent = await prisma.event.findFirst({
        where: { marketAddress }
      });

      if (!dbEvent) {
        console.warn(`⚠️ Event not found for market ${marketAddress}`);
        return;
      }

      // Deduplication check
      const existingBet = await prisma.bet.findUnique({
        where: { txHash: event.log.transactionHash }
      });

      if (existingBet) {
        console.log(`⚠️ Bet already processed for tx: ${event.log.transactionHash}. Skipping.`);
        return; 
      }

      // 2. Create Bet record
      try {
        await prisma.bet.create({
          data: {
            eventId: dbEvent.id,
            walletAddress: bettor,
            outcome: Number(outcome),
            amountWei: amountStr,
            txHash: event.log.transactionHash
          }
        });
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`⚠️ Duplicate event caught for tx: ${event.log.transactionHash}. Skipping.`);
          return;
        }
        throw error;
      }

      // 3. Update Event pools
      const currentTotal = BigInt(dbEvent.totalPool || '0');
      const newTotal = currentTotal + amount;

      let newPoolHome = BigInt(dbEvent.poolHome || '0');
      let newPoolAway = BigInt(dbEvent.poolAway || '0');
      let newPoolDraw = BigInt(dbEvent.poolDraw || '0');
      const outcomeNum = Number(outcome);
      if (outcomeNum === 0) newPoolHome += amount;
      else if (outcomeNum === 1) newPoolAway += amount;
      else if (outcomeNum === 2) newPoolDraw += amount;

      await prisma.event.update({
        where: { id: dbEvent.id },
        data: {
          totalPool: newTotal.toString(),
          poolHome: newPoolHome.toString(),
          poolAway: newPoolAway.toString(),
          poolDraw: newPoolDraw.toString(),
          totalBettors: { increment: 1 } 
        }
      });
      
      console.log(`✅ Event ${dbEvent.id} pools updated successfully.`);
    } catch (err) {
      console.error('❌ Error handling BetPlaced event:', err);
    }
  });

  contract.on("MarketResolved", async (winningOutcome: number, event: any) => {
    try {
      console.log(`🏆 MarketResolved caught for ${marketAddress}! Winning Outcome: ${winningOutcome}`);
      const dbEvent = await prisma.event.findFirst({
        where: { marketAddress }
      });
      if (dbEvent) {
        await prisma.event.update({
          where: { id: dbEvent.id },
          data: { 
            status: 'resolved',
            result: Number(winningOutcome)
          }
        });
        console.log(`✅ Event ${dbEvent.id} marked as resolved with outcome ${winningOutcome}.`);
      }
    } catch (err) {
      console.error('❌ Error handling MarketResolved event:', err);
    }
  });

  console.log(`👂 Listening to BetPlaced and MarketResolved on ${marketAddress}`);
}

export async function setupEventListener() {
  const rpcUrl = process.env.RPC_URL;
  if (!rpcUrl) {
    console.warn('⚠️ No RPC_URL provided. Event listener disabled.');
    return;
  }

  try {
    const wsUrl = rpcUrl.replace('http://', 'ws://').replace('https://', 'wss://');
    const provider = new ethers.WebSocketProvider(wsUrl);
    console.log(`🎧 Connected to blockchain at ${wsUrl} via WebSockets for events`);

    // Fetch all open/active markets from database to listen to them
    const activeEvents = await prisma.event.findMany({
      where: {
        marketAddress: { not: null },
        status: { in: ['upcoming', 'open'] }
      }
    });

    for (const event of activeEvents) {
      if (event.marketAddress) {
        // Sync state first in case it was resolved while offline
        try {
          const contract = new ethers.Contract(event.marketAddress, MARKET_ABI, provider);
          const state = await contract.state();
          if (state === 2n) { // 2 = State.Resolved
            const winningOutcome = await contract.winningOutcome();
            console.log(`🔄 Sync: Market ${event.marketAddress} was already resolved. Updating DB...`);
            await prisma.event.update({
              where: { id: event.id },
              data: { 
                status: 'resolved',
                result: Number(winningOutcome)
              }
            });
            continue; // Skip attaching listener since it's already resolved
          }
        } catch (syncErr) {
          console.error(`⚠️ Failed to sync state for ${event.marketAddress}`, syncErr);
        }

        attachMarketListener(event.marketAddress, provider);
      }
    }

    // Optional: Listen to factory for new markets (if FACTORY_ADDRESS is available)
    const factoryAddress = process.env.FACTORY_ADDRESS;
    if (factoryAddress) {
      const factory = new ethers.Contract(factoryAddress, FACTORY_ABI, provider);
      factory.on("MarketCreated", (marketAddress: string) => {
        console.log(`🆕 New market created dynamically: ${marketAddress}`);
        attachMarketListener(marketAddress, provider);
      });
      console.log(`👂 Listening to MarketCreated on Factory ${factoryAddress}`);
    }

  } catch (error) {
    console.error('❌ Failed to setup event listener:', error);
  }
}
