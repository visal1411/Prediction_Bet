import { Link } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { Wallet, Settings, Clock, BarChart } from 'lucide-react';

export default function Navbar() {
  const { account, isConnected, connectWallet } = useWeb3();

  return (
    <nav className="p-4 px-8 flex justify-between items-center bg-slate-800/80 backdrop-blur-md shadow-xl border-b border-slate-700/50 sticky top-0 z-50">
      <Link to="/" className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 flex items-center gap-2">
        <BarChart className="text-indigo-400" /> PredictX
      </Link>
      
      <div className="flex gap-6 items-center">
        <Link to="/" className="text-slate-300 hover:text-white transition font-medium">Markets</Link>
        <Link to="/wallet" className="text-slate-300 hover:text-white transition flex items-center gap-1 font-medium">
          <Clock size={16} /> My Bets
        </Link>
        <Link to="/admin" className="text-slate-300 hover:text-white transition flex items-center gap-1 font-medium">
          <Settings size={16} /> Admin
        </Link>
        
        <button 
          onClick={connectWallet}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 transition-all rounded-lg font-semibold shadow-lg shadow-indigo-500/30 transform hover:-translate-y-0.5 flex items-center gap-2"
        >
          <Wallet size={18} />
          {isConnected ? `${account.substring(0, 6)}...${account.substring(38)}` : "Connect Wallet"}
        </button>
      </div>
    </nav>
  );
}
