import { useNavigate } from 'react-router';
import { allMatches } from '../../data/mockData';

interface UpcomingMatchesProps {
  sportFilter?: string;
}

export default function UpcomingMatches({ sportFilter = 'all' }: UpcomingMatchesProps) {
  const navigate = useNavigate();
  
  let matches = allMatches.filter(m => !m.isLive);
  if (sportFilter !== 'all') {
    matches = matches.filter(m => m.sport?.toLowerCase() === sportFilter.toLowerCase());
  }

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-white tracking-wide">Upcoming Matches</h2>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-sm ${matches.length > 0 ? 'bg-[var(--color-border)] text-[var(--color-text-muted)]' : 'bg-yellow-500/20 text-yellow-500'}`}>
            {matches.length} EVENTS
          </span>
        </div>
        {matches.length > 0 && (
          <button className="text-[var(--color-text-main)] hover:text-white text-sm font-bold transition-colors">
            View All
          </button>
        )}
      </div>

      {matches.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-[var(--color-border)] bg-[var(--color-sidebar-bg)]/40">
          <span className="text-5xl mb-4 opacity-40">🕒</span>
          <h2 className="text-lg font-bold text-white mb-2">No Upcoming Matches</h2>
          <p className="text-[var(--color-text-muted)] text-sm text-center max-w-sm">
            There are no general upcoming matches scheduled right now.
          </p>
          <div className="flex gap-2 mt-6">
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)] animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)] animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-border)] animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((match) => (
            <div
              key={match.id}
              onClick={() => navigate(`/match/${match.id}`)}
              className="bg-[var(--color-sidebar-bg)] border border-[var(--color-border)] rounded-xl p-4 hover:border-gray-500 transition-colors group cursor-pointer hover:shadow-lg hover:shadow-black/30"
            >
              <div className="flex justify-between items-center mb-4 text-xs">
                <span className="text-[var(--color-text-muted)] font-medium flex items-center space-x-1.5">
                  {match.isLive && <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-green)] animate-pulse" />}
                  <span>{match.league}</span>
                </span>
                <span className={match.isLive ? 'text-[var(--color-accent-green)] font-bold' : 'text-[var(--color-text-muted)]'}>
                  {match.time}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">{match.team1}</span>
                  <span className="text-white font-bold">{match.score1}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white font-semibold">{match.team2}</span>
                  <span className="text-white font-bold">{match.score2}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button className="bg-[var(--color-card-bg)] hover:bg-[var(--color-card-hover)] border border-[var(--color-border)] group-hover:border-gray-600 rounded-md py-2 flex flex-col items-center justify-center transition-colors">
                  <span className="text-[10px] text-[var(--color-text-muted)] mb-0.5">{match.isLive ? 'Home (-2.5)' : '1'}</span>
                  <span className="text-white font-bold text-sm">{match.odds.win1.toFixed(2)}</span>
                </button>

                {match.odds.draw ? (
                  <button className="bg-[var(--color-card-bg)] hover:bg-[var(--color-card-hover)] border border-[var(--color-border)] group-hover:border-gray-600 rounded-md py-2 flex flex-col items-center justify-center transition-colors">
                    <span className="text-[10px] text-[var(--color-text-muted)] mb-0.5">X</span>
                    <span className="text-white font-bold text-sm">{match.odds.draw.toFixed(2)}</span>
                  </button>
                ) : (
                  <div /> // Placeholder if no draw odds (e.g. basketball/tennis)
                )}

                <button className="bg-[var(--color-card-bg)] hover:bg-[var(--color-card-hover)] border border-[var(--color-border)] group-hover:border-gray-600 rounded-md py-2 flex flex-col items-center justify-center transition-colors">
                  <span className="text-[10px] text-[var(--color-text-muted)] mb-0.5">{match.isLive ? 'Away (+2.5)' : '2'}</span>
                  <span className="text-white font-bold text-sm">{match.odds.win2.toFixed(2)}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
