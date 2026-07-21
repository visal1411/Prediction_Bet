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

  const calcOdds = (pct: number) => (pct > 0 ? (100 / pct).toFixed(2) : "0.00");

  const handleOdds = (e: React.MouseEvent, selection: string, market: string, betId: string, odds: string, outcomeIndex: number) => {
    e.stopPropagation();
    addBet({ id: betId, matchId: match.id, matchLabel, sport, market, selection, odds: parseFloat(odds), marketAddress: match.marketAddress, outcomeIndex });
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
          {match.isLive && !match.isClosed && (
            <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent-green)] animate-pulse inline-block" />
          )}
          {match.isClosed && (
            <span className="w-1.5 h-1.5 rounded-full bg-gray-500 inline-block" />
          )}
          {match.league}
        </span>
        <span className={match.isClosed ? 'text-gray-500 font-bold' : match.isLive ? 'text-[var(--color-accent-green)] font-bold' : 'text-[var(--color-text-muted)]'}>
          {match.isClosed ? 'CLOSED' : match.time}
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

      <div className="mb-4 text-xs font-semibold text-[var(--color-text-muted)] flex justify-between">
        <span>Pool Prediction</span>
        <span className="text-white">{match.ratio.win1}% / {match.ratio.draw ? match.ratio.draw + '% / ' : ''}{match.ratio.win2}%</span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-[var(--color-border)] mb-5 overflow-hidden flex">
        <div className="h-full bg-[var(--color-accent-blue)]" style={{ width: `${match.ratio.win1}%` }} />
        {match.ratio.draw && <div className="h-full bg-gray-400" style={{ width: `${match.ratio.draw}%` }} />}
        <div className="h-full bg-red-500" style={{ width: `${match.ratio.win2}%` }} />
      </div>

      <div className={`grid gap-2 ${match.ratio.draw !== null ? 'grid-cols-3' : 'grid-cols-2'}`}>
        {/* Win 1 */}
        <button
          disabled={match.isClosed}
          onClick={e => handleOdds(e, match.team1, 'Match Winner', win1Id, calcOdds(match.ratio.win1), 0)}
          className={`border rounded-md py-2.5 flex flex-col items-center justify-center transition-all duration-200 ${
            match.isClosed 
              ? 'bg-[var(--color-sidebar-bg)] border-[var(--color-border)] opacity-50 cursor-not-allowed'
              : hasBet(win1Id)
              ? 'bg-[var(--color-accent-blue)] border-[var(--color-accent-blue)] text-white shadow-md shadow-blue-500/30 cursor-pointer'
              : 'bg-[var(--color-card-bg)] hover:bg-[var(--color-accent-blue)] hover:border-[var(--color-accent-blue)] border-[var(--color-border)] hover:text-white cursor-pointer'
          }`}
        >
          <span className={`text-[10px] ${match.isClosed ? 'text-gray-600' : 'text-[var(--color-text-muted)] group-hover:text-blue-200'}`}>
            {match.ratio.draw !== null ? '1' : 'Win 1'}
          </span>
          <span className={`font-bold ${match.isClosed ? 'text-gray-500' : ''}`}>{calcOdds(match.ratio.win1)}</span>
        </button>

        {/* Draw */}
        {match.ratio.draw !== null && (
          <button
            disabled={match.isClosed}
            onClick={e => handleOdds(e, 'Draw', 'Match Winner', drawId, calcOdds(match.ratio.draw!), 2)}
            className={`border rounded-md py-2.5 flex flex-col items-center justify-center transition-all duration-200 ${
              match.isClosed 
                ? 'bg-[var(--color-sidebar-bg)] border-[var(--color-border)] opacity-50 cursor-not-allowed'
                : hasBet(drawId)
                ? 'bg-gray-500 border-gray-500 text-white shadow-md cursor-pointer'
                : 'bg-[var(--color-card-bg)] hover:bg-gray-500 hover:border-gray-500 border-[var(--color-border)] hover:text-white cursor-pointer'
            }`}
          >
            <span className={`text-[10px] ${match.isClosed ? 'text-gray-600' : 'text-[var(--color-text-muted)] group-hover:text-gray-300'}`}>X</span>
            <span className={`font-bold ${match.isClosed ? 'text-gray-500' : ''}`}>{calcOdds(match.ratio.draw)}</span>
          </button>
        )}

        {/* Win 2 */}
        <button
          disabled={match.isClosed}
          onClick={e => handleOdds(e, match.team2, 'Match Winner', win2Id, calcOdds(match.ratio.win2), 1)}
          className={`border rounded-md py-2.5 flex flex-col items-center justify-center transition-all duration-200 ${
            match.isClosed
              ? 'bg-[var(--color-sidebar-bg)] border-[var(--color-border)] opacity-50 cursor-not-allowed'
              : hasBet(win2Id)
              ? 'bg-red-500 border-red-500 text-white shadow-md shadow-red-500/30 cursor-pointer'
              : 'bg-[var(--color-card-bg)] hover:bg-red-500 hover:border-red-500 border-[var(--color-border)] hover:text-white cursor-pointer'
          }`}
        >
          <span className={`text-[10px] ${match.isClosed ? 'text-gray-600' : 'text-[var(--color-text-muted)] group-hover:text-red-200'}`}>
            {match.ratio.draw !== null ? '2' : 'Win 2'}
          </span>
          <span className={`font-bold ${match.isClosed ? 'text-gray-500' : ''}`}>{calcOdds(match.ratio.win2)}</span>
        </button>
      </div>
    </div>
  );
}
