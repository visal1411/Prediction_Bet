import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { Search, Bell, User, Home, Receipt } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';
import { upcomingMatches } from '../../data/mockData';
import logoIcon from '../icons/logo.jpg';

export default function TopNav() {
  const { account, isConnecting, connectWallet, disconnectWallet } = useWallet();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = searchQuery
    ? upcomingMatches.filter(m =>
      m.team1.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.team2.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.league.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5)
    : [];

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };
  return (
    <header className="relative flex items-center justify-between px-6 py-4 bg-[var(--color-sidebar-bg)] border-b border-[var(--color-border)]">
      <div className="flex items-center flex-1">
        <NavLink to="/" className="flex items-center gap-4 text-2xl font-bold text-white tracking-wide z-10">
          <img src={logoIcon} alt="SportBet Logo" className="w-8 h-8 rounded-md object-cover" />
          <span>Sport<span className="text-gray-400">Bet</span></span>
        </NavLink>
      </div>

      <nav className="hidden md:flex items-center space-x-8 absolute left-64 pl-8 z-0">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${isActive
              ? 'text-white border-white font-medium'
              : 'text-[var(--color-text-muted)] border-transparent hover:text-white'
            }`
          }
        >
          <Home size={16} />
          Home
        </NavLink>
        <NavLink
          to="/live"
          className={({ isActive }) =>
            `flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${isActive
              ? 'text-white border-white font-medium'
              : 'text-[var(--color-text-muted)] border-transparent hover:text-white'
            }`
          }
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Live
        </NavLink>
        <NavLink
          to="/my-bets"
          className={({ isActive }) =>
            `flex items-center gap-1.5 pb-1 border-b-2 transition-colors ${isActive
              ? 'text-white border-white font-medium'
              : 'text-[var(--color-text-muted)] border-transparent hover:text-white'
            }`
          }
        >
          <Receipt size={16} />
          My Bets
        </NavLink>

      </nav>
      <div className="flex items-center space-x-6 flex-1 justify-end z-10">
        <div className="relative hidden lg:block" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-30" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Search matches..."
            className="bg-[var(--color-primary-bg)] border border-[var(--color-border)] rounded-md py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-accent-blue)] w-64 transition-colors relative z-20"
          />
          {isSearchFocused && searchQuery && (
            <div className="absolute top-full mt-2 w-full bg-[var(--color-sidebar-bg)] border border-[var(--color-border)] rounded-lg shadow-xl overflow-hidden z-50 flex flex-col">
              {searchResults.length > 0 ? (
                <ul className="py-2">
                  {searchResults.map(match => (
                    <li key={match.id}>
                      <button
                        onClick={() => {
                          navigate(`/match/${match.id}`);
                          setSearchQuery('');
                          setIsSearchFocused(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-[var(--color-card-hover)] transition-colors flex justify-between items-center"
                      >
                        <div>
                          <div className="text-white text-sm font-medium">{match.team1} vs {match.team2}</div>
                          <div className="text-[var(--color-text-muted)] text-xs">{match.league}</div>
                        </div>
                        {match.isLive && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-3 text-[var(--color-text-muted)] text-sm text-center">No matches found.</div>
              )}
            </div>
          )}
        </div>

        <button className="text-[var(--color-text-muted)] hover:text-white transition-colors">
          <Bell size={20} />
        </button>

        <NavLink to="/profile" className="text-[var(--color-text-muted)] hover:text-white transition-colors">
          <User size={20} />
        </NavLink>

        {account ? (
          <button
            onClick={disconnectWallet}
            className="bg-[var(--color-card-bg)] border border-[var(--color-border)] hover:border-[var(--color-text-muted)] text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow flex items-center space-x-2"
            title="Click to disconnect"
          >
            <span className="w-2 h-2 rounded-full bg-[var(--color-accent-green)] animate-pulse" />
            <span>{formatAddress(account)}</span>
          </button>
        ) : (
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="bg-[var(--color-accent-blue)] hover:bg-blue-600 disabled:bg-blue-800 disabled:cursor-not-allowed text-white px-4 py-2 rounded-md font-medium text-sm transition-colors shadow-lg flex items-center space-x-2"
          >
            {isConnecting && (
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
          </button>
        )}
      </div>
    </header>
  );
}
