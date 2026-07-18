import { allMatches, sportsCategories } from '../data/mockData';
import MatchCard from '../components/main/MatchCard';
import { Activity } from 'lucide-react';

export default function LivePage() {
  const liveMatches = allMatches.filter(m => m.isLive);

  const getSportEmoji = (sportName: string) => {
    const category = sportsCategories.find(c => c.name.toLowerCase() === sportName.toLowerCase());
    return category ? category.icon : '🏅';
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      {/* Hero Section */}
      <div
        className="relative w-full rounded-2xl overflow-hidden mb-8 shadow-2xl bg-[var(--color-sidebar-bg)] border border-[var(--color-border)]"
        style={{ minHeight: '220px' }}
      >
        <div
          className="absolute inset-0 z-0 opacity-20"
          style={{
            background: `radial-gradient(ellipse at 60% 50%, #ef4444 0%, transparent 70%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-sidebar-bg)] via-[rgba(22,26,35,0.9)] to-[rgba(22,26,35,0.6)] z-10" />

        <div className="relative z-20 p-8 flex flex-col justify-center h-full">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-[#ef4444]/20 p-3 rounded-xl border border-[#ef4444]/30">
              <Activity className="text-[#ef4444]" size={36} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-extrabold text-white tracking-tight">In-Play & Live</h1>
                <span className="bg-[#ef4444]/20 text-[#ef4444] px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 border border-[#ef4444]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse" />
                  Live Now
                </span>
              </div>
              <p className="text-[var(--color-text-muted)] text-sm mt-2">Place your bets as the action unfolds across all sports</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
        <div className="bg-[var(--color-sidebar-bg)] border border-[var(--color-border)] rounded-lg px-5 py-3 flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${liveMatches.length > 0 ? 'bg-[var(--color-accent-green)] animate-pulse' : 'bg-yellow-500'}`} />
          <span className="text-white font-semibold text-sm">
            {liveMatches.length} Matches In-Play
          </span>
        </div>
      </div>

      {liveMatches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-sidebar-bg)]/40">
          <span className="text-6xl mb-5 opacity-40">🔴</span>
          <h2 className="text-xl font-bold text-white mb-2">No Live Matches</h2>
          <p className="text-[var(--color-text-muted)] text-sm text-center max-w-sm">
            There are currently no live matches across any sports. Check back later!
          </p>
          <div className="flex gap-2 mt-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)] animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)] animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(
            liveMatches.reduce((acc, match) => {
              const sport = match.sport || 'Other';
              if (!acc[sport]) acc[sport] = [];
              acc[sport].push(match);
              return acc;
            }, {} as Record<string, typeof liveMatches>)
          ).map(([sport, matches]) => (
            <div key={sport}>
              <div className="flex items-center gap-3 mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="text-2xl">{getSportEmoji(sport)}</span>
                  {sport}
                </h2>
                <span className="bg-[var(--color-accent-green)]/20 text-[var(--color-accent-green)] text-xs font-bold px-2 py-0.5 rounded">
                  {matches.length} LIVE
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.map(m => <MatchCard key={m.id} match={m} />)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
