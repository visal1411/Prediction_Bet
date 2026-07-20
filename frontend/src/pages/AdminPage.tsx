import { useState } from 'react';
import { useWallet } from '../context/Web3Context';
import {
  Shield, Plus, AlertTriangle, Activity, Eye, Pause, Play,
  Trash2, CheckCircle2, XCircle, Clock, RefreshCw, Settings,
  ChevronDown, ChevronUp, Search, ExternalLink
} from 'lucide-react';
import { mockMarkets } from '../data/mockData';
import type { Market } from '../data/mockData';
import { getMarketContract } from '../app/contracts';


// ── Helper Components ─────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Market['status'] }) {
  const config: Record<string, { bg: string; text: string; icon: React.ReactNode }> = {
    open: {
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      text: 'text-emerald-400',
      icon: <Play size={12} />,
    },
    locked: {
      bg: 'bg-amber-500/10 border-amber-500/20',
      text: 'text-amber-400',
      icon: <Clock size={12} />,
    },
    resolved: {
      bg: 'bg-blue-500/10 border-blue-500/20',
      text: 'text-blue-400',
      icon: <CheckCircle2 size={12} />,
    },
    settled: {
      bg: 'bg-[var(--color-text-muted)]/10 border-[var(--color-text-muted)]/20',
      text: 'text-[var(--color-text-muted)]',
      icon: <CheckCircle2 size={12} />,
    },
    paused: {
      bg: 'bg-red-500/10 border-red-500/20',
      text: 'text-red-400',
      icon: <Pause size={12} />,
    },
  };

  const c = config[status];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold uppercase tracking-wider ${c.bg} ${c.text}`}>
      {c.icon}
      {status}
    </span>
  );
}

function StatCard({ label, value, sub, icon, accent = 'blue' }: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  accent?: 'blue' | 'green' | 'amber' | 'red';
}) {
  const accents: Record<string, string> = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    green: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    red: 'bg-red-500/10 border-red-500/20 text-red-400',
  };

  return (
    <div className="bg-[var(--color-sidebar-bg)] border border-[var(--color-border)] rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[var(--color-text-muted)] text-xs uppercase tracking-wider font-semibold">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${accents[accent]}`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-black text-white">{value}</div>
      {sub && <div className="text-[var(--color-text-muted)] text-xs mt-1">{sub}</div>}
    </div>
  );
}

// ── Main Admin Page ───────────────────────────────────────────────────────────

