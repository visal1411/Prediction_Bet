import { useNavigate } from 'react-router';
import type { Match } from '../../data/mockData';
import { useBetSlip } from '../../context/BetSlipContext';

interface MatchCardProps {
  match: Match;
}

export default function MatchCard({ match }: MatchCardProps) {
  const navigate = useNavigate();
  const { addBet, hasBet } = useBetSlip();

  const matchLabel = `${match.team1} vs ${match.team2}`;
  const sport = match.league.includes('NBA') || match.league.includes('EuroLeague') ? 'BASKETBALL'
    : match.league.includes('ATP') || match.league.includes('WTA') ? 'TENNIS'
    : 'FOOTBALL';

  const handleOdds = (e: React.MouseEvent, selection: string, market: string, odds: number, betId: string) => {
    e.stopPropagation();
    addBet({ id: betId, matchId: match.id, matchLabel, sport, market, selection, odds });
  };

  const win1Id = `match-${match.id}-win1`;
  const drawId = `match-${match.id}-draw`;
  const win2Id = `match-${match.id}-win2`;

  return (
    <div
      onClick={() => navigate(`/match/${match.id}`)}
      className="bg-[var(--color-sidebar-bg)] border border-[var(--color-border)] rounded-xl p-4 hover:border-gray-500 transition-all duration-200 group cursor-pointer hover:shadow-lg hover:shadow-black/30"
    >
      <div className="flex justify-between items-center mb-4 text-xs">
        <span className="text-[var(--color-text-muted)] font-medium flex items-center gap-1.5">
          {match.isLive && (
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-green)] animate-pulse inline-block" />
          )}
          {match.league}
        </span>
        <span className={match.isLive ? 'text-[var(--color-accent-green)] font-bold' : 'text-[var(--color-text-muted)]'}>
          {match.time}
        </span>
      </div>

      <div className="space-y-3 mb-5">
        <div className="flex justify-between items-center">
          <span className="text-white font-semibold">{match.team1}</span>
          <span className={`font-bold text-lg ${match.isLive ? 'text-white' : 'text-[var(--color-text-muted)]'}`}>{match.score1}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-white font-semibold">{match.team2}</span>
          <span className={`font-bold text-lg ${match.isLive ? 'text-white' : 'text-[var(--color-text-muted)]'}`}>{match.score2}</span>
        </div>
      </div>

      <div className={`grid gap-2 ${match.odds.draw !== null ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {/* Win 1 */}
        <button
          onClick={e => handleOdds(e, match.team1, 'Match Winner', match.odds.win1, win1Id)}
          className={`border rounded-md py-2.5 flex flex-col items-center justify-center transition-all duration-200 ${
            hasBet(win1Id)
              ? 'bg-[var(--color-accent-blue)] border-[var(--color-accent-blue)] text-white shadow-md shadow-blue-500/30'
              : 'bg-[var(--color-card-bg)] hover:bg-[var(--color-accent-blue)] hover:border-[var(--color-accent-blue)] border-[var(--color-border)] hover:text-white'
          }`}
        >
          <span className="text-[10px] text-[var(--color-text-muted)] mb-0.5">
            {match.odds.draw !== null ? '1' : 'Win 1'}
          </span>
          <span className="text-white font-bold text-sm">{match.odds.win1.toFixed(2)}</span>
        </button>

        {/* Draw */}
        {match.odds.draw !== null && (
          <button
            onClick={e => handleOdds(e, 'Draw', 'Match Winner', match.odds.draw!, drawId)}
            className={`border rounded-md py-2.5 flex flex-col items-center justify-center transition-all duration-200 ${
              hasBet(drawId)
                ? 'bg-[var(--color-accent-blue)] border-[var(--color-accent-blue)] text-white shadow-md shadow-blue-500/30'
                : 'bg-[var(--color-card-bg)] hover:bg-[var(--color-accent-blue)] hover:border-[var(--color-accent-blue)] border-[var(--color-border)] hover:text-white'
            }`}
          >
            <span className="text-[10px] text-[var(--color-text-muted)] mb-0.5">X</span>
            <span className="text-white font-bold text-sm">{match.odds.draw!.toFixed(2)}</span>
          </button>
        )}

        {/* Win 2 */}
        <button
          onClick={e => handleOdds(e, match.team2, 'Match Winner', match.odds.win2, win2Id)}
          className={`border rounded-md py-2.5 flex flex-col items-center justify-center transition-all duration-200 ${
            hasBet(win2Id)
              ? 'bg-[var(--color-accent-blue)] border-[var(--color-accent-blue)] text-white shadow-md shadow-blue-500/30'
              : 'bg-[var(--color-card-bg)] hover:bg-[var(--color-accent-blue)] hover:border-[var(--color-accent-blue)] border-[var(--color-border)] hover:text-white'
          }`}
        >
          <span className="text-[10px] text-[var(--color-text-muted)] mb-0.5">
            {match.odds.draw !== null ? '2' : 'Win 2'}
          </span>
          <span className="text-white font-bold text-sm">{match.odds.win2.toFixed(2)}</span>
        </button>
      </div>
    </div>
  );
}
