import { NavLink } from 'react-router';
import { Settings, HelpCircle, User } from 'lucide-react';
import footballIcon from '../icons/football_icon.png';
import basketballIcon from '../icons/basketball_icon.png';
import tennisIcon from '../icons/tennis_icon.png';
import volleyballIcon from '../icons/volleyball_icon.png';
import racingIcon from '../icons/racing_icon.png';
import esportIcon from '../icons/e-sport_icon.png';
import sportLobbyIcon from '../icons/sportLobby_icon.png';

const sports = [
  { id: 'football', name: 'Football', icon: <img src={footballIcon} alt="Football" className="w-5 h-5 object-contain brightness-0 invert opacity-60 group-hover:opacity-100 group-[.active]:opacity-100 transition-opacity" />, path: '/football' },
  { id: 'basketball', name: 'Basketball', icon: <img src={basketballIcon} alt="Basketball" className="w-5 h-5 object-contain brightness-0 invert opacity-60 group-hover:opacity-100 group-[.active]:opacity-100 transition-opacity" />, path: '/basketball' },
  { id: 'tennis', name: 'Tennis', icon: <img src={tennisIcon} alt="Tennis" className="w-5 h-5 object-contain brightness-0 invert opacity-60 group-hover:opacity-100 group-[.active]:opacity-100 transition-opacity" />, path: '/tennis' },
  { id: 'volleyball', name: 'Volleyball', icon: <img src={volleyballIcon} alt="Volleyball" className="w-5 h-5 object-contain brightness-0 invert opacity-60 group-hover:opacity-100 group-[.active]:opacity-100 transition-opacity" />, path: '/volleyball' },
  { id: 'racing', name: 'Racing', icon: <img src={racingIcon} alt="Racing" className="w-5 h-5 object-contain brightness-0 invert opacity-60 group-hover:opacity-100 group-[.active]:opacity-100 transition-opacity" />, path: '/racing' },
  { id: 'esports', name: 'Esports', icon: <img src={esportIcon} alt="Esports" className="w-5 h-5 object-contain brightness-0 invert opacity-60 group-hover:opacity-100 group-[.active]:opacity-100 transition-opacity" />, path: '/esports' },
];

export default function SportsLobby() {
  return (
    <aside className="w-64 bg-[var(--color-sidebar-bg)] border-r border-[var(--color-border)] h-full flex flex-col">
      <div className="p-6 border-b border-[var(--color-border)] mb-4">
        <NavLink to="/" className="flex items-center space-x-3">
          <div className="bg-[var(--color-accent-blue)] w-10 h-10 rounded-md flex items-center justify-center">
            <img src={sportLobbyIcon} alt="Sports Lobby" className="w-6 h-6 object-contain brightness-0 invert" />
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
                  `group w-full flex items-center space-x-4 px-4 py-3 rounded-lg transition-colors ${isActive
                    ? 'active bg-[var(--color-accent-blue)] text-white'
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
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `w-full flex items-center space-x-4 px-4 py-3 rounded-lg transition-colors ${isActive
              ? 'bg-[var(--color-accent-blue)] text-white'
              : 'text-[var(--color-text-muted)] hover:bg-[var(--color-card-hover)] hover:text-white'
            }`
          }
        >
          <User size={20} />
          <span className="font-medium">Profile</span>
        </NavLink>
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
