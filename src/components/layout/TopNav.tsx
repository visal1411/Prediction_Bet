import { NavLink } from 'react-router';
import { Search, Bell, User } from 'lucide-react';
import { useWallet } from '../../context/WalletContext';

export default function TopNav() {
  const { account, isConnecting, connectWallet, disconnectWallet } = useWallet();

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-[var(--color-sidebar-bg)] border-b border-[var(--color-border)]">
      <div className="flex items-center space-x-8">
        <NavLink to="/" className="text-2xl font-bold text-white tracking-wide">
          Sport<span className="text-gray-400">Bet</span>
        </NavLink>

        <nav className="hidden md:flex space-x-6">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive
                ? 'text-white border-b-2 border-white pb-1 font-medium'
                : 'text-[var(--color-text-muted)] hover:text-white transition-colors'
            }
          >
            Home
          </NavLink>
          <NavLink
            to="/live"
            className={({ isActive }) =>
              `flex items-center gap-1.5 transition-colors ${
                isActive
                  ? 'text-white border-b-2 border-white pb-1 font-medium'
                  : 'text-[var(--color-text-muted)] hover:text-white'
              }`
            }
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            Live
          </NavLink>
          <NavLink
            to="/my-bets"
            className={({ isActive }) =>
              `transition-colors ${
                isActive
                  ? 'text-white border-b-2 border-white pb-1 font-medium'
                  : 'text-[var(--color-text-muted)] hover:text-white'
              }`
            }
          >
            My Bets
          </NavLink>
          <NavLink
            to="/esports"
            className={({ isActive }) =>
              `transition-colors ${
                isActive
                  ? 'text-white border-b-2 border-white pb-1 font-medium'
                  : 'text-[var(--color-text-muted)] hover:text-white'
              }`
            }
          >
            Esports
          </NavLink>
        </nav>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search matches..."
            className="bg-[var(--color-primary-bg)] border border-[var(--color-border)] rounded-md py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[var(--color-text-muted)] w-64"
          />
        </div>

        <button className="text-[var(--color-text-muted)] hover:text-white transition-colors">
          <Bell size={20} />
        </button>

        <button className="text-[var(--color-text-muted)] hover:text-white transition-colors">
          <User size={20} />
        </button>

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
