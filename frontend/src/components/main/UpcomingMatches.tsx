import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { fetchEvents } from '../../api/events';

interface UpcomingMatchesProps {
  sportFilter?: string;
}

export default function UpcomingMatches({ sportFilter = 'all' }: UpcomingMatchesProps) {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadMatches = async () => {
      setLoading(true);
      // Fetch upcoming matches
      const events = await fetchEvents('upcoming');
      let filtered = events;
      if (sportFilter !== 'all') {
        filtered = filtered.filter((m: any) => m.sport?.toLowerCase() === sportFilter.toLowerCase());
      }
      
      const mappedMatches = filtered.map((e: any) => {
        let win1 = 60, draw = 10, win2 = 30;
        try {
          const total = BigInt(e.totalPool || '0');
          if (total > 0n) {
             win1 = Number((BigInt(e.poolHome || '0') * 100n) / total);
             draw = Number((BigInt(e.poolDraw || '0') * 100n) / total);
             win2 = Number((BigInt(e.poolAway || '0') * 100n) / total);
          }
        } catch(err) {}
        
        return {
          id: e.id,
          sport: e.sport,
          league: e.league,
          time: new Date(e.eventDate).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
          team1: e.teamHome,
          team2: e.teamAway,
          score1: '-',
          score2: '-',
          ratio: { win1, draw: draw > 0 ? draw : null, win2 },
          isLive: e.status === 'open'
        };
      });
      setMatches(mappedMatches);
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

              <div className="mb-4 text-xs font-semibold text-[var(--color-text-muted)] flex justify-between">
                <span>Pool Prediction</span>
                <span className="text-white">{match.ratio.win1}% / {match.ratio.draw ? match.ratio.draw + '% / ' : ''}{match.ratio.win2}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[var(--color-border)] mb-5 overflow-hidden flex">
                <div className="h-full bg-[var(--color-accent-blue)]" style={{ width: `${match.ratio.win1}%` }} />
                {match.ratio.draw && <div className="h-full bg-gray-400" style={{ width: `${match.ratio.draw}%` }} />}
                <div className="h-full bg-red-500" style={{ width: `${match.ratio.win2}%` }} />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button className="bg-[var(--color-card-bg)] hover:bg-[#1d4ed830] border border-[var(--color-border)] group-hover:border-[var(--color-accent-blue)] rounded-md py-2 flex flex-col items-center justify-center transition-colors">
                  <span className="text-[10px] text-[var(--color-text-muted)] mb-0.5 group-hover:text-blue-200">Win 1</span>
                  <span className="text-white font-bold text-sm">{match.ratio.win1 > 0 ? (100 / match.ratio.win1).toFixed(2) : "0.00"}</span>
                </button>

                {match.ratio.draw !== null ? (
                  <button className="bg-[var(--color-card-bg)] hover:bg-[#9ca3af30] border border-[var(--color-border)] group-hover:border-gray-400 rounded-md py-2 flex flex-col items-center justify-center transition-colors">
                    <span className="text-[10px] text-[var(--color-text-muted)] mb-0.5 group-hover:text-gray-300">X</span>
                    <span className="text-white font-bold text-sm">{match.ratio.draw > 0 ? (100 / match.ratio.draw).toFixed(2) : "0.00"}</span>
                  </button>
                ) : (
                  <div /> // Placeholder if no draw odds (e.g. basketball/tennis)
                )}

                <button className="bg-[var(--color-card-bg)] hover:bg-[#ef444430] border border-[var(--color-border)] group-hover:border-red-500 rounded-md py-2 flex flex-col items-center justify-center transition-colors">
                  <span className="text-[10px] text-[var(--color-text-muted)] mb-0.5 group-hover:text-red-200">Win 2</span>
                  <span className="text-white font-bold text-sm">{match.ratio.win2 > 0 ? (100 / match.ratio.win2).toFixed(2) : "0.00"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
