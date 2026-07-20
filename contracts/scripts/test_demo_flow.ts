import { ethers } from "hardhat";

async function main() {
    // 1. Get 3 local Hardhat test wallets
    const [admin, winnerWallet, loserWallet] = await ethers.getSigners();

    console.log("==========================================");
    console.log("🎬 STARTING DEMO FLOW SIMULATION");
    console.log("==========================================");

    // 2. Deploy Market Factory
    const MarketFactory = await ethers.getContractFactory("MarketFactory");
    const factory = await MarketFactory.deploy(admin.address);
    await factory.waitForDeployment();
    console.log(`✅ MarketFactory deployed at: ${await factory.getAddress()}`);

    // 3. Admin creates a Demo Market
    const eventId = ethers.id("LAKERS_VS_WARRIORS");
    const outcomes = ["Lakers Win", "Warriors Win"];
    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now
    
    const createTx = await factory.createDemoMarket(eventId, outcomes, deadline);
    await createTx.wait();
    
    const allMarkets = await factory.getAllMarkets();
    const marketAddress = allMarkets[0];
    console.log(`✅ Demo Market Created at: ${marketAddress}`);

    // 4. Attach to the new market
    const market = await ethers.getContractAt("PredictionMarket", marketAddress);

    // 5. HOUSE FUND: Admin deposits 10 ETH to ensure 1:1 payouts never fail
    console.log("\n💰 Admin structurally funding the House with 10 ETH...");
    await (market.connect(admin) as any).fundContract({ value: ethers.parseEther("10") });

    // 6. USERS PLACE BETS
    console.log("\n👥 Users placing bets...");
    
    // WinnerWallet bets 1 ETH on Lakers (Outcome 0)
    await (market.connect(winnerWallet) as any).placeBet(0, { value: ethers.parseEther("1") });
    console.log(`-> WinnerWallet placed 1 ETH bet on "Lakers" (Outcome 0)`);
    
    // LoserWallet bets 1 ETH on Warriors (Outcome 1)
    await (market.connect(loserWallet) as any).placeBet(1, { value: ethers.parseEther("1") });
    console.log(`-> LoserWallet placed 1 ETH bet on "Warriors" (Outcome 1)`);

    // 7. ADMIN RESOLVES THE MARKET
    console.log("\n⚖️ Admin resolving the market (Bypassing Chainlink since isDemo = true)");
    // Admin locks the market 
    await (market.connect(admin) as any).lockMarket();
    
    // Admin declares Lakers (Outcome 0) as the winner!
    console.log("-> Admin declares Lakers (Outcome 0) as the WINNER");
    await (market.connect(admin) as any).resolve(0);

    // 8. WINNER AND LOSER ATTEMPT TO CLAIM
    console.log("\n💸 Claim phase...");
    
    const winnerBalanceBefore = await ethers.provider.getBalance(winnerWallet.address);
    console.log(`Winner Balance before claim: ${ethers.formatEther(winnerBalanceBefore)} ETH`);

    // Winner claims!
    await (market.connect(winnerWallet) as any).claimWinnings();
    const winnerBalanceAfter = await ethers.provider.getBalance(winnerWallet.address);
    
    console.log(`Winner Balance after claim:  ${ethers.formatEther(winnerBalanceAfter)} ETH`);
    console.log(`✅ Winner successfully claimed 2 ETH (1 ETH stake * 2 payout)!`);

    // Loser tries to claim...
    try {
        await (market.connect(loserWallet) as any).claimWinnings();
    } catch (err: any) {
        console.log(`❌ Loser attempted to claim, but transaction reverted because: ${err.message.split("reverted with custom error")[1].split("(")[0]}`);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
