import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const prisma = new PrismaClient();

async function fixPools() {
  const events = await prisma.event.findMany({
    include: { bets: true }
  });

  for (const event of events) {
    let totalPool = 0n;
    let poolHome = 0n;
    let poolAway = 0n;
    let poolDraw = 0n;
    let bettors = 0;

    for (const bet of event.bets) {
      const amount = BigInt(bet.amountWei);
      totalPool += amount;
      bettors++;
      
      const outcome = Number(bet.outcome);
      if (outcome === 0) poolHome += amount;
      else if (outcome === 1) poolAway += amount;
      else if (outcome === 2) poolDraw += amount;
    }

    await prisma.event.update({
      where: { id: event.id },
      data: {
        totalPool: totalPool.toString(),
        poolHome: poolHome.toString(),
        poolAway: poolAway.toString(),
        poolDraw: poolDraw.toString(),
        totalBettors: bettors
      }
    });
    console.log(`Fixed event ${event.id}: Total ${totalPool}, Home ${poolHome}, Away ${poolAway}`);
  }
}

fixPools().catch(console.error).finally(() => prisma.$disconnect());
