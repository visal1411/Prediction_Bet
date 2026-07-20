/**
 * demo-resolve.ts
 *
 * Command-line version of "Declare Winner" for demo markets.
 * The Admin UI button does the same thing — this is the script alternative.
 *
 * Usage:
 *   DEMO_MARKET=1 OUTCOME=0 npx hardhat run scripts/demo-resolve.ts --network localhost
 *
 *   DEMO_MARKET: 1 or 2 (which demo match)
 *   OUTCOME:     0 = Home Win, 1 = Away Win, 2 = Draw
 */

import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

const OUTCOME_LABELS = ["Home Win", "Away Win", "Draw"];

async function main() {
  const [deployer] = await ethers.getSigners();

  const marketIndex = parseInt(process.env.DEMO_MARKET || "1");
  const outcomeIndex = parseInt(process.env.OUTCOME || "0");

  if (outcomeIndex < 0 || outcomeIndex > 2) {
    throw new Error("OUTCOME must be 0 (Home Win), 1 (Away Win), or 2 (Draw)");
  }

  // Load market address
  let marketAddress = process.env[`DEMO_MARKET_${marketIndex}_ADDRESS`];

  const demoFile = path.join(__dirname, "..", "demo-markets.json");
  if (!marketAddress && fs.existsSync(demoFile)) {
    const data = JSON.parse(fs.readFileSync(demoFile, "utf8"));
    const keys = Object.keys(data).filter(k => k.startsWith("DEMO_MATCH"));
    marketAddress = data[keys[marketIndex - 1]];
  }

  if (!marketAddress) {
    throw new Error(`Demo market ${marketIndex} address not found. Run demo-setup.ts first.`);
  }

  const market = await ethers.getContractAt("PredictionMarket", marketAddress);
  const info   = await market.getMarketInfo();

  console.log(`\n🎬 Resolving Market ${marketIndex}`);
  console.log(`   Address:     ${marketAddress}`);
  console.log(`   State:       ${["Open","Locked","Resolved","Settled"][Number(info._state)]}`);
  console.log(`   Total Pool:  ${ethers.formatEther(info._totalPool)} ETH`);
  console.log(`   Winner:      ${OUTCOME_LABELS[outcomeIndex]} (outcome ${outcomeIndex})\n`);

  // Step 1: Lock the market if still open
  if (Number(info._state) === 0) {
    console.log("Step 1: Locking market...");
    const lockTx = await market.lockMarket();
    await lockTx.wait();
    console.log("   ✅ Market locked — no more bets accepted");
  }

  // Step 2: Resolve (owner handles manually)
  console.log(`Step 2: Resolving with outcome ${outcomeIndex} (${OUTCOME_LABELS[outcomeIndex]})...`);
  const resolveTx = await market.resolve(outcomeIndex);
  await resolveTx.wait();

  console.log("   ✅ Market resolved!");
  console.log("\n🏆 Winners can now click 'Claim Winnings' in the frontend.");
  console.log("💸 The losing pool is distributed proportionally to winning bettors.\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
