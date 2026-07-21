import { useState, useEffect } from 'react';
import { fetchMappedMatches } from '../../api/events';
import MatchCard from './MatchCard';

interface UpcomingMatchesProps {
  sportFilter?: string;
}

export default function UpcomingMatches({ sportFilter = 'all' }: UpcomingMatchesProps) {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatches = async () => {
      setLoading(true);
      // Fetch upcoming matches using the unified mapping logic
      const events = await fetchMappedMatches('upcoming');
      
      let filtered = events;
      if (sportFilter !== 'all') {
        filtered = filtered.filter((m: any) => m.sport?.toLowerCase() === sportFilter.toLowerCase());
      }
      
      setMatches(filtered);
      setLoading(false);
    };
    loadMatches();
  }, [sportFilter]);

  if (loading) {
    return <div className="text-white mb-10 py-10 text-center animate-pulse">Loading matches...</div>;
  }

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-bold text-white tracking-wide">Upcoming Matches</h2>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-sm ${matches.length > 0 ? 'bg-[var(--color-border)] text-[var(--color-text-muted)]' : 'bg-[var(--color-accent-blue)]/20 text-[var(--color-accent-blue)]'}`}>
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
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      )}
    </div>
  );
}
