import { useState, useEffect } from 'react';
import { Clock, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';
import { useWallet } from '../context/Web3Context';
import { getFactoryContract, getMarketContract, FACTORY_ADDRESS } from '../app/contracts';
import { ethers } from 'ethers';
import { useClaimWinnings } from '../hooks/useClaimWinnings';

interface LiveBet {
  id: string; // contract address
  marketAddress: string;
  date: string;
  match: string;
  sport: string;
  market: string;
  selection: string;
  stake: number;
  potentialPayout: number;
  status: 'ACTIVE' | 'WON' | 'LOST';
  oddsLabel: string;
}

function BetRow({ bet, onClaimSuccess }: { bet: LiveBet, onClaimSuccess: () => void }) {
  const { claim, isClaiming, error } = useClaimWinnings(bet.marketAddress);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Clock className="text-blue-400" size={18} />;
      case 'WON': return <CheckCircle2 className="text-[var(--color-accent-green)]" size={18} />;
      case 'LOST': return <XCircle className="text-red-500" size={18} />;
      default: return null;
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'WON': return 'bg-[var(--color-accent-green)]/10 text-[var(--color-accent-green)] border-[var(--color-accent-green)]/20';
      case 'LOST': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return '';
    }
  };
  
  const handleClaim = async () => {
    const receipt = await claim();
    if (receipt) onClaimSuccess();
  };

  return (
    <div className="bg-[var(--color-sidebar-bg)] border border-[var(--color-border)] rounded-xl overflow-hidden hover:border-gray-500 transition-colors shadow-sm relative group">
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
        bet.status === 'WON' ? 'bg-[var(--color-accent-green)]' : 
        bet.status === 'LOST' ? 'bg-red-500' : 'bg-blue-500'
      }`} />

      <div className="p-5 pl-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">{bet.sport}</span>
              <span className="text-gray-600 text-xs">•</span>
              <span className="text-xs text-[var(--color-text-muted)]">{bet.date}</span>
            </div>
            <h3 className="text-lg font-bold text-white">{bet.match}</h3>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-md border text-xs font-bold uppercase tracking-wider ${getStatusStyle(bet.status)}`}>
              {getStatusIcon(bet.status)}
              {bet.status}
            </div>
            {bet.status === 'WON' && (
              <button 
                onClick={handleClaim}
                disabled={isClaiming}
                className="bg-[var(--color-accent-green)] hover:bg-[var(--color-accent-green-hover)] text-black px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] disabled:opacity-50"
              >
                {isClaiming ? 'CLAIMING...' : 'CLAIM WINNINGS'}
              </button>
            )}
            {error && <span className="text-xs text-red-400 font-bold max-w-xs">{error}</span>}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[var(--color-card-bg)] p-4 rounded-lg border border-[var(--color-border)]">
          <div>
            <div className="text-[var(--color-text-muted)] text-xs mb-1 uppercase tracking-wider font-semibold">Selection</div>
            <div className="text-white font-bold">{bet.selection}</div>
            <div className="text-[var(--color-text-muted)] text-xs mt-0.5">{bet.market}</div>
          </div>
          <div>
            <div className="text-[var(--color-text-muted)] text-xs mb-1 uppercase tracking-wider font-semibold">Live Odds</div>
            <div className="text-[var(--color-accent-blue)] font-bold text-lg border border-[var(--color-accent-blue)]/30 inline-block px-2 rounded">
              {bet.oddsLabel}
            </div>
          </div>
          <div>
            <div className="text-[var(--color-text-muted)] text-xs mb-1 uppercase tracking-wider font-semibold">Stake</div>
            <div className="text-white font-bold">{bet.stake.toFixed(4)} ETH</div>
          </div>
          <div>
            <div className="text-[var(--color-text-muted)] text-xs mb-1 uppercase tracking-wider font-semibold">
              {bet.status === 'WON' ? 'Final Payout' : 'Pot. Payout'}
            </div>
            <div className={`font-bold text-lg ${bet.status === 'WON' ? 'text-[var(--color-accent-green)]' : 'text-white'}`}>
              {bet.potentialPayout.toFixed(4)} ETH
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MyBetsPage() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'SETTLED'>('ALL');
  const { account, provider, connectWallet } = useWallet();
  const [liveBets, setLiveBets] = useState<LiveBet[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBlockchainBets = async () => {
    if (!provider || !account) return;
    try {
      setLoading(true);
      const factory = getFactoryContract(FACTORY_ADDRESS, provider);
      const allMarketsAddress: string[] = await factory.getAllMarkets();
      
      const loadedBets: LiveBet[] = [];
      for (const address of allMarketsAddress) {
        const contract = getMarketContract(address, provider);
        const info = await contract.getMarketInfo(); 
        // 0=eventId, 1=outcomes, 2=deadline, 3=state, 4=totalPool, 5=winningOutcome

        let userStake = 0n;
        let userOutcome = -1;
        for (let i = 0; i < info[1].length; i++) {
          const stake = await contract.getBet(i, account);
          if (stake > 0n) {
            userStake = stake;
            userOutcome = i;
            break;
          }
        }
        
        if (userStake > 0n) {
          const outcomePool = await contract.outcomePools(userOutcome);
          
          let status: 'ACTIVE' | 'WON' | 'LOST' = 'ACTIVE';
          const stateNum = Number(info[3]);
          if (stateNum === 2 || stateNum === 3) { // Resolved or Settled
            if (Number(info[5]) === userOutcome) {
              status = 'WON';
            } else {
              status = 'LOST';
            }
          }
          
          let payout = 0n;
          let oddsLabel = "0.00x";
          if (outcomePool > 0n && info[4] > 0n) {
             payout = (userStake * info[4]) / outcomePool;
             oddsLabel = (Number(info[4]) / Number(outcomePool)).toFixed(2) + 'x';
          }

          let decodedMatch = "Demo Match";
          try { decodedMatch = ethers.decodeBytes32String(info[0]); } catch (e) {}

          loadedBets.push({
            id: address,
            marketAddress: address,
            date: new Date(Number(info[2]) * 1000).toLocaleString(),
            match: decodedMatch,
            sport: 'Prediction',
            market: 'Match Winner',
            selection: info[1][userOutcome],
            stake: parseFloat(ethers.formatEther(userStake)),
            potentialPayout: parseFloat(ethers.formatEther(payout)),
            status,
            oddsLabel,
          });
        }
      }
      // Sort newest first
      setLiveBets(loadedBets.reverse());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockchainBets();
    const interval = setInterval(fetchBlockchainBets, 5000); // Live poll every 5s
    return () => clearInterval(interval);
  }, [provider, account]);

  const filteredBets = liveBets.filter(bet => {
    if (activeTab === 'ACTIVE') return bet.status === 'ACTIVE';
    if (activeTab === 'SETTLED') return bet.status === 'WON' || bet.status === 'LOST';
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-[var(--color-accent-blue)]/20 p-3 rounded-xl border border-[var(--color-accent-blue)]/30">
            <TrendingUp className="text-[var(--color-accent-blue)]" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">My Bets</h1>
            <p className="text-[var(--color-text-muted)] text-sm mt-1">Track your live blockchain wagers and payouts</p>
          </div>
        </div>
        {!account && (
          <button onClick={connectWallet} className="bg-[var(--color-accent-blue)] hover:bg-blue-600 text-white font-bold px-6 py-2 rounded-lg transition-colors">
            Connect Wallet
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-[var(--color-border)] mb-8 pb-px">
        {['ALL', 'ACTIVE', 'SETTLED'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-3 font-semibold text-sm transition-all relative ${
              activeTab === tab
                ? 'text-white'
                : 'text-[var(--color-text-muted)] hover:text-gray-300'
            }`}
          >
            {tab === 'ACTIVE' ? 'Active' : tab === 'SETTLED' ? 'Settled' : 'All Bets'}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--color-accent-blue)] rounded-t-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            )}
          </button>
        ))}
      </div>

      {/* Bet List */}
      <div className="space-y-4">
        {!account ? (
           <div className="text-center py-20 text-[var(--color-text-muted)] font-bold text-lg">
             Please connect your wallet to view your live bets.
           </div>
        ) : filteredBets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-sidebar-bg)]/40">
            <span className="text-6xl mb-5 opacity-40">🧾</span>
            <h2 className="text-xl font-bold text-white mb-2">{loading ? 'Loading Blockchain Bets...' : 'No Bets Found'}</h2>
            <p className="text-[var(--color-text-muted)] text-sm text-center max-w-sm">
              You don't have any {activeTab.toLowerCase()} bets on the network at the moment.
            </p>
          </div>
        ) : (
          filteredBets.map((bet) => (
            <BetRow key={bet.id} bet={bet} onClaimSuccess={fetchBlockchainBets} />
          ))
        )}
      </div>
    </div>
  );
}
