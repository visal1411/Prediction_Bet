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

  // ── 2. Deploy OracleClient (Sepolia only) ─────────────────────────────────

  let oracleAddress = ethers.ZeroAddress;
  const network = await ethers.provider.getNetwork();

  if (network.chainId === 11155111n) {
    // Sepolia — deploy real OracleClient
    const FUNCTIONS_ROUTER = "0xb83E47C2bC239B3bf370bc41e1459A34b41238D0";
    const DON_ID           = ethers.encodeBytes32String(process.env.CHAINLINK_DON_ID || "fun1-ethereum-sepolia-1");
    const SUBSCRIPTION_ID  = BigInt(process.env.CHAINLINK_SUBSCRIPTION_ID || "0");
    const GAS_LIMIT        = 300_000;

    console.log("\nDeploying OracleClient...");
    const OracleClient = await ethers.getContractFactory("OracleClient");
    const oracle = await OracleClient.deploy(
      FUNCTIONS_ROUTER,
      factoryAddress,
      deployer.address,
      DON_ID,
      SUBSCRIPTION_ID,
      GAS_LIMIT
    );
    await oracle.waitForDeployment();
    oracleAddress = await oracle.getAddress();
    console.log("✅ OracleClient deployed to:", oracleAddress);

    // Link oracle to factory
    await factory.setOracleClient(oracleAddress);
    console.log("✅ OracleClient set on factory");

    // Upload Chainlink Functions source
    const sourceFile = path.join(__dirname, "chainlink-source.js");
    if (fs.existsSync(sourceFile)) {
      const source = fs.readFileSync(sourceFile, "utf8");
      await oracle.setSource(source);
      console.log("✅ Chainlink Functions source uploaded");
    }
  } else {
    console.log("\nℹ️  Localhost network — skipping OracleClient deployment");
    console.log("   Demo markets will use manual resolution (isDemo=true)");
  }

  // ── 3. Save addresses ─────────────────────────────────────────────────────

  const addresses = {
    network: network.chainId.toString(),
    deployer: deployer.address,
    factoryAddress,
    oracleAddress,
    deployedAt: new Date().toISOString(),
  };

  const outputPath = path.join(__dirname, "..", "deployed-addresses.json");
  fs.writeFileSync(outputPath, JSON.stringify(addresses, null, 2));
  console.log("\n📄 Addresses saved to deployed-addresses.json");

  // Update .env
  console.log("\n─────────────────────────────────────────");
  console.log("Add these to your .env file:");
  console.log(`FACTORY_ADDRESS=${factoryAddress}`);
  if (oracleAddress !== ethers.ZeroAddress) {
    console.log(`ORACLE_CLIENT_ADDRESS=${oracleAddress}`);
  }
  console.log("─────────────────────────────────────────\n");
  console.log("✅ Deployment complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
