import { ethers } from 'ethers';
import { prisma } from './src/config/database';

const RPC_URL = process.env.RPC_URL || 'http://localhost:8545';
const MARKET_ABI = [
  "function state() view returns (uint8)",
  "function winningOutcome() view returns (uint8)"
];

async function syncAll() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const events = await prisma.event.findMany({ where: { NOT: { marketAddress: null } } });
  
  for (const dbEvent of events) {
    if (!dbEvent.marketAddress) continue;
    
    try {
      const contract = new ethers.Contract(dbEvent.marketAddress, MARKET_ABI, provider);
      const stateNum = await contract.state();
      
      let status = 'open';
      if (stateNum === 1n) status = 'locked';
      if (stateNum === 2n || stateNum === 3n) status = 'resolved';
      
      console.log(`Event ${dbEvent.id} (${dbEvent.teamHome} vs ${dbEvent.teamAway}): DB=${dbEvent.status}, Chain=${status}`);
      
      if (dbEvent.status !== status) {
        let result = null;
        if (status === 'resolved') {
          result = Number(await contract.winningOutcome());
        }
        
        await prisma.event.update({
          where: { id: dbEvent.id },
          data: { status, result }
        });
        console.log(`Updated event ${dbEvent.id} to ${status} with result ${result}`);
      }
    } catch (e) {
      console.error(`Failed to sync ${dbEvent.marketAddress}`, e);
    }
  }
  
  console.log("Sync complete");
}

syncAll().catch(console.error);
