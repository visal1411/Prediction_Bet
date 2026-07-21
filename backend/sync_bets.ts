import { ethers } from 'ethers';
import { prisma } from './src/config/database';

const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';
const MARKET_ABI = [
  "event BetPlaced(address indexed bettor, uint8 outcome, uint256 amount)"
];

async function syncBets() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  
  // Fetch all events that have a marketAddress
  const events = await prisma.event.findMany({ 
    where: { NOT: { marketAddress: null } } 
  });
  
  let added = 0;
  
  for (const dbEvent of events) {
    if (!dbEvent.marketAddress) continue;
    
    try {
      const contract = new ethers.Contract(dbEvent.marketAddress, MARKET_ABI, provider);
      
      // Query all historical BetPlaced events from block 0 to latest
      const filter = contract.filters.BetPlaced();
      const logs = await contract.queryFilter(filter, 0, 'latest');
      
      for (const log of logs) {
        if (!('args' in log)) continue; // Type guard
        
        const bettor = log.args[0].toString();
        const outcome = Number(log.args[1]);
        const amountWei = log.args[2].toString();
        
        // Check if this specific bet already exists in DB (simplified check)
        // Usually, a user can bet multiple times. But for our PoC, we can just insert if 
        // the combination of (eventId, walletAddress, outcome) doesn't exist, OR 
        // just update the total amount. Wait, the DB tracks individual bet rows.
        // Let's check how many bets this user made for this outcome in the DB.
        
        // Since we don't have transactionHash in the schema, we'll try to find an existing bet 
        // with the same amount, or just ensure the total pool is correct.
        // Actually, let's just insert missing bets by counting.
        
        const dbBets = await prisma.bet.findMany({
          where: {
            eventId: dbEvent.id,
            walletAddress: bettor,
            outcome: outcome,
            amountWei: amountWei
          }
        });
        
        if (dbBets.length === 0) {
           await prisma.bet.create({
             data: {
               eventId: dbEvent.id,
               walletAddress: bettor,
               outcome: outcome,
               amountWei: amountWei,
               status: 'confirmed'
             }
           });
           console.log(`Inserted missing bet: ${bettor} - ${amountWei} Wei on outcome ${outcome} for ${dbEvent.teamHome} vs ${dbEvent.teamAway}`);
           added++;
           
           // Also update the pools
           const amountEth = parseFloat(ethers.formatEther(amountWei));
           const currentTotal = parseFloat(ethers.formatEther(dbEvent.totalPool));
           const updatedTotal = ethers.parseEther((currentTotal + amountEth).toString()).toString();
           
           let poolUpdate: any = { totalPool: updatedTotal };
           if (outcome === 0) {
             const cur = parseFloat(ethers.formatEther(dbEvent.poolHome));
             poolUpdate.poolHome = ethers.parseEther((cur + amountEth).toString()).toString();
           } else if (outcome === 1) {
             const cur = parseFloat(ethers.formatEther(dbEvent.poolAway));
             poolUpdate.poolAway = ethers.parseEther((cur + amountEth).toString()).toString();
           } else {
             const cur = parseFloat(ethers.formatEther(dbEvent.poolDraw));
             poolUpdate.poolDraw = ethers.parseEther((cur + amountEth).toString()).toString();
           }
           
           await prisma.event.update({
             where: { id: dbEvent.id },
             data: poolUpdate
           });
        }
      }
    } catch (e) {
      console.error(`Failed to sync bets for ${dbEvent.marketAddress}`, e);
    }
  }
  
  console.log(`Sync complete. Inserted ${added} missing bets.`);
}

syncBets().catch(console.error);
