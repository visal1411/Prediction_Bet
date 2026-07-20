import { useState } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { getMarketContract } from '../app/contracts';

export function usePlaceBet(marketAddress: string) {
  const { signer } = useWeb3();
  const [isBetting, setIsBetting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const placeBet = async (outcomeIndex: number, amountEth: string) => {
    if (!signer) {
      setError("Please connect your wallet first");
      return null;
    }
    
    setIsBetting(true);
    setError(null);
    
    try {
      const contract = getMarketContract(marketAddress, signer);
      
      const value = ethers.parseEther(amountEth);
      
      const tx = await contract.placeBet(outcomeIndex, { value });
      const receipt = await tx.wait();
      
      return receipt;
    } catch (err: any) {
      console.error("Bet failed:", err);
      // Try to extract readable error
      const msg = err.reason || err.data?.message || err.message || "Transaction failed";
      setError(msg);
      return null;
    } finally {
      setIsBetting(false);
    }
  };

  return { placeBet, isBetting, error };
}
