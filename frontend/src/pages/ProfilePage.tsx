import { useState, useEffect } from 'react';
import { NavLink } from 'react-router';
import { useWallet } from '../context/Web3Context';
import { User, Wallet, Shield, Activity, Edit2, Check, X, Settings } from 'lucide-react';

export default function ProfilePage() {
  const { account, isConnecting, connectWallet } = useWallet();
  const [username, setUsername] = useState('Anon User');
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState('');

  // TODO: Replace this with a check against the contract owner address
  const isAdmin = true;


  // Load from local storage
  useEffect(() => {
    if (account) {
      const savedName = localStorage.getItem(`profile_name_${account}`);
      if (savedName) {
        setUsername(savedName);
      } else {
        setUsername(`User_${account.slice(2, 6)}`);
      }
    }
  }, [account]);

  const handleSave = () => {
    if (!tempName.trim()) return;
    setUsername(tempName);
    if (account) {
      localStorage.setItem(`profile_name_${account}`, tempName);
    }
    setIsEditing(false);
  };

  if (!account) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-8">
        <div className="w-24 h-24 bg-[var(--color-sidebar-bg)] border border-[var(--color-border)] rounded-full flex items-center justify-center mb-6 shadow-xl">
          <User size={40} className="text-[var(--color-text-muted)]" />
        </div>
        <h2 className="text-3xl font-black text-white mb-2">Connect to View Profile</h2>
        <p className="text-[var(--color-text-muted)] mb-8 max-w-md">
          Please connect your wallet to view and edit your decentralized profile.
        </p>
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="bg-[var(--color-accent-blue)] hover:bg-blue-600 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-lg transition-colors shadow-lg shadow-blue-500/20"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-6 h-full overflow-y-auto">
      {/* Header Banner */}
      <div className="relative w-full h-48 rounded-2xl bg-gradient-to-r from-[var(--color-primary-bg)] via-[var(--color-sidebar-bg)] to-[var(--color-primary-bg)] mb-8 shadow-2xl border border-[var(--color-border)]">

        {/* Box Pattern Overlay */}
        <div className="absolute inset-0 z-0 opacity-20 rounded-2xl overflow-hidden pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.2\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />

        {/* Avatar */}
        <div className="absolute bottom-8 left-8 flex items-end z-10">
          <div className="w-32 h-32 rounded-full border-4 border-[var(--color-primary-bg)] bg-[var(--color-sidebar-bg)] flex items-center justify-center shadow-2xl relative group overflow-hidden">
            {/* Generate pattern based on address */}
            <div className="absolute inset-0 opacity-80" style={{
              background: `linear-gradient(135deg, #${account.slice(2, 8)} 0%, #${account.slice(-6)} 100%)`
            }} />
            <User size={48} className="text-white relative z-10 drop-shadow-md" />

            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 cursor-pointer">
              <span className="text-white text-xs font-bold">CHANGE</span>
            </div>
          </div>

          <div className="ml-6 pb-2">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="bg-[var(--color-primary-bg)] border border-[var(--color-border)] text-white text-3xl font-black px-4 py-1 rounded-lg outline-none focus:border-[var(--color-accent-blue)]"
                  placeholder="Enter username"
                  autoFocus
                />
                <button onClick={handleSave} className="bg-[var(--color-accent-green)] text-[var(--color-sidebar-bg)] p-2 rounded-lg hover:scale-105 transition-transform"><Check size={20} strokeWidth={3} /></button>
                <button onClick={() => setIsEditing(false)} className="bg-red-500/20 text-red-500 p-2 rounded-lg hover:bg-red-500/30 transition-colors"><X size={20} strokeWidth={3} /></button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-black text-white tracking-tight">{username}</h1>
                <button onClick={() => { setTempName(username); setIsEditing(true); }} className="text-[var(--color-text-muted)] hover:text-white transition-colors bg-[var(--color-card-bg)] p-1.5 rounded-md">
                  <Edit2 size={16} />
                </button>
              </div>
            )}
            <div className="flex items-center gap-3 mt-2">
              <div className="flex items-center gap-2 text-[var(--color-text-muted)] bg-[var(--color-sidebar-bg)] border border-[var(--color-border)] px-3 py-1 rounded-md w-fit shadow-inner">
                <Wallet size={14} className="text-[var(--color-accent-blue)]" />
                <span className="text-sm font-medium font-mono">{account.slice(0, 6)}...{account.slice(-4)}</span>
              </div>

              {isAdmin && (
                <NavLink 
                  to="/admin" 
                  className="flex items-center gap-1.5 bg-amber-500 text-[var(--color-sidebar-bg)] px-3 py-1 rounded-md transition-colors text-sm font-bold shadow-sm"
                >
                  <Settings size={14} />
                  Admin Dashboard
                </NavLink>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">

        {/* Left Col: Stats */}
        <div className="space-y-6">
          <div className="bg-[var(--color-sidebar-bg)] border border-[var(--color-border)] rounded-2xl p-6 shadow-lg">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Activity size={18} className="text-[var(--color-accent-blue)]" /> Account Stats</h3>
            <div className="space-y-4">
              <div className="bg-[var(--color-primary-bg)] rounded-xl p-3">
                <div className="text-[var(--color-text-muted)] text-[10px] uppercase tracking-wider mb-1">Total Bets Placed</div>
                <div className="text-2xl font-black text-white">0</div>
              </div>
              <div className="bg-[var(--color-primary-bg)] rounded-xl p-3">
                <div className="text-[var(--color-text-muted)] text-[10px] uppercase tracking-wider mb-1">Win Rate</div>
                <div className="text-2xl font-black text-[var(--color-accent-green)]">0.0%</div>
              </div>
              <div className="bg-[var(--color-primary-bg)] rounded-xl p-3">
                <div className="text-[var(--color-text-muted)] text-[10px] uppercase tracking-wider mb-1">Total Winnings</div>
                <div className="text-2xl font-black text-white">0.00 ETH</div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--color-sidebar-bg)] border border-[var(--color-border)] rounded-2xl p-6 shadow-lg">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Shield size={18} className="text-[var(--color-accent-blue)]" /> Web3 Identity</h3>
            <p className="text-[var(--color-text-muted)] text-sm leading-relaxed">
              Your profile is secured by your wallet address. Your username and preferences are currently stored locally but can be migrated to ENS or a decentralized database in the future.
            </p>
          </div>
        </div>

        {/* Right Col: Recent Activity */}
        <div className="md:col-span-2 flex flex-col">
          <div className="bg-[var(--color-sidebar-bg)] border border-[var(--color-border)] rounded-2xl p-6 shadow-lg h-full min-h-[300px] flex flex-col">
            <h3 className="text-white font-bold mb-6">Recent Activity</h3>

            <div className="flex-1 m-2 p-8 flex flex-col items-center justify-center min-h-[240px] text-center bg-[var(--color-primary-bg)] rounded-xl border-2 border-dashed border-[var(--color-border)]">
              <div className="w-16 h-16 rounded-full bg-[var(--color-sidebar-bg)] flex items-center justify-center mb-5 border border-[var(--color-border)] shadow-sm">
                <Activity size={24} className="text-[var(--color-text-muted)]" />
              </div>
              <p className="text-white font-bold text-lg mb-2">No activity yet</p>
              <p className="text-[var(--color-text-muted)] text-sm max-w-xs mx-auto">Place some bets on your favorite sports to see your history appear here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
