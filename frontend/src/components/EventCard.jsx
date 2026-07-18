import { Link } from 'react-router-dom';
import { Trophy, Clock } from 'lucide-react';
import { ethers } from 'ethers';

export default function EventCard({ event }) {
  const totalPool = parseFloat(ethers.formatEther(event.totalYes || "0")) + parseFloat(ethers.formatEther(event.totalNo || "0"));
  
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 hover:bg-slate-800 transition-colors cursor-pointer group">
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${event.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-300'}`}>
          {event.status.toUpperCase()}
        </span>
        <span className="flex items-center gap-1 text-xs text-slate-400"><Clock size={14} /> {new Date(event.deadline).toLocaleDateString()}</span>
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{event.title}</h3>
      <p className="text-slate-400 text-sm mb-6 line-clamp-2">{event.description}</p>
      
      <div className="flex items-center justify-between mt-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold bg-gradient-to-br from-indigo-500 to-purple-500 shadow-inner">
            {event.team_a.substring(0,1)}
          </div>
          <span className="text-slate-500 font-bold mx-1">VS</span>
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold bg-gradient-to-br from-cyan-500 to-blue-500 shadow-inner">
            {event.team_b.substring(0,1)}
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Total Pool</p>
          <p className="text-lg font-bold text-slate-200 flex items-center gap-1 justify-end">
            {totalPool.toFixed(2)} ETH
          </p>
        </div>
      </div>
    </div>
  );
}
