import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { useWeb3 } from '../context/Web3Context';
import { getMarketContract } from '../app/contracts';

const STATE_LABELS = ["Open", "Locked", "Resolved", "Settled"];

export function useMarketData(marketAddress: string) {
  const { provider, account } = useWeb3();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchMarket = async () => {
      // In production, we would use our backend API to fetch market data 
      // instead of querying RPC to save on quota, but here's direct RPC fallback
      if (!provider || !marketAddress) {
         setLoading(false);
         return;
      }
      
      try {
        const contract = getMarketContract(marketAddress, provider);
        const info = await contract.getMarketInfo();
        
        let userBetHome = 0n;
        let userBetAway = 0n;
        let userBetDraw = 0n;

        if (account) {
          userBetHome = await contract.getBet(0, account);
          userBetAway = await contract.getBet(1, account);
          userBetDraw = await contract.getBet(2, account);
        }

        const formatted = {
          eventId: ethers.decodeBytes32String(info._eventId),
          outcomes: info._outcomes,
          deadline: new Date(Number(info._deadline) * 1000),
          state: STATE_LABELS[Number(info._state)],
          totalPool: ethers.formatEther(info._totalPool),
          winningOutcome: info._winningOutcome,
          userBets: {
            home: ethers.formatEther(userBetHome),
            away: ethers.formatEther(userBetAway),
            draw: ethers.formatEther(userBetDraw)
          }
        };

        if (active) {
          setData(formatted);
          setLoading(false);
        }
      } catch (err) {
        console.error("Fetch market failed", err);
        if (active) setLoading(false);
      }
    };

    fetchMarket();
    
    // In real app, poll every 10s or use events
    const interval = setInterval(fetchMarket, 10000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [provider, account, marketAddress]);

  return { data, loading };
}