export default function AdminPage() {
  const { account, connectWallet, isConnecting, signer } = useWallet();
  const [activeTab, setActiveTab] = useState<'MARKETS' | 'DEMO' | 'CREATE' | 'EMERGENCY'>('MARKETS');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedMarket, setExpandedMarket] = useState<string | null>(null);

  // Create Market form state
  const [createForm, setCreateForm] = useState({
    sport: 'Football',
    league: '',
    teamHome: '',
    teamAway: '',
    eventDate: '',
    eventTime: '',
    externalApiId: '',
    deadlineMinutesBefore: 30,
  });

  // Manual resolution state
  const [resolveMarketId, setResolveMarketId] = useState('');
  const [resolveOutcome, setResolveOutcome] = useState<number | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  const handleForceResolve = async () => {
    if (!account || !resolveMarketId || resolveOutcome === null) return;
    try {
      setIsResolving(true);
      if (!signer) {
        await connectWallet();
        throw new Error("Connecting wallet... please try clicking Resolve again.");
      }
      const contract = getMarketContract(resolveMarketId, signer);
      const tx = await contract.resolve(resolveOutcome);
      await tx.wait();
      alert(`Market ${resolveMarketId} resolved successfully to outcome ${resolveOutcome}!`);
      setResolveMarketId('');
      setResolveOutcome(null);
    } catch (err: any) {
      console.error(err);
      alert("Failed to resolve: " + (err.reason || err.message));
    } finally {
      setIsResolving(false);
    }
  };

  // ── Not connected ─────────────────────────────────────────────────────────

  if (!account) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-24 h-24 bg-[var(--color-sidebar-bg)] border border-[var(--color-border)] rounded-full flex items-center justify-center mb-6 shadow-xl">
          <Shield size={40} className="text-[var(--color-text-muted)]" />
        </div>
        <h2 className="text-3xl font-black text-white mb-2">Admin Access Required</h2>
        <p className="text-[var(--color-text-muted)] mb-8 max-w-md">
          Connect your admin wallet to access the market management panel. Only the contract owner can create and manage markets.
        </p>
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="bg-[var(--color-accent-blue)] hover:bg-blue-600 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-lg transition-colors shadow-lg shadow-blue-500/20"
        >
          {isConnecting ? 'Connecting...' : 'Connect Admin Wallet'}
        </button>
      </div>
    );
  }

  // ── Filter markets by search ──────────────────────────────────────────────

  const filteredMarkets = mockMarkets.filter(m =>
    m.teamHome.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.teamAway.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.league.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.eventId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ── Stat calculations ─────────────────────────────────────────────────────

  const openCount = mockMarkets.filter(m => m.status === 'open').length;
  const lockedCount = mockMarkets.filter(m => m.status === 'locked').length;
  const resolvedCount = mockMarkets.filter(m => m.status === 'resolved' || m.status === 'settled').length;
  const totalPoolEth = mockMarkets.reduce((sum, m) => sum + parseFloat(m.totalPool), 0);

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-amber-500/20 p-3 rounded-xl border border-amber-500/30">
            <Shield className="text-amber-400" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Admin Panel</h1>
            <p className="text-[var(--color-text-muted)] text-sm mt-1">
              Manage markets, create events, and handle emergencies
            </p>
          </div>
        </div>

        {/* Admin badge */}
        <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 px-4 py-2 rounded-lg">
          <Shield size={16} className="text-amber-400" />
          <span className="text-amber-400 text-sm font-bold">OWNER</span>
          <span className="text-[var(--color-text-muted)] text-xs font-mono">
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Open Markets"
          value={openCount.toString()}
          sub="Accepting bets"
          icon={<Play size={16} />}
          accent="green"
        />
        <StatCard
          label="Locked Markets"
          value={lockedCount.toString()}
          sub="Awaiting results"
          icon={<Clock size={16} />}
          accent="amber"
        />
        <StatCard
          label="Resolved"
          value={resolvedCount.toString()}
          sub="Completed"
          icon={<CheckCircle2 size={16} />}
          accent="blue"
        />
        <StatCard
          label="Total Pool"
          value={`${totalPoolEth.toFixed(1)} ETH`}
          sub="Across all markets"
          icon={<Activity size={16} />}
          accent="blue"
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-[var(--color-border)] mb-8 pb-px">
        {([
          { id: 'MARKETS' as const, label: 'Active Markets', icon: <Eye size={16} /> },
          { id: 'DEMO' as const, label: 'Demo Markets', icon: <Activity size={16} /> },
          { id: 'CREATE' as const, label: 'Create Market', icon: <Plus size={16} /> },
          { id: 'EMERGENCY' as const, label: 'Emergency Controls', icon: <AlertTriangle size={16} /> },
        ]).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm transition-all relative ${
              activeTab === tab.id
                ? 'text-white'
                : 'text-[var(--color-text-muted)] hover:text-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
            {activeTab === tab.id && (
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--color-accent-blue)] rounded-t-full shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
            )}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB: ACTIVE MARKETS
          ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'MARKETS' && (
        <div>
          {/* Search bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search markets by team, league, or event ID..."
              className="w-full bg-[var(--color-sidebar-bg)] border border-[var(--color-border)] rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
            />
          </div>

          {/* Markets list */}
          <div className="space-y-4">
            {filteredMarkets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-sidebar-bg)]/40">
                <span className="text-5xl mb-4 opacity-40">📋</span>
                <h3 className="text-lg font-bold text-white mb-1">No Markets Found</h3>
                <p className="text-[var(--color-text-muted)] text-sm">
                  {searchQuery ? 'Try a different search term.' : 'Create your first market to get started.'}
                </p>
              </div>
            ) : (
              filteredMarkets.map(market => {
                const isExpanded = expandedMarket === market.id;
                return (
                  <div
                    key={market.id}
                    className="bg-[var(--color-sidebar-bg)] border border-[var(--color-border)] rounded-xl overflow-hidden hover:border-gray-600 transition-colors"
                  >
                    {/* Market row header */}
                    <button
                      onClick={() => setExpandedMarket(isExpanded ? null : market.id)}
                      className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--color-card-hover)] transition-colors"
                    >
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs font-bold text-[var(--color-text-muted)] uppercase tracking-wider">{market.sport}</span>
                            <span className="text-gray-600 text-xs">•</span>
                            <span className="text-xs text-[var(--color-text-muted)]">{market.league}</span>
                            <span className="text-gray-600 text-xs">•</span>
                            <span className="text-xs text-[var(--color-text-muted)] font-mono">{market.eventId}</span>
                            {market.isDemo && (
                              <span className="ml-2 bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold px-1.5 py-0.5 rounded">DEMO</span>
                            )}
                          </div>
                          <h3 className="text-white font-bold text-lg">
                            {market.teamHome} <span className="text-[var(--color-text-muted)] font-normal">vs</span> {market.teamAway}
                          </h3>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <div className="text-white font-bold">{market.totalPool} ETH</div>
                            <div className="text-[var(--color-text-muted)] text-xs">{market.totalBettors} bettors</div>
                          </div>
                          <StatusBadge status={market.status} />
                          {isExpanded ? (
                            <ChevronUp size={18} className="text-[var(--color-text-muted)]" />
                          ) : (
                            <ChevronDown size={18} className="text-[var(--color-text-muted)]" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Expanded details */}
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${isExpanded ? 'opacity-100' : 'opacity-0'}`}
                      style={{ gridTemplateRows: isExpanded ? '1fr' : '0fr' }}
                    >
                      <div className="overflow-hidden">
                        <div className="px-5 pb-5 border-t border-[var(--color-border)]">
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            {/* Pool distribution */}
                            <div className="bg-[var(--color-primary-bg)] rounded-xl p-4">
                              <h4 className="text-white font-bold text-sm mb-3">Pool Distribution</h4>
                              <div className="space-y-3">
                                {[
                                  { label: `${market.teamHome} (Home)`, val: market.poolHome, pct: (parseFloat(market.poolHome) / parseFloat(market.totalPool) * 100) || 0, color: 'bg-blue-500' },
                                  { label: 'Draw', val: market.poolDraw, pct: (parseFloat(market.poolDraw) / parseFloat(market.totalPool) * 100) || 0, color: 'bg-amber-500' },
                                  { label: `${market.teamAway} (Away)`, val: market.poolAway, pct: (parseFloat(market.poolAway) / parseFloat(market.totalPool) * 100) || 0, color: 'bg-red-500' },
                                ].map(pool => (
                                  <div key={pool.label}>
                                    <div className="flex justify-between text-xs mb-1">
                                      <span className="text-[var(--color-text-muted)]">{pool.label}</span>
                                      <span className="text-white font-semibold">{pool.val} ETH ({pool.pct.toFixed(0)}%)</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-[var(--color-border)] overflow-hidden">
                                      <div className={`h-full rounded-full ${pool.color} transition-all duration-500`} style={{ width: `${pool.pct}%` }} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Contract details */}
                            <div className="bg-[var(--color-primary-bg)] rounded-xl p-4">
                              <h4 className="text-white font-bold text-sm mb-3">Contract Details</h4>
                              <div className="space-y-3">
                                {[
                                  { label: 'Contract', value: market.contractAddress },
                                  { label: 'Event Date', value: new Date(market.eventDate).toLocaleString() },
                                  { label: 'Bet Deadline', value: new Date(market.deadline).toLocaleString() },
                                  { label: 'Status', value: market.status.toUpperCase() },
                                ].map(detail => (
                                  <div key={detail.label} className="flex justify-between">
                                    <span className="text-[var(--color-text-muted)] text-xs">{detail.label}</span>
                                    <span className="text-white text-xs font-medium font-mono">{detail.value}</span>
                                  </div>
                                ))}
                              </div>

                              {/* Action buttons */}
                              <div className="flex gap-2 mt-4 pt-4 border-t border-[var(--color-border)]">
                                <button className="flex-1 flex items-center justify-center gap-1.5 bg-[var(--color-card-bg)] border border-[var(--color-border)] hover:border-gray-500 text-white text-xs font-bold py-2 rounded-lg transition-colors">
                                  <ExternalLink size={12} />
                                  Etherscan
                                </button>
                                {market.status === 'open' && (
                                  <button className="flex-1 flex items-center justify-center gap-1.5 bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 text-xs font-bold py-2 rounded-lg transition-colors">
                                    <Pause size={12} />
                                    Pause
                                  </button>
                                )}
                                {market.status === 'locked' && (
                                  <button className="flex-1 flex items-center justify-center gap-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 text-xs font-bold py-2 rounded-lg transition-colors">
                                    <RefreshCw size={12} />
                                    Force Resolve
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Winning outcome badge for resolved */}
                          {market.status === 'resolved' && market.winningOutcome !== undefined && (
                            <div className="mt-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
                              <CheckCircle2 size={20} className="text-emerald-400" />
                              <div>
                                <span className="text-emerald-400 font-bold text-sm">Resolved — </span>
                                <span className="text-white font-bold text-sm">
                                  {market.winningOutcome === 0 ? `${market.teamHome} Win` :
                                   market.winningOutcome === 1 ? `${market.teamAway} Win` : 'Draw'}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB: DEMO MARKETS
          ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'DEMO' && (
        <div className="space-y-4">
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5 mb-6">
            <h3 className="text-purple-400 font-bold mb-1">Live Presentation Mode</h3>
            <p className="text-[var(--color-text-muted)] text-sm">Use these markets during the class demo. They have the "isDemo" flag enabled, meaning you (the owner) can resolve them manually without waiting for the Chainlink Oracle or real live games.</p>
          </div>
          {mockMarkets.filter(m => m.isDemo).map(market => (
            <div key={market.id} className="bg-[var(--color-sidebar-bg)] border border-[var(--color-border)] rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] font-bold px-1.5 py-0.5 rounded mr-2">DEMO MARKET</span>
                  <span className="text-gray-400 font-mono text-sm">{market.eventId}</span>
                  <h3 className="text-white font-bold text-xl mt-1">{market.teamHome} vs {market.teamAway}</h3>
                </div>
                <div className="text-right">
                  <StatusBadge status={market.status} />
                  <div className="text-white font-bold mt-2">{market.totalPool} ETH Pool</div>
                </div>
              </div>
              
              <div className="bg-[var(--color-primary-bg)] rounded-xl p-4 border border-[var(--color-border)]">
                <p className="text-sm text-gray-400 mb-3 text-center uppercase tracking-wider font-bold">Manual Resolution Controls</p>
                <div className="flex gap-3">
                  <button onClick={() => alert(`Resolved ${market.eventId} as ${market.teamHome} Win`)} className="flex-1 py-3 px-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg font-bold transition-all text-sm">
                    🏆 Declare: {market.teamHome} Win
                  </button>
                  <button onClick={() => alert(`Resolved ${market.eventId} as Draw`)} className="flex-1 py-3 px-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-lg font-bold transition-all text-sm">
                    🤝 Declare: Draw
                  </button>
                  <button onClick={() => alert(`Resolved ${market.eventId} as ${market.teamAway} Win`)} className="flex-1 py-3 px-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 rounded-lg font-bold transition-all text-sm">
                    🏆 Declare: {market.teamAway} Win
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB: CREATE MARKET
          ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'CREATE' && (
        <div className="max-w-3xl">
          <div className="bg-[var(--color-sidebar-bg)] border border-[var(--color-border)] rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-[var(--color-accent-blue)]/20 p-2.5 rounded-lg border border-[var(--color-accent-blue)]/30">
                <Plus size={20} className="text-[var(--color-accent-blue)]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Create New Market</h2>
                <p className="text-[var(--color-text-muted)] text-xs">Deploy a new PredictionMarket contract for a sporting event</p>
              </div>
            </div>

            <div className="space-y-6">
              {/* Sport & League row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[var(--color-text-muted)] text-xs uppercase tracking-wider font-semibold mb-2">Sport</label>
                  <select
                    value={createForm.sport}
                    onChange={(e) => setCreateForm({ ...createForm, sport: e.target.value })}
                    className="w-full bg-[var(--color-primary-bg)] border border-[var(--color-border)] rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors appearance-none cursor-pointer"
                  >
                    {['Football', 'Basketball', 'Tennis', 'Volleyball', 'Racing', 'Esports'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[var(--color-text-muted)] text-xs uppercase tracking-wider font-semibold mb-2">League</label>
                  <input
                    type="text"
                    value={createForm.league}
                    onChange={(e) => setCreateForm({ ...createForm, league: e.target.value })}
                    placeholder="e.g. Premier League"
                    className="w-full bg-[var(--color-primary-bg)] border border-[var(--color-border)] rounded-xl py-3 px-4 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
                  />
                </div>
              </div>

              {/* Teams row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[var(--color-text-muted)] text-xs uppercase tracking-wider font-semibold mb-2">Home Team</label>
                  <input
                    type="text"
                    value={createForm.teamHome}
                    onChange={(e) => setCreateForm({ ...createForm, teamHome: e.target.value })}
                    placeholder="e.g. Manchester United"
                    className="w-full bg-[var(--color-primary-bg)] border border-[var(--color-border)] rounded-xl py-3 px-4 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[var(--color-text-muted)] text-xs uppercase tracking-wider font-semibold mb-2">Away Team</label>
                  <input
                    type="text"
                    value={createForm.teamAway}
                    onChange={(e) => setCreateForm({ ...createForm, teamAway: e.target.value })}
                    placeholder="e.g. Arsenal"
                    className="w-full bg-[var(--color-primary-bg)] border border-[var(--color-border)] rounded-xl py-3 px-4 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
                  />
                </div>
              </div>

              {/* VS Preview */}
              {createForm.teamHome && createForm.teamAway && (
                <div className="bg-[var(--color-primary-bg)] border border-[var(--color-border)] rounded-xl p-4">
                  <div className="text-center">
                    <div className="text-[var(--color-text-muted)] text-[10px] uppercase tracking-widest mb-2">Market Preview</div>
                    <div className="text-white text-lg font-bold">
                      {createForm.teamHome} <span className="text-[var(--color-text-muted)] font-normal mx-2">vs</span> {createForm.teamAway}
                    </div>
                    {createForm.league && (
                      <div className="text-[var(--color-text-muted)] text-xs mt-1">{createForm.sport} • {createForm.league}</div>
                    )}
                  </div>
                </div>
              )}

              {/* Date & Time row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[var(--color-text-muted)] text-xs uppercase tracking-wider font-semibold mb-2">Event Date</label>
                  <input
                    type="date"
                    value={createForm.eventDate}
                    onChange={(e) => setCreateForm({ ...createForm, eventDate: e.target.value })}
                    className="w-full bg-[var(--color-primary-bg)] border border-[var(--color-border)] rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-[var(--color-text-muted)] text-xs uppercase tracking-wider font-semibold mb-2">Kick-off Time</label>
                  <input
                    type="time"
                    value={createForm.eventTime}
                    onChange={(e) => setCreateForm({ ...createForm, eventTime: e.target.value })}
                    className="w-full bg-[var(--color-primary-bg)] border border-[var(--color-border)] rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* SportsData.io Event ID */}
              <div>
                <label className="block text-[var(--color-text-muted)] text-xs uppercase tracking-wider font-semibold mb-2">
                  SportsData.io Game ID
                  <span className="text-[var(--color-text-muted)] font-normal normal-case tracking-normal ml-2">(for oracle resolution)</span>
                </label>
                <input
                  type="text"
                  value={createForm.externalApiId}
                  onChange={(e) => setCreateForm({ ...createForm, externalApiId: e.target.value })}
                  placeholder="e.g. 12345"
                  className="w-full bg-[var(--color-primary-bg)] border border-[var(--color-border)] rounded-xl py-3 px-4 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors font-mono"
                />
                <p className="text-[var(--color-text-muted)] text-xs mt-2">
                  This ID links the market to the SportsData.io API so the Chainlink Oracle can fetch the result automatically.
                </p>
              </div>

              {/* Deadline offset */}
              <div>
                <label className="block text-[var(--color-text-muted)] text-xs uppercase tracking-wider font-semibold mb-2">
                  Close Bets Before Kick-off
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={5}
                    max={1440}
                    value={createForm.deadlineMinutesBefore}
                    onChange={(e) => setCreateForm({ ...createForm, deadlineMinutesBefore: Math.max(5, Number(e.target.value)) })}
                    className="w-24 bg-[var(--color-primary-bg)] border border-[var(--color-border)] rounded-xl py-3 px-4 text-white text-sm font-bold text-center focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors"
                  />
                  <span className="text-[var(--color-text-muted)] text-sm">minutes before kick-off</span>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-[var(--color-border)]" />

              {/* Summary before deploy */}
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle size={18} className="text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-amber-400 font-bold text-sm mb-1">This will deploy a smart contract</p>
                    <p className="text-[var(--color-text-muted)] text-xs leading-relaxed">
                      Creating a market deploys a new <code className="text-white bg-[var(--color-primary-bg)] px-1.5 py-0.5 rounded">PredictionMarket.sol</code> contract to the blockchain via the MarketFactory. 
                      This requires a transaction and gas fees on the connected network.
                    </p>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                className="w-full bg-[var(--color-accent-green)] hover:bg-[var(--color-accent-green-hover)] text-[var(--color-sidebar-bg)] font-black py-4 rounded-xl transition-all duration-200 text-sm tracking-wide shadow-lg shadow-green-500/20 active:scale-[0.98] flex items-center justify-center gap-2"
              >
                <Plus size={18} strokeWidth={3} />
                DEPLOY MARKET CONTRACT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          TAB: EMERGENCY CONTROLS
          ═══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'EMERGENCY' && (
        <div className="space-y-6">
          {/* Warning banner */}
          <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5 flex items-start gap-4">
            <AlertTriangle size={24} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-red-400 font-bold mb-1">Emergency Controls</h3>
              <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
                These actions are irreversible or have significant impact. Use only when the oracle fails or in case of an emergency. 
                All actions require the contract owner's wallet signature.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Pause / Unpause */}
            <div className="bg-[var(--color-sidebar-bg)] border border-[var(--color-border)] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
                  <Pause size={18} className="text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Circuit Breaker</h3>
                  <p className="text-[var(--color-text-muted)] text-xs">Pause/unpause all betting</p>
                </div>
              </div>
              <p className="text-[var(--color-text-muted)] text-sm mb-6 leading-relaxed">
                Pausing the contract prevents all new bets from being placed and blocks withdrawals. 
                Use this if you detect suspicious activity or a contract vulnerability.
              </p>
              <div className="flex gap-3">
                <button className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 font-bold py-3 rounded-xl transition-colors text-sm">
                  <Pause size={16} />
                  Pause All
                </button>
                <button className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 font-bold py-3 rounded-xl transition-colors text-sm">
                  <Play size={16} />
                  Unpause All
                </button>
              </div>
            </div>

            {/* Manual Resolution */}
            <div className="bg-[var(--color-sidebar-bg)] border border-[var(--color-border)] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                  <Settings size={18} className="text-blue-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Manual Resolution</h3>
                  <p className="text-[var(--color-text-muted)] text-xs">Oracle fallback</p>
                </div>
              </div>
              <p className="text-[var(--color-text-muted)] text-sm mb-4 leading-relaxed">
                If the Chainlink Oracle fails to resolve a market automatically, 
                you can manually set the winning outcome as the contract owner.
              </p>

              <div className="space-y-3">
                <div>
                  <label className="block text-[var(--color-text-muted)] text-xs uppercase tracking-wider font-semibold mb-2">Market Contract Address</label>
                  <input
                    type="text"
                    value={resolveMarketId}
                    onChange={(e) => setResolveMarketId(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-[var(--color-primary-bg)] border border-[var(--color-border)] rounded-xl py-3 px-4 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[var(--color-accent-blue)] transition-colors font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[var(--color-text-muted)] text-xs uppercase tracking-wider font-semibold mb-2">Winning Outcome</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Home Win', value: 0 },
                      { label: 'Draw', value: 2 },
                      { label: 'Away Win', value: 1 },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        onClick={() => setResolveOutcome(opt.value)}
                        className={`py-3 rounded-xl text-sm font-bold transition-all duration-200 border ${
                          resolveOutcome === opt.value
                            ? 'bg-[var(--color-accent-blue)] border-[var(--color-accent-blue)] text-white shadow-lg shadow-blue-500/20'
                            : 'bg-[var(--color-primary-bg)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-gray-500 hover:text-white'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleForceResolve}
                  disabled={!resolveMarketId || resolveOutcome === null || isResolving}
                  className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-[var(--color-card-bg)] disabled:text-[var(--color-text-muted)] disabled:cursor-not-allowed text-[var(--color-sidebar-bg)] font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2 mt-2"
                >
                  <RefreshCw size={16} className={isResolving ? 'animate-spin' : ''} />
                  {isResolving ? 'Resolving on Blockchain...' : 'Force Resolve Market'}
                </button>
              </div>
            </div>

            {/* Cancel Market */}
            <div className="bg-[var(--color-sidebar-bg)] border border-[var(--color-border)] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-red-500/10 p-2 rounded-lg border border-red-500/20">
                  <Trash2 size={18} className="text-red-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Cancel Market</h3>
                  <p className="text-[var(--color-text-muted)] text-xs">Refund all bettors</p>
                </div>
              </div>
              <p className="text-[var(--color-text-muted)] text-sm mb-4 leading-relaxed">
                Cancelling a market refunds all bettors their original stake. 
                Use this if the event is cancelled or postponed.
              </p>

              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Market contract address (0x...)"
                  className="w-full bg-[var(--color-primary-bg)] border border-[var(--color-border)] rounded-xl py-3 px-4 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors font-mono"
                />
                <button className="w-full bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2">
                  <XCircle size={16} />
                  Cancel Market & Refund
                </button>
              </div>
            </div>

            {/* Oracle Status */}
            <div className="bg-[var(--color-sidebar-bg)] border border-[var(--color-border)] rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                  <Activity size={18} className="text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold">Oracle Status</h3>
                  <p className="text-[var(--color-text-muted)] text-xs">Chainlink Functions health</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-[var(--color-primary-bg)] rounded-xl p-3 flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)] text-xs">Subscription ID</span>
                  <span className="text-white text-xs font-mono font-bold">Not configured</span>
                </div>
                <div className="bg-[var(--color-primary-bg)] rounded-xl p-3 flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)] text-xs">LINK Balance</span>
                  <span className="text-white text-xs font-bold">—</span>
                </div>
                <div className="bg-[var(--color-primary-bg)] rounded-xl p-3 flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)] text-xs">Automation Status</span>
                  <span className="text-amber-400 text-xs font-bold">Pending Setup</span>
                </div>
                <div className="bg-[var(--color-primary-bg)] rounded-xl p-3 flex items-center justify-between">
                  <span className="text-[var(--color-text-muted)] text-xs">SportsData.io API</span>
                  <span className="text-amber-400 text-xs font-bold">Sandbox (Dev)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
