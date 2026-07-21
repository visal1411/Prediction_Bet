import { ethers } from "hardhat";

async function main() {
  const [signer] = await ethers.getSigners();
  const address = "0xCafac3dD18aC6c6e92c921884f9E4176737C052c";
  const market = await ethers.getContractAt("PredictionMarket", address, signer);
  
  console.log("Placing bet on outcome 0...");
  try {
    const tx = await market.placeBet(0, { value: ethers.parseEther("1") });
    await tx.wait();
    console.log("Bet placed successfully!");
  } catch (err: any) {
    console.error("Bet failed:", err.message);
  }
}

main().catch(console.error);
