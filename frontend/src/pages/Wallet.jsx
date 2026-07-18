import { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import { Loader2, Coins, Trophy, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function Wallet() {
  const { account, contract, isConnected } = useWeb3();
  const [loading, setLoading] = useState(true);
  const [userBets, setUserBets] = useState([]);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (isConnected && contract) {
      fetchUserBets();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line
  }, [isConnected, contract, account]);

  const fetchUserBets = async () => {
    try {
      const count = await contract.eventCount();
      const numEvents = Number(count);
      const bets = [];

      for (let i = 1; i <= numEvents; i++) {
        const yesBet = await contract.yesBets(i, account);
        const noBet = await contract.noBets(i, account);
        const eventData = await contract.events(i);
        const hasClaimed = await contract.hasClaimed(i, account);

        const yesAmount = parseFloat(ethers.formatEther(yesBet));
        const noAmount = parseFloat(ethers.formatEther(noBet));

        if (yesAmount > 0 || noAmount > 0) {
          bets.push({
            id: i,
            name: eventData.name,
            yesAmount,
            noAmount,
            finished: eventData.finished,
            result: eventData.result, // true for YES, false for NO
            hasClaimed
          });
        }
      }

      setUserBets(bets);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleClaim = async (eventId) => {
    setClaiming(true);
    try {
      const tx = await contract.claimReward(eventId);
      toast.loading("Claiming rewards...", { id: "claim-tx" });
      await tx.wait();
      toast.success("Rewards claimed successfully!", { id: "claim-tx" });
      fetchUserBets(); // Refresh
    } catch (error) {
      console.error(error);
      toast.error(error.reason || "Failed to claim rewards", { id: "claim-tx" });
    } finally {
      setClaiming(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <WalletIcon size={64} className="text-slate-600 mb-6" />
        <h2 className="text-3xl font-bold text-white mb-2">Connect Your Wallet</h2>
        <p className="text-slate-400 mb-8 max-w-md">You need to connect your MetaMask wallet to view your active predictions and claim your rewards.</p>
      </div>
    );
  }

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={48} /></div>;

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="bg-slate-800/50 border border-slate-700/50 p-8 rounded-3xl mb-8 flex items-center justify-between shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">My Dashboard</h2>
          <p className="text-slate-400 font-mono">{account}</p>
        </div>
        <div className="bg-indigo-500/20 p-4 rounded-2xl border border-indigo-500/30 text-indigo-400">
          <Coins size={32} />
        </div>
      </div>

      <h3 className="text-2xl font-bold mb-6 text-slate-100 flex items-center gap-2">
        <Calendar className="text-slate-400" /> Active & Past Predictions
      </h3>

      {userBets.length === 0 ? (
        <div className="bg-slate-800/30 border border-slate-700/30 rounded-2xl p-12 text-center">
          <p className="text-slate-400 text-lg mb-4">You haven't made any predictions yet.</p>
          <Link to="/" className="text-indigo-400 hover:text-indigo-300 font-bold">Explore available markets &rarr;</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {userBets.map((bet) => {
            const isWinner = bet.finished && ((bet.yesAmount > 0 && bet.result) || (bet.noAmount > 0 && !bet.result));
            
            return (
              <div key={bet.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 relative overflow-hidden group">
                {isWinner && !bet.hasClaimed && <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>}
                
                <h4 className="text-xl font-bold text-white mb-4 pr-16 truncate">{bet.name}</h4>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800">
                    <p className="text-xs text-slate-500 font-bold mb-1">PREDICTION</p>
                    <p className={`font-bold ${bet.yesAmount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {bet.yesAmount > 0 ? "YES" : "NO"}
                    </p>
                  </div>
                  <div className="bg-slate-900/50 rounded-xl p-3 border border-slate-800">
                    <p className="text-xs text-slate-500 font-bold mb-1">STAKED</p>
                    <p className="font-bold text-white">{bet.yesAmount > 0 ? bet.yesAmount : bet.noAmount} ETH</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-slate-700 pt-4">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${bet.finished ? 'bg-slate-500' : 'bg-emerald-500 animate-pulse'}`}></div>
                    <span className="text-sm font-semibold text-slate-400">{bet.finished ? 'Completed' : 'Live'}</span>
                  </div>
                  
                  {bet.finished && isWinner && !bet.hasClaimed && (
                    <button 
                      onClick={() => handleClaim(bet.id)}
                      disabled={claiming}
                      className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition disabled:opacity-50"
                    >
                      <Trophy size={16} /> Claim Rewards
                    </button>
                  )}

                  {bet.finished && isWinner && bet.hasClaimed && (
                    <span className="text-emerald-500 font-bold text-sm flex items-center gap-1">Rewards Claimed ✓</span>
                  )}
                  
                  {bet.finished && !isWinner && (
                    <span className="text-rose-500 font-bold text-sm">Lost</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
// Add WalletIcon fallback since it's not exported
function WalletIcon(props) {
  return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>;
}
