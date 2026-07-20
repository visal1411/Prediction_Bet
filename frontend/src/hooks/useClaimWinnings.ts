import { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { getMarketContract } from '../app/contracts';

export function useClaimWinnings(marketAddress: string) {
  const { signer } = useWeb3();
  const [isClaiming, setIsClaiming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const claim = async () => {
    if (!signer) {
      setError("Please connect your wallet first");
      return null;
    }
    
    setIsClaiming(true);
    setError(null);
    
    try {
      const contract = getMarketContract(marketAddress, signer);
      
      const tx = await contract.claimWinnings();
      const receipt = await tx.wait();
      
      return receipt;
    } catch (err: any) {
      console.error("Claim failed:", err);
      const msg = err.reason || err.data?.message || err.message || "Claim failed";
      setError(msg);
      return null;
    } finally {
      setIsClaiming(false);
    }
  };

  return { claim, isClaiming, error };
}
