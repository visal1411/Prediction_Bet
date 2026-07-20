import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // ── 1. Deploy MarketFactory ────────────────────────────────────────────────

  console.log("Deploying MarketFactory...");
  const MarketFactory = await ethers.getContractFactory("MarketFactory");
  const factory = await MarketFactory.deploy(deployer.address);
  await factory.waitForDeployment();
  const factoryAddress = await factory.getAddress();
  console.log("✅ MarketFactory deployed to:", factoryAddress);

  const network = await ethers.provider.getNetwork();

  // ── 3. Save addresses ─────────────────────────────────────────────────────

  const addresses = {
    network: network.chainId.toString(),
    deployer: deployer.address,
    factoryAddress,
    deployedAt: new Date().toISOString(),
  };

  const outputPath = path.join(__dirname, "..", "deployed-addresses.json");
  fs.writeFileSync(outputPath, JSON.stringify(addresses, null, 2));
  console.log("\n📄 Addresses saved to deployed-addresses.json");

  // Update .env
  console.log("\n─────────────────────────────────────────");
  console.log("Add these to your .env file:");
  console.log(`FACTORY_ADDRESS=${factoryAddress}`);
  console.log("─────────────────────────────────────────\n");
  console.log("✅ Deployment complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
