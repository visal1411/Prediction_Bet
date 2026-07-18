import { NavLink } from 'react-router';
import { Settings, HelpCircle } from 'lucide-react';

const sports = [
  { id: 'football', name: 'Football', icon: '⚽', path: '/football' },
  { id: 'basketball', name: 'Basketball', icon: '🏀', path: '/basketball' },
  { id: 'tennis', name: 'Tennis', icon: '🎾', path: '/tennis' },
  { id: 'cricket', name: 'Cricket', icon: '🏏', path: '/cricket' },
  { id: 'ice_hockey', name: 'Ice Hockey', icon: '🏒', path: '/ice-hockey' },
  { id: 'volleyball', name: 'Volleyball', icon: '🏐', path: '/volleyball' },
];

export default function SportsLobby() {
  return (
    <aside className="w-64 bg-[var(--color-sidebar-bg)] border-r border-[var(--color-border)] h-full flex flex-col">
      <div className="p-6 border-b border-[var(--color-border)] mb-4">
        <NavLink to="/" className="flex items-center space-x-3">
          <div className="bg-[var(--color-accent-blue)] w-10 h-10 rounded-md flex items-center justify-center">
            <span className="text-2xl leading-none">🏆</span>
          </div>
          <div>
            <h2 className="text-white font-semibold">Sports Lobby</h2>
            <p className="text-xs text-[var(--color-text-muted)]">Select Category</p>
          </div>
        </NavLink>
      </div>

      <div className="flex-1 overflow-y-auto px-4">
        <ul className="space-y-2">
          {sports.map(sport => (
            <li key={sport.id}>
              <NavLink
                to={sport.path}
                className={({ isActive }) =>
                  `w-full flex items-center space-x-4 px-4 py-3 rounded-lg transition-colors ${isActive
                    ? 'bg-[var(--color-accent-blue)] text-white'
                    : 'text-[var(--color-text-muted)] hover:bg-[var(--color-card-hover)] hover:text-white'
                  }`
                }
              >
                <span className="text-xl">{sport.icon}</span>
                <span className="font-medium">{sport.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 border-t border-[var(--color-border)] space-y-2">
        <button className="w-full flex items-center space-x-4 px-4 py-3 text-[var(--color-text-muted)] hover:bg-[var(--color-card-hover)] hover:text-white rounded-lg transition-colors">
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </button>
        <button className="w-full flex items-center space-x-4 px-4 py-3 text-[var(--color-text-muted)] hover:bg-[var(--color-card-hover)] hover:text-white rounded-lg transition-colors">
          <HelpCircle size={20} />
          <span className="font-medium">Support</span>
        </button>
      </div>
    </aside>
  );
}
