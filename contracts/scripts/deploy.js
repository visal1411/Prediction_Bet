const hre = require("hardhat");

async function main() {
  console.log("Deploying PredictionMarket...");
  const PredictionMarket = await hre.ethers.deployContract("PredictionMarket");
  await PredictionMarket.waitForDeployment();

  console.log(`PredictionMarket deployed to: ${await PredictionMarket.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
