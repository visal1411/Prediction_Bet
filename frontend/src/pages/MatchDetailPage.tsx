import { useParams, useNavigate } from 'react-router';
import { ArrowLeft, Calendar, Clock, MapPin, X } from 'lucide-react';
import { getMatchDetail } from '../data/matchDetailData';
import { useState } from 'react';
import { useBetSlip } from '../context/BetSlipContext';

type FormResult = 'W' | 'D' | 'L';

function FormBadge({ result }: { result: FormResult }) {
  const colors: Record<FormResult, string> = {
    W: 'bg-green-500 text-white',
    D: 'bg-yellow-500 text-black',
    L: 'bg-red-500 text-white',
  };
  return (
    <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${colors[result]}`}>
      {result}
    </span>
  );
}

function StatBar({ label, val1, val2 }: { label: string; val1: string | number; val2: string | number }) {
  const n1 = parseFloat(String(val1));
  const n2 = parseFloat(String(val2));
  const total = n1 + n2 || 1;
  const pct1 = Math.round((n1 / total) * 100);
  const pct2 = 100 - pct1;

  return (
    <div className="mb-5">
      <div className="flex justify-between text-sm mb-2">
        <span className="text-white font-semibold">{val1}</span>
        <span className="text-[var(--color-text-muted)] text-xs uppercase tracking-wider">{label}</span>
        <span className="text-white font-semibold">{val2}</span>
      </div>
      <div className="flex h-1.5 rounded-full overflow-hidden bg-[var(--color-border)]">
        <div className="bg-[var(--color-accent-blue)] transition-all duration-700" style={{ width: `${pct1}%` }} />
        <div className="bg-red-500 transition-all duration-700" style={{ width: `${pct2}%` }} />
      </div>
    </div>
  );
}

export default function MatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const detail = getMatchDetail(Number(id));
  const { addBet, hasBet, updateStake } = useBetSlip();
  const [expandedMarket, setExpandedMarket] = useState<string | null>('Full Time Result');
  const [showBetModal, setShowBetModal] = useState(false);
  const [selectedPrediction, setSelectedPrediction] = useState<any>(null);
  const [modalStake, setModalStake] = useState<number>(10);

  const closeBetModal = () => {
    setShowBetModal(false);
    setTimeout(() => {
      setSelectedPrediction(null);
      setModalStake(10);
    }, 300);
  };

  if (!detail) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center px-8 py-20">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-white mb-2">Match Not Found</h2>
        <p className="text-[var(--color-text-muted)] mb-6">This match doesn't have detailed data yet.</p>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-[var(--color-accent-blue)] text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
        >
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    );
  }

  const { match, date, time, venue, team1, team2, stats, markets } = detail;

  return (
    <div className="max-w-7xl mx-auto px-6 py-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-white transition-colors mb-6 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to matches</span>
      </button>

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden mb-6 bg-[var(--color-sidebar-bg)] border border-[var(--color-border)]">
        <div
          className="absolute inset-0 opacity-10"
          style={{ background: `linear-gradient(135deg, ${team1.color} 0%, transparent 50%, ${team2.color} 100%)` }}
        />
        <div className="relative z-10 p-8">
          <div className="flex items-center justify-center gap-12">
            {/* Team 1 */}
            <div className="text-center flex-1">
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black mx-auto mb-3 shadow-2xl border border-[var(--color-border)]"
                style={{ background: `linear-gradient(135deg, ${team1.color}33, ${team1.color}11)` }}
              >
                <span className="text-white font-black text-2xl">{team1.shortName}</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white">{team1.name}</h2>
              <p className="text-[var(--color-text-muted)] text-xs uppercase tracking-widest mt-1">{team1.league}</p>
              {match.isLive && (
                <div className="text-5xl font-black text-white mt-3">{match.score1}</div>
              )}
            </div>

            {/* Center */}
            <div className="text-center flex-shrink-0">
              <div className="text-3xl font-black text-[var(--color-text-muted)] mb-3">VS</div>
              {match.isLive ? (
                <div className="flex items-center gap-1.5 bg-red-500/20 border border-red-500/40 rounded-full px-3 py-1.5 mx-auto w-fit">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-400 text-xs font-bold tracking-wider">LIVE ODDS</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-[var(--color-accent-blue)]/20 border border-[var(--color-accent-blue)]/40 rounded-full px-3 py-1.5 mx-auto w-fit">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-accent-blue)]" />
                  <span className="text-blue-400 text-xs font-bold tracking-wider">UPCOMING</span>
                </div>
              )}
            </div>

            {/* Team 2 */}
            <div className="text-center flex-1">
              <div
                className="w-24 h-24 rounded-2xl flex items-center justify-center text-4xl font-black mx-auto mb-3 shadow-2xl border border-[var(--color-border)]"
                style={{ background: `linear-gradient(135deg, ${team2.color}33, ${team2.color}11)` }}
              >
                <span className="text-white font-black text-2xl">{team2.shortName}</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white">{team2.name}</h2>
              <p className="text-[var(--color-text-muted)] text-xs uppercase tracking-widest mt-1">{team2.league}</p>
              {match.isLive && (
                <div className="text-5xl font-black text-white mt-3">{match.score2}</div>
              )}
            </div>
          </div>

          {/* Color Comparison Bar (Pool Distribution) */}
          <div className="mt-8 max-w-lg mx-auto">
            <div className="flex justify-between text-xs font-bold text-[var(--color-text-muted)] mb-2 uppercase tracking-widest">
              <span>{team1.shortName} ({match.ratio.win1}%)</span>
              {match.ratio.draw ? <span>DRAW ({match.ratio.draw}%)</span> : null}
              <span>{team2.shortName} ({match.ratio.win2}%)</span>
            </div>
            <div className="flex h-2.5 rounded-full overflow-hidden bg-[var(--color-border)] shadow-inner">
              <div className="bg-[var(--color-accent-blue)] transition-all duration-700" style={{ width: `${match.ratio.win1}%` }} />
              {match.ratio.draw ? <div className="bg-gray-400 transition-all duration-700" style={{ width: `${match.ratio.draw}%` }} /> : null}
              <div className="bg-red-500 transition-all duration-700" style={{ width: `${match.ratio.win2}%` }} />
            </div>
          </div>

          {/* Match meta */}
          <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-[var(--color-border)]">
            <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm">
              <Calendar size={14} />
              <span>{date}</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm">
              <Clock size={14} />
              <span>{time}</span>
            </div>
            <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-sm">
              <MapPin size={14} />
              <span>{venue}</span>
            </div>
          </div>
          
          <div className="flex justify-center mt-8">
            <button
              onClick={() => setShowBetModal(true)}
              className="bg-white hover:bg-gray-200 text-[var(--color-primary-bg)] font-bold px-5 py-2.5 rounded-lg transition-colors text-sm shadow"
            >
              BET NOW
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Left col — team cards + stats */}
        <div className="col-span-2 space-y-5">
          {/* Team cards */}
          <div className="grid grid-cols-2 gap-4">
            {[{ team: team1, match_score: match.score1 }, { team: team2, match_score: match.score2 }].map(({ team }) => (
              <div
                key={team.shortName}
                className="bg-[var(--color-sidebar-bg)] border border-[var(--color-border)] rounded-xl p-5"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-white font-bold text-lg" style={{ color: team.color }}>{team.name}</h3>
                  <div className="flex gap-1">
                    {team.form.map((r, i) => <FormBadge key={i} result={r as FormResult} />)}
                  </div>
                </div>
                <p className="text-[var(--color-text-muted)] text-xs mb-4">Manager: <span className="text-white font-medium">{team.manager}</span></p>

                {/* Key Player */}
                <div className="bg-[var(--color-primary-bg)] rounded-xl p-4 flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black flex-shrink-0"
                    style={{ background: `linear-gradient(135deg, ${team.color}55, ${team.color}22)`, border: `1px solid ${team.color}44` }}
                  >
                    {team.keyPlayer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-bold text-sm truncate">{team.keyPlayer.name}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          team.keyPlayer.role === 'CAPTAIN'
                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                        }`}
                      >
                        {team.keyPlayer.role}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-center mt-2">
                      {[
                        { label: 'GOALS', val: team.keyPlayer.goals },
                        { label: 'ASSISTS', val: team.keyPlayer.assists },
                        { label: 'XP', val: team.keyPlayer.xp },
                      ].map(s => (
                        <div key={s.label}>
                          <div className="text-white font-bold text-base">{s.val}</div>
                          <div className="text-[var(--color-text-muted)] text-[10px] uppercase tracking-wider">{s.label}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Match Statistics */}
          <div className="bg-[var(--color-sidebar-bg)] border border-[var(--color-border)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-white font-bold text-base">Match Statistics</h3>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[var(--color-accent-blue)]" />
                  <span className="text-[var(--color-text-muted)]">{team1.shortName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-[var(--color-text-muted)]">{team2.shortName}</span>
                </div>
              </div>
            </div>

            {/* Wins summary */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: `${team1.shortName} WINS`, val: stats.wins[0] },
                { label: 'DRAWS', val: stats.wins[1] },
                { label: `${team2.shortName} WINS`, val: stats.wins[2] },
              ].map(s => (
                <div key={s.label} className="bg-[var(--color-primary-bg)] rounded-lg p-3 text-center">
                  <div className="text-white font-black text-2xl">{s.val}</div>
                  <div className="text-[var(--color-text-muted)] text-[10px] uppercase tracking-wider mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            <StatBar label="Possession" val1={`${stats.possession[0]}%`} val2={`${stats.possession[1]}%`} />
            <StatBar label="Shots (On Target)" val1={stats.shotsOnTarget[0]} val2={stats.shotsOnTarget[1]} />
            {stats.corners[0] + stats.corners[1] > 0 && (
              <StatBar label="Corners" val1={stats.corners[0]} val2={stats.corners[1]} />
            )}
          </div>
        </div>

        {/* Right col — Markets */}
        <div id="markets-section" className="space-y-4">
          {/* Betting Markets */}
          {markets.map(market => (
            <div key={market.title} className="bg-[var(--color-sidebar-bg)] border border-[var(--color-border)] rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedMarket(expandedMarket === market.title ? null : market.title)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--color-card-hover)] transition-colors"
              >
                <span className="text-white font-semibold text-sm">{market.title}</span>
                <span className={`text-[var(--color-text-muted)] transition-transform ${expandedMarket === market.title ? 'rotate-180' : ''}`}>
                  ▾
                </span>
              </button>
              <div 
                className={`grid transition-all duration-300 ease-in-out ${expandedMarket === market.title ? 'opacity-100' : 'opacity-0'}`}
                style={{ gridTemplateRows: expandedMarket === market.title ? '1fr' : '0fr' }}
              >
                <div className="overflow-hidden">
                  <div className="px-4 pb-4">
                    <div className={`grid gap-2 ${market.options.length === 2 ? 'grid-cols-2' : market.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
                      {market.options.map(opt => {
                        const betId = `match-${detail.id}-${opt.label.replace(/\s+/g, '-')}`;
                        const isSelected = hasBet(betId);
                        return (
                          <button
                            key={opt.label}
                            onClick={() => addBet({
                              id: betId,
                              matchId: detail.id,
                              matchLabel: `${team1.name} vs ${team2.name}`,
                              sport: 'FOOTBALL', // Could dynamically check league later
                              market: market.title,
                              selection: opt.label,
                              odds: opt.odds
                            })}
                            className={`flex flex-col items-center py-3 px-2 rounded-lg border transition-all duration-200 ${
                              isSelected
                                ? 'bg-[var(--color-accent-blue)] border-[var(--color-accent-blue)] text-white shadow-lg shadow-blue-500/20'
                                : 'bg-[var(--color-primary-bg)] border-[var(--color-border)] hover:border-gray-500 text-[var(--color-text-muted)] hover:text-white'
                            }`}
                          >
                            <span className="text-xs font-bold uppercase tracking-wider mb-1">{opt.label}</span>
                            <span className="text-[10px] text-[var(--color-text-muted)] font-bold opacity-70 group-hover:text-white transition-colors">{opt.odds.toFixed(2)}x</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bet Modal */}
      {showBetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeBetModal} />
          <div className="relative bg-[var(--color-sidebar-bg)] border border-[var(--color-border)] rounded-2xl p-6 w-full max-w-md shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button 
              onClick={closeBetModal}
              className="absolute top-4 right-4 text-[var(--color-text-muted)] hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-white mb-2">Quick Bet</h3>
            <p className="text-[var(--color-text-muted)] text-sm mb-6">Select your prediction for Match Winner.</p>
            
            <div className={`grid gap-3 ${match.ratio.draw !== null ? 'grid-cols-3' : 'grid-cols-2'} ${selectedPrediction ? 'mb-6' : ''}`}>
              {[
                { label: team1.shortName + ' Win', optLabel: match.team1, idSuffix: 'win1' },
                match.ratio.draw !== null ? { label: 'Draw', optLabel: 'Draw', idSuffix: 'draw' } : null,
                { label: team2.shortName + ' Win', optLabel: match.team2, idSuffix: 'win2' },
              ].map(opt => {
                if (!opt) return null;
                const isSelected = selectedPrediction?.idSuffix === opt.idSuffix;
                return (
                  <button
                    key={opt.label}
                    onClick={() => setSelectedPrediction(opt)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 ${
                      isSelected
                        ? 'bg-[var(--color-accent-blue)] border-[var(--color-accent-blue)] text-white shadow-lg shadow-blue-500/20'
                        : 'bg-[var(--color-primary-bg)] border-[var(--color-border)] hover:border-gray-500 text-[var(--color-text-muted)] hover:text-white'
                    }`}
                  >
                    <span className="text-xs uppercase tracking-wider font-bold">{opt.label}</span>
                  </button>
                );
              })}
            </div>

            {selectedPrediction && (
              <div className="border-t border-[var(--color-border)] pt-6 animate-in fade-in slide-in-from-top-4 duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[var(--color-text-muted)] text-sm">Stake Amount</span>
                  <span className="text-[var(--color-accent-green)] font-bold">
                    To Win: {(
                      modalStake *
                      (100 / match.ratio[selectedPrediction.idSuffix as 'win1'|'draw'|'win2'])
                    ).toFixed(2)} ETH
                  </span>
                </div>
                
                <div className="flex items-center bg-[var(--color-primary-bg)] border border-[var(--color-border)] rounded-xl overflow-hidden mb-4">
                  <span className="text-[var(--color-text-muted)] px-4 font-bold text-sm">ETH</span>
                  <input
                    type="number"
                    min={1}
                    value={modalStake}
                    onChange={e => setModalStake(Math.max(1, Number(e.target.value)))}
                    className="flex-1 bg-transparent text-white font-black text-lg py-3 pr-4 outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-4 gap-2 mb-6">
                  {[0.1, 0.5, 1, 5].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setModalStake(amt)}
                      className={`py-2 rounded-lg text-sm font-bold transition-colors ${
                        modalStake === amt
                          ? 'bg-white text-black'
                          : 'bg-[var(--color-primary-bg)] text-[var(--color-text-muted)] hover:text-white hover:bg-[var(--color-card-hover)]'
                      }`}
                    >
                      {amt} ETH
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => {
                    const betId = `match-${detail.id}-${selectedPrediction.idSuffix}`;
                    const customOdds = match.ratio[selectedPrediction.idSuffix as 'win1'|'draw'|'win2'] > 0
                      ? parseFloat((100 / match.ratio[selectedPrediction.idSuffix as 'win1'|'draw'|'win2']).toFixed(2))
                      : 0;

                    addBet({
                      id: betId,
                      matchId: detail.id,
                      matchLabel: `${team1.name} vs ${team2.name}`,
                      sport: match.sport ? match.sport.toUpperCase() : 'FOOTBALL',
                      market: 'Match Winner',
                      selection: selectedPrediction.optLabel,
                      odds: customOdds
                    });
                    updateStake(betId, modalStake);
                    closeBetModal();
                  }}
                  className="w-full bg-[var(--color-accent-green)] hover:bg-[var(--color-accent-green-hover)] text-[var(--color-sidebar-bg)] font-black py-4 rounded-xl transition-all duration-200 text-sm tracking-wide shadow-lg shadow-green-500/20 active:scale-95"
                >
                  CONFIRM BET
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
