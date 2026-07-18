import { ethers } from "ethers";
import dotenv from "dotenv";

dotenv.config();

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.ORACLE_PRIVATE_KEY, provider);

const contractABI = [
  "function reportResult(uint eventId, bool _result) external"
];

export const reportResultToContract = async (contractEventId, result) => {
  try {
    if(!process.env.CONTRACT_ADDRESS || process.env.CONTRACT_ADDRESS === 'your_contract_address_here') {
      console.warn("Oracle skipped: Please set CONTRACT_ADDRESS in .env");
      return null;
    }
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, contractABI, wallet);
    console.log(`Oracle reporting result for event ${contractEventId} with result ${result}`);
    const tx = await contract.reportResult(contractEventId, result);
    const receipt = await tx.wait();
    return receipt;
  } catch (error) {
    console.error("Oracle Error:", error);
    throw error;
  }
};
