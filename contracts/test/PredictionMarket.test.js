const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("PredictionMarket", function () {
  let PredictionMarket, pm;
  let oracle, user1, user2;

  beforeEach(async function () {
    [oracle, user1, user2] = await ethers.getSigners();
    pm = await ethers.deployContract("PredictionMarket");
  });

  it("Should set the right oracle", async function () {
    expect(await pm.oracle()).to.equal(oracle.address);
  });

  it("Should create an event", async function () {
    const deadline = (await time.latest()) + 3600;
    await pm.createEvent("Test Event", deadline);
    const event = await pm.events(1);
    expect(event.name).to.equal("Test Event");
    expect(event.deadline).to.equal(deadline);
  });

  it("Should allow betting", async function () {
    const deadline = (await time.latest()) + 3600;
    await pm.createEvent("Test Event", deadline);

    await pm.connect(user1).betYes(1, { value: ethers.parseEther("1.0") });
    await pm.connect(user2).betNo(1, { value: ethers.parseEther("0.5") });

    const event = await pm.events(1);
    expect(event.totalYes).to.equal(ethers.parseEther("1.0"));
    expect(event.totalNo).to.equal(ethers.parseEther("0.5"));
  });

  it("Should allow oracle to report result and winners to claim", async function () {
    const deadline = (await time.latest()) + 3600;
    await pm.createEvent("Match 1", deadline);

    await pm.connect(user1).betYes(1, { value: ethers.parseEther("1.0") });
    await pm.connect(user2).betNo(1, { value: ethers.parseEther("0.5") });

    // Advance time past deadline
    await time.increaseTo(deadline + 1);

    // Oracle reports YES as winner
    await pm.reportResult(1, true);

    const event = await pm.events(1);
    expect(event.finished).to.equal(true);

    const balanceBefore = await ethers.provider.getBalance(user1.address);
    const tx = await pm.connect(user1).claimReward(1);
    const receipt = await tx.wait();
    const gasUsed = receipt.gasUsed * receipt.gasPrice;

    const balanceAfter = await ethers.provider.getBalance(user1.address);
    
    // Total reward for user1 should be 1.5 ETH (their 1.0 + user2's 0.5)
    expect(balanceAfter).to.equal(balanceBefore + ethers.parseEther("1.5") - gasUsed);
    
    // user2 should fail to claim
    await expect(pm.connect(user2).claimReward(1)).to.be.revertedWith("You didn't bet or bet on the wrong side");
  });
});
