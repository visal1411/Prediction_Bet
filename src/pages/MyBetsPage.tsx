import { useState } from 'react';
import { Clock, CheckCircle2, XCircle, TrendingUp } from 'lucide-react';

// Mock bet history data
const betHistory = [
  {
    id: 'bet-1',
    date: '2026-07-18T14:30:00Z',
    match: 'Manchester Utd vs Arsenal',
    sport: 'Football',
    market: 'Match Winner',
    selection: 'Manchester Utd',
    odds: 2.45,
    stake: 50.00,
    potentialPayout: 122.50,
    status: 'ACTIVE',
  },
  {
    id: 'bet-2',
    date: '2026-07-17T18:00:00Z',
    match: 'Lakers vs Warriors',
    sport: 'Basketball',
    market: 'Point Spread',
    selection: 'Lakers (-2.5)',
    odds: 1.91,
    stake: 100.00,
    potentialPayout: 191.00,
    status: 'WON',
  },
  {
    id: 'bet-3',
    date: '2026-07-16T21:00:00Z',
    match: 'Alcaraz vs Djokovic',
    sport: 'Tennis',
    market: 'Set Betting',
    selection: 'Alcaraz 3-1',
    odds: 4.50,
    stake: 20.00,
    potentialPayout: 90.00,
    status: 'LOST',
  }
];

export default function MyBetsPage() {
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACTIVE' | 'SETTLED'>('ALL');

  const filteredBets = betHistory.filter(bet => {
    if (activeTab === 'ACTIVE') return bet.status === 'ACTIVE';
    if (activeTab === 'SETTLED') return bet.status === 'WON' || bet.status === 'LOST';
    return true;
  });

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

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-[var(--color-accent-blue)]/20 p-3 rounded-xl border border-[var(--color-accent-blue)]/30">
          <TrendingUp className="text-[var(--color-accent-blue)]" size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">My Bets</h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">Track your active wagers and betting history</p>
        </div>
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
        {filteredBets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-sidebar-bg)]/40">
            <span className="text-6xl mb-5 opacity-40">🧾</span>
            <h2 className="text-xl font-bold text-white mb-2">No Bets Found</h2>
            <p className="text-[var(--color-text-muted)] text-sm text-center max-w-sm">
              You don't have any {activeTab.toLowerCase()} bets at the moment.
            </p>
          </div>
        ) : (
          filteredBets.map((bet) => (
            <div 
              key={bet.id} 
              className="bg-[var(--color-sidebar-bg)] border border-[var(--color-border)] rounded-xl overflow-hidden hover:border-gray-500 transition-colors shadow-sm relative group"
            >
              {/* Highlight strip indicating status */}
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
                      <span className="text-xs text-[var(--color-text-muted)]">{new Date(bet.date).toLocaleDateString()}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{bet.match}</h3>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-md border text-xs font-bold uppercase tracking-wider ${getStatusStyle(bet.status)}`}>
                    {getStatusIcon(bet.status)}
                    {bet.status}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[var(--color-card-bg)] p-4 rounded-lg border border-[var(--color-border)]">
                  <div>
                    <div className="text-[var(--color-text-muted)] text-xs mb-1 uppercase tracking-wider font-semibold">Selection</div>
                    <div className="text-white font-bold">{bet.selection}</div>
                    <div className="text-[var(--color-text-muted)] text-xs mt-0.5">{bet.market}</div>
                  </div>
                  <div>
                    <div className="text-[var(--color-text-muted)] text-xs mb-1 uppercase tracking-wider font-semibold">Odds</div>
                    <div className="text-[var(--color-accent-green)] font-bold text-lg">{bet.odds.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-[var(--color-text-muted)] text-xs mb-1 uppercase tracking-wider font-semibold">Stake</div>
                    <div className="text-white font-bold">${bet.stake.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-[var(--color-text-muted)] text-xs mb-1 uppercase tracking-wider font-semibold">
                      {bet.status === 'WON' ? 'Payout' : 'Pot. Payout'}
                    </div>
                    <div className={`font-bold text-lg ${bet.status === 'WON' ? 'text-[var(--color-accent-green)]' : 'text-white'}`}>
                      ${bet.potentialPayout.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
