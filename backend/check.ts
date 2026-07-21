import { ethers } from "ethers";

async function main() {
  const provider = new ethers.JsonRpcProvider("http://localhost:8545");
  const abi = [
    "function state() view returns (uint8)",
    "function deadline() view returns (uint256)",
    "function getOutcomesCount() view returns (uint256)",
    "function totalPool() view returns (uint256)"
  ];
  const market = new ethers.Contract("0x9f1ac54BEF0DD2f6f3462EA0fa94fC62300d3a8e", abi, provider);
  
  const state = await market.state();
  const deadline = await market.deadline();
  const now = Math.floor(Date.now() / 1000);
  
  console.log("Market State:", state);
  console.log("Deadline:", deadline, "(passed:", now > Number(deadline), ")");
  console.log("Current Time:", now);
}

main().catch(console.error);
