/**
 * seed-markets.ts
 *
 * Seeds fictional markets for demonstrations.
 * Run AFTER deploy.ts.
 *
 * Usage:
 *   npx hardhat run scripts/seed-markets.ts --network localhost
 *
 * These markets are resolved manually from the Admin UI.
 */

import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

dotenv.config();

// ── Configure your demo matches here ────────────────────────────────────────

const DEMO_MATCHES = [
  {
    key:      "DEMO_MATCH_001",
    teamHome: "Crypto Bulls",
    teamAway: "Chain Bears",
    sport:    "Football",
    league:   "Blockchain Premier League",
    outcomes: ["Crypto Bulls Win", "Chain Bears Win", "Draw"],
    // Betting open for next 30 minutes — extend if your demo takes longer
    deadlineMinutesFromNow: 30,
  },
  {
    key:      "DEMO_MATCH_002",
    teamHome: "ETH United",
    teamAway: "BTC City",
    sport:    "Football",
    league:   "Blockchain Premier League",
    outcomes: ["ETH United Win", "BTC City Win", "Draw"],
    deadlineMinutesFromNow: 60,
  },
];

// ──────────────────────────────────────────────────────────────────────────────

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Setting up demo markets as:", deployer.address);

  // Load factory address from deployed-addresses.json or .env
  let factoryAddress = process.env.FACTORY_ADDRESS;
  const addressFile = path.join(__dirname, "..", "deployed-addresses.json");
  if (!factoryAddress && fs.existsSync(addressFile)) {
    const data = JSON.parse(fs.readFileSync(addressFile, "utf8"));
    factoryAddress = data.factoryAddress;
  }
  if (!factoryAddress) {
    throw new Error("FACTORY_ADDRESS not found. Run deploy.ts first.");
  }

  const factory = await ethers.getContractAt("MarketFactory", factoryAddress);
  const now = Math.floor(Date.now() / 1000);

  const results: Record<string, string> = {};

  for (const match of DEMO_MATCHES) {
    const eventId  = ethers.encodeBytes32String(match.key);
    const deadline = now + match.deadlineMinutesFromNow * 60;

    console.log(`\n📋 Creating demo market: ${match.teamHome} vs ${match.teamAway}`);
    console.log(`   Betting closes in ${match.deadlineMinutesFromNow} minutes`);

    const tx = await factory.createMarket(eventId, match.outcomes, deadline);
    const receipt = await tx.wait();

    // Extract market address from MarketCreated event
    const event = receipt?.logs
      .map(log => {
        try { return factory.interface.parseLog(log); } catch { return null; }
      })
      .find(e => e?.name === "MarketCreated");

    const marketAddress = event?.args?.marketAddress as string;
    results[match.key] = marketAddress;

    console.log(`   ✅ Market deployed at: ${marketAddress}`);
    console.log(`   🏷️  market resolved manually by Admin`);
  }

  // Save result to file so demo-resolve.ts and .env can pick it up
  const demoFile = path.join(__dirname, "..", "demo-markets.json");
  fs.writeFileSync(demoFile, JSON.stringify({ ...results, factoryAddress, createdAt: new Date().toISOString() }, null, 2));

  console.log("\n────────────────────────────────────────────────────────");
  console.log("📄 Demo market addresses saved to demo-markets.json");
  console.log("\nAdd these to your .env:");
  for (const [key, addr] of Object.entries(results)) {
    const idx = DEMO_MATCHES.findIndex(m => m.key === key) + 1;
    console.log(`MARKET_${idx}_ADDRESS=${addr}`);
  }
  console.log("────────────────────────────────────────────────────────");
  console.log("\n🎬 Demo markets ready! Now:");
  console.log("   1. Place bets from multiple MetaMask accounts via the frontend");
  console.log("   2. Go to Admin page → Demo Markets tab");
  console.log("   3. Click 'Declare Winner' to resolve the match");
  console.log("   4. Winners claim their ETH!\n");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
