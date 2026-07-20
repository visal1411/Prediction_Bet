const hre = require("hardhat");

async function main() {
  const [owner] = await hre.ethers.getSigners();
  const Factory = await hre.ethers.getContractFactory("PredictionMarket");
  
  // Create a 3-outcome market (Win, Loss, Draw)
  const eventId = hre.ethers.encodeBytes32String("match-1");
  const deadline = Math.floor(Date.now() / 1000) + 86400 * 30; // 30 days in future
  
  const market = await Factory.deploy(eventId, deadline, 3, owner.address);
  await market.waitForDeployment();
  
  console.log(await market.getAddress());
}

main().catch(console.error);
