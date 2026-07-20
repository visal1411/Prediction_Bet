import type { Match } from '../../data/mockData';
import MatchCard from './MatchCard';
import { useNavigate } from 'react-router';
import { useBetSlip } from '../../context/BetSlipContext';

interface SportPageProps {
  sport: string;
  icon: React.ReactNode;
  accentColor: string;
  heroTitle: string;
  heroSubtitle: string;
  featuredMatch?: Match;
  matches: Match[];
  league: string;
  backgroundImage?: string;
}

export default function SportPage({ sport, icon, accentColor, heroTitle, heroSubtitle, featuredMatch, matches, league, backgroundImage }: SportPageProps) {
  const navigate = useNavigate();
  const { addBet, isOpen, toggleOpen } = useBetSlip();

  const liveMatches = matches.filter(m => m.isLive);
  const upcomingMatchesList = matches.filter(m => !m.isLive);
  const hasMatches = matches.length > 0;

  const handlePlaceBet = () => {
    if (featuredMatch) {
      addBet({
        id: `match-${featuredMatch.id}-win1`,
        matchId: featuredMatch.id,
        matchLabel: `${featuredMatch.team1} vs ${featuredMatch.team2}`,
        sport: sport.toUpperCase(),
        market: 'Match Winner',
        selection: featuredMatch.team1,
        odds: featuredMatch.odds.win1,
      });
      if (!isOpen) toggleOpen();
    }
  };

  const handleViewEvent = () => {
    if (featuredMatch) {
      navigate(`/match/${featuredMatch.id}`);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      {/* Hero Section */}
      <div
        className="relative w-full rounded-2xl overflow-hidden mb-8 shadow-2xl"
        style={{ minHeight: '220px' }}
      >
        {backgroundImage && (
          <div
            className="absolute inset-0 bg-cover bg-center z-0 opacity-40"
            style={{ backgroundImage: `url(${backgroundImage})` }}
          />
        )}
        <div
          className="absolute inset-0 z-0 opacity-30"
          style={{
            background: `radial-gradient(ellipse at 60% 50%, ${accentColor} 0%, transparent 70%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-sidebar-bg)] via-[rgba(22,26,35,0.9)] to-[rgba(22,26,35,0.6)] z-10" />

        <div className="relative z-20 p-8 flex flex-col justify-center h-full">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-5xl">{icon}</span>
            <div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">{heroTitle}</h1>
              <p className="text-[var(--color-text-muted)] text-sm mt-1">{heroSubtitle}</p>
            </div>
          </div>

          {hasMatches && featuredMatch && (
            <div className="flex items-center gap-6 mt-4">
              <div className="bg-[var(--color-card-bg)] border border-[var(--color-border)] rounded-xl p-4 flex items-center gap-4">
                <div className="text-center">
                  <div className="text-white font-bold text-lg">{featuredMatch.team1}</div>
                  {featuredMatch.isLive && <div className="text-2xl font-extrabold text-white mt-1">{featuredMatch.score1}</div>}
                </div>
                <div className="text-[var(--color-text-muted)] font-bold px-2">
                  {featuredMatch.isLive ? <span className="text-[var(--color-accent-green)] text-sm font-bold animate-pulse">LIVE</span> : 'VS'}
                </div>
                <div className="text-center">
                  <div className="text-white font-bold text-lg">{featuredMatch.team2}</div>
                  {featuredMatch.isLive && <div className="text-2xl font-extrabold text-white mt-1">{featuredMatch.score2}</div>}
                </div>
                <div className="ml-4 pl-4 border-l border-[var(--color-border)]">
                  <div className="text-xs text-[var(--color-text-muted)] mb-1">{featuredMatch.league}</div>
                  <div className="text-xs text-[var(--color-text-muted)]">{featuredMatch.time}</div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handlePlaceBet}
                  className="bg-white hover:bg-gray-200 text-[var(--color-primary-bg)] font-bold px-5 py-2.5 rounded-lg transition-colors text-sm shadow"
                >
                  PLACE BET
                </button>
                <button
                  onClick={handleViewEvent}
                  className="border border-gray-500 hover:border-white text-white font-medium px-5 py-2.5 rounded-lg transition-colors text-sm"
                >
                  VIEW EVENT
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 mb-8">
        <div className="bg-[var(--color-sidebar-bg)] border border-[var(--color-border)] rounded-lg px-5 py-3 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${liveMatches.length > 0 ? 'bg-[var(--color-accent-green)] animate-pulse' : 'bg-yellow-500'}`} />
          <span className="text-white font-semibold text-sm">
            {liveMatches.length} Live
          </span>
        </div>
        <div className="bg-[var(--color-sidebar-bg)] border border-[var(--color-border)] rounded-lg px-5 py-3 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${upcomingMatchesList.length > 0 ? 'bg-[var(--color-accent-blue)]' : 'bg-[var(--color-accent-blue)] opacity-40'}`} />
          <span className="text-white font-semibold text-sm">
            {upcomingMatchesList.length} Upcoming
          </span>
        </div>
        <div className="bg-[var(--color-sidebar-bg)] border border-[var(--color-border)] rounded-lg px-5 py-3 flex items-center gap-2">
          <span className="text-[var(--color-text-muted)] text-sm">{league}</span>
        </div>
      </div>

      {/* Empty state */}
      {!hasMatches ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-sidebar-bg)]/40">
          <span className="text-6xl mb-5 opacity-40">{icon}</span>
          <h2 className="text-xl font-bold text-white mb-2">No Matches Available</h2>
          <p className="text-[var(--color-text-muted)] text-sm text-center max-w-sm">
            There are currently no {sport} matches scheduled. Check back later or explore another sport.
          </p>
          <div className="flex gap-2 mt-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)] animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)] animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      ) : (
        <>
          {/* Live matches */}
          {liveMatches.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent-green)] animate-pulse" />
                <h2 className="text-xl font-bold text-white">Live Now</h2>
                <span className="bg-[var(--color-accent-green)]/20 text-[var(--color-accent-green)] text-xs font-bold px-2 py-0.5 rounded">
                  {liveMatches.length} EVENTS
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {liveMatches.map(m => <MatchCard key={m.id} match={m} />)}
              </div>
            </div>
          )}

          {/* Upcoming matches */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white">Upcoming Matches</h2>
                <span className="bg-[var(--color-border)] text-[var(--color-text-muted)] text-xs font-bold px-2 py-0.5 rounded">
                  {upcomingMatchesList.length} EVENTS
                </span>
              </div>
              {upcomingMatchesList.length > 0 && (
                <button className="text-[var(--color-text-muted)] hover:text-white text-sm font-bold transition-colors">
                  View All
                </button>
              )}
            </div>

            {upcomingMatchesList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-sidebar-bg)]/40">
                <span className="text-5xl mb-4 opacity-40">🕒</span>
                <h2 className="text-lg font-bold text-white mb-2">No Upcoming Matches</h2>
                <p className="text-[var(--color-text-muted)] text-sm text-center max-w-sm">
                  There are currently no upcoming {sport} matches scheduled.
                </p>
                <div className="flex gap-2 mt-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingMatchesList.map(m => <MatchCard key={m.id} match={m} />)}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
