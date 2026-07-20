import { ChevronDown } from 'lucide-react';
import { leagueStandings } from '../../data/mockData';

export default function LeagueStandings() {
  return (
    <div className="bg-[var(--color-sidebar-bg)] border border-[var(--color-border)] rounded-xl overflow-hidden mb-10">
      <div className="flex justify-between items-center p-4 border-b border-[var(--color-border)]">
        <h3 className="text-white font-bold">League Standings - Premier League</h3>
        <button className="flex items-center space-x-1 text-[var(--color-text-muted)] hover:text-white text-sm font-medium transition-colors">
          <span>FILTER</span>
          <ChevronDown size={16} />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-[10px] text-[var(--color-text-muted)] uppercase bg-[var(--color-primary-bg)] border-b border-[var(--color-border)]">
            <tr>
              <th className="px-4 py-3 font-medium">POS</th>
              <th className="px-4 py-3 font-medium">TEAM</th>
              <th className="px-4 py-3 font-medium text-center">P</th>
              <th className="px-4 py-3 font-medium text-center">W</th>
              <th className="px-4 py-3 font-medium text-center">D</th>
              <th className="px-4 py-3 font-medium text-center">L</th>
              <th className="px-4 py-3 font-medium text-center">GF</th>
              <th className="px-4 py-3 font-medium text-center">GA</th>
              <th className="px-4 py-3 font-medium text-center">GD</th>
              <th className="px-4 py-3 font-medium text-center text-white">PTS</th>
              <th className="px-4 py-3 font-medium text-center">FORM</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--color-border)]">
            {leagueStandings.map((team) => (
              <tr key={team.team} className="hover:bg-[var(--color-card-hover)] transition-colors group">
                <td className="px-4 py-3 text-white font-bold">{team.pos}</td>
                <td className="px-4 py-3 text-white font-semibold whitespace-nowrap">{team.team}</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)] text-center">{team.played}</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)] text-center">{team.won}</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)] text-center">{team.drawn}</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)] text-center">{team.lost}</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)] text-center">{team.gf}</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)] text-center">{team.ga}</td>
                <td className="px-4 py-3 text-[var(--color-text-muted)] text-center">{team.gd}</td>
                <td className="px-4 py-3 text-white font-bold text-center bg-[rgba(255,255,255,0.02)] group-hover:bg-transparent">{team.pts}</td>
                <td className="px-4 py-3">
                  <div className="flex justify-center space-x-1">
                    {team.form.map((result, i) => (
                      <span 
                        key={i} 
                        className={`w-2 h-2 rounded-full ${
                          result === 'W' ? 'bg-[var(--color-accent-green)]' : 
                          result === 'D' ? 'bg-gray-400' : 'bg-red-500'
                        }`}
                        title={result}
                      />
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
