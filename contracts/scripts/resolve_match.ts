import { ethers } from "hardhat";

async function main() {
    console.log("====================================================");
    console.log("🔐 ADMIN PANEL (BACKEND): MANUALLY RESOLVING DEMO MARKET");
    console.log("====================================================");

    const [admin] = await ethers.getSigners();
    console.log(`👤 Authorized Admin Wallet Connected: ${admin.address}`);

    // Get the Factory (Assuming it's already deployed in your local node)
    // Replace this with your actual local Factory address if known, 
    // or deploy a temporary script to fetch it.
    // For this demonstration to work seamlessly, make sure you put 
    // your currently deployed MarketFactory address here!
    
    // As an easier local strategy since this is a demo:
    // We can fetch the factory dynamically if it's the last created contract, 
    // but typically you should paste your address from deployed-addresses.json
    const deployedAddresses = require("../deployed-addresses.json");
    console.log(`🏭 Found Factory Address: ${deployedAddresses.factoryAddress}`);

    const factory = await ethers.getContractAt("MarketFactory", deployedAddresses.factoryAddress);
    
    // Get the first Demo Market
    const allDemoMarkets = await factory.getDemoMarkets();
    if (allDemoMarkets.length === 0) {
        console.error("❌ No Demo Markets found! Did you deploy one yet?");
        return;
    }

    const marketAddress = allDemoMarkets[0];
    console.log(`🔍 Found Demo Market at: ${marketAddress}`);

    const market = await ethers.getContractAt("PredictionMarket", marketAddress);
    
    // Get Market state
    let state = await market.state();
    if (state == 2) {
       console.log("✅ Market is ALREADY RESOLVED. Users can claim their winnings now!");
       return;
    }

    // Lock the market (prevents any new bets)
    if (state == 0) {
       console.log("🔒 Locking market (preventing new bets)...");
       const lockTx = await (market.connect(admin) as any).lockMarket();
       await lockTx.wait();
    }

    // Determine Winner Manually! (0 = Home Team Win, 1 = Draw, 2 = Away Team Win)
    // You can modify this number before running the script during your presentation!
    const WINNING_OUTCOME_INDEX = 0; 

    console.log(`🏆 Declaring Outcome Index [${WINNING_OUTCOME_INDEX}] as the WINNER!`);
    
    // Resolve! This natively bypasses Chainlink because it's a Demo Market
    const resolveTx = await (market.connect(admin) as any).resolve(WINNING_OUTCOME_INDEX);
    await resolveTx.wait();

    console.log(`\n✅ MATCH RESOLVED SUCCESSFULLY!`);
    console.log(`Users who bet on Outcome ${WINNING_OUTCOME_INDEX} can now click "Claim Winnings" on the Frontend.`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
