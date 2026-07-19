import { expect } from "chai";
import { ethers } from "hardhat";
import { MarketFactory, OracleClient, PredictionMarket } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Prediction Market E2E", function () {
  let factory: MarketFactory;
  let oracle: OracleClient;
  let market: PredictionMarket;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addr3: SignerWithAddress;

  const eventId = ethers.id("LAL_VS_GSW_2026");
  const numOutcomes = 3; // 0: LAL, 1: GSW, 2: Draw

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    // Deploy Oracle
    const Oracle = await ethers.getContractFactory("OracleClient");
    oracle = await Oracle.deploy(owner.address);

    // Deploy Factory
    const Factory = await ethers.getContractFactory("MarketFactory");
    factory = await Factory.deploy(owner.address);

    // Set Oracle on Factory
    await factory.setOracleClient(await oracle.getAddress());

    // Create Market (deadline in 1 hour)
    const deadline = Math.floor(Date.now() / 1000) + 3600;
    const tx = await factory.createMarket(eventId, deadline, numOutcomes);
    const receipt = await tx.wait();
    
    // Find MarketCreated event
    const event = receipt?.logs.find((e: any) => e.eventName === 'MarketCreated') as any;
    const marketAddress = event.args.marketAddress;

    market = await ethers.getContractAt("PredictionMarket", marketAddress);
  });

  it("Should allow placing bets", async function () {
    const betAmount = ethers.parseEther("1.0");

    await expect(market.connect(addr1).placeBet(0, { value: betAmount }))
      .to.emit(market, "BetPlaced")
      .withArgs(addr1.address, 0, betAmount);

    expect(await market.totalPool()).to.equal(betAmount);
    expect(await market.outcomePools(0)).to.equal(betAmount);
  });

  it("Should resolve market and allow claiming winnings proportionally", async function () {
    const bet1 = ethers.parseEther("10"); // addr1 bets 10 ETH on Outcome 0
    const bet2 = ethers.parseEther("20"); // addr2 bets 20 ETH on Outcome 0
    const bet3 = ethers.parseEther("30"); // addr3 bets 30 ETH on Outcome 1

    await market.connect(addr1).placeBet(0, { value: bet1 });
    await market.connect(addr2).placeBet(0, { value: bet2 });
    await market.connect(addr3).placeBet(1, { value: bet3 });

    // Total pool = 60 ETH
    // Winning pool (Outcome 0) = 30 ETH
    // addr1 share = 10 / 30 = 1/3 of Total Pool (60) = 20 ETH (10 original + 10 profit)
    // addr2 share = 20 / 30 = 2/3 of Total Pool (60) = 40 ETH (20 original + 20 profit)

    // Admin resolves via Oracle
    await expect(oracle.connect(owner).mockFulfillRequest(eventId, 0))
      .to.emit(market, "MarketResolved")
      .withArgs(0);

    expect(await market.state()).to.equal(2); // Resolved

    // Addr1 claims
    const addr1BalanceBefore = await ethers.provider.getBalance(addr1.address);
    const tx1 = await market.connect(addr1).claimWinnings();
    const receipt1 = await tx1.wait();
    const gasUsed1 = receipt1!.gasUsed * receipt1!.gasPrice;
    const addr1BalanceAfter = await ethers.provider.getBalance(addr1.address);
    
    expect(addr1BalanceAfter + gasUsed1 - addr1BalanceBefore).to.equal(ethers.parseEther("20"));

    // Addr2 claims
    const addr2BalanceBefore = await ethers.provider.getBalance(addr2.address);
    const tx2 = await market.connect(addr2).claimWinnings();
    const receipt2 = await tx2.wait();
    const gasUsed2 = receipt2!.gasUsed * receipt2!.gasPrice;
    const addr2BalanceAfter = await ethers.provider.getBalance(addr2.address);
    
    expect(addr2BalanceAfter + gasUsed2 - addr2BalanceBefore).to.equal(ethers.parseEther("40"));

    // Addr3 (loser) tries to claim
    await expect(market.connect(addr3).claimWinnings()).to.be.revertedWith("No winning bets for this address");
  });

  it("Should prevent betting after resolution", async function () {
    await oracle.connect(owner).mockFulfillRequest(eventId, 0);
    
    await expect(
      market.connect(addr1).placeBet(0, { value: ethers.parseEther("1") })
    ).to.be.revertedWith("Market is not open");
  });
});
