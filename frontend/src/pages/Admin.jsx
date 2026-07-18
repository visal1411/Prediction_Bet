import { useState } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { API_URL } from '../config';
import toast from 'react-hot-toast';
import { ShieldCheck, Plus, CheckCircle } from 'lucide-react';

export default function Admin() {
  const { account, isConnected } = useWeb3();
  const [loading, setLoading] = useState(false);
  
  // Event form
  const [title, setTitle] = useState('');
  const [teamA, setTeamA] = useState('');
  const [teamB, setTeamB] = useState('');
  const [description, setDescription] = useState('');
  
  // Result form
  const [eventId, setEventId] = useState('');
  const [result, setResult] = useState('yes');

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    if (!isConnected) return toast.error("Connect wallet");
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-wallet-address": account
        },
        body: JSON.stringify({
          title, team_a: teamA, team_b: teamB, description,
          deadline: new Date(Date.now() + 86400000).toISOString(), // 1 day
          contract_event_id: 1 // hardcoded for demo frontend to avoid missing backend contract logic
        })
      });

      if (res.ok) {
        toast.success("Event created successfully");
        setTitle(''); setTeamA(''); setTeamB(''); setDescription('');
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to create event");
      }
    } catch(err) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResult = async (e) => {
    e.preventDefault();
    if (!isConnected) return toast.error("Connect wallet");
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/events/result`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-wallet-address": account
        },
        body: JSON.stringify({
          event_id: eventId,
          result: result === 'yes'
        })
      });

      if (res.ok) {
        toast.success("Result published to blockchain successfully");
        setEventId('');
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to submit result");
      }
    } catch(err) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8">
      <div className="flex items-center gap-3 mb-8 text-white">
        <ShieldCheck size={32} className="text-indigo-400" />
        <h2 className="text-3xl font-bold">Admin Console</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Create Event */}
        <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700/50 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Plus size={20} className="text-emerald-400"/> Create Market Event</h3>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-1">Match Title</label>
              <input type="text" required value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" placeholder="e.g. Lakers vs Warriors" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-1">Team A (YES)</label>
                <input type="text" required value={teamA} onChange={(e)=>setTeamA(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" placeholder="Lakers" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-400 mb-1">Team B (NO)</label>
                <input type="text" required value={teamB} onChange={(e)=>setTeamB(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" placeholder="Warriors" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-1">Description</label>
              <textarea required value={description} onChange={(e)=>setDescription(e.target.value)} rows="3" className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 resize-none" placeholder="Provide context..."></textarea>
            </div>
            <button type="submit" disabled={loading} className="w-full mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg transition">
              Launch Event
            </button>
          </form>
        </div>

        {/* Submit Result */}
        <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700/50 shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><CheckCircle size={20} className="text-cyan-400"/> Resolve Oracle Result</h3>
          <p className="text-sm text-slate-400 mb-6">Triggers the Oracle service on the Express backend which bridges Web2 data to the Ethereum Smart Contract.</p>
          
          <form onSubmit={handleSubmitResult} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-1">Database Event ID</label>
              <input type="number" required value={eventId} onChange={(e)=>setEventId(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500" placeholder="ID from system" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-400 mb-3">Winning Outcome</label>
              <div className="flex gap-4">
                <label className="flex-1 cursor-pointer">
                  <input type="radio" name="result" value="yes" checked={result === 'yes'} onChange={(e)=>setResult(e.target.value)} className="sr-only peer" />
                  <div className="bg-slate-900 border border-slate-700 text-slate-300 py-3 rounded-xl text-center font-bold peer-checked:bg-emerald-500/20 peer-checked:text-emerald-400 peer-checked:border-emerald-500/50 transition">YES Won</div>
                </label>
                <label className="flex-1 cursor-pointer">
                  <input type="radio" name="result" value="no" checked={result === 'no'} onChange={(e)=>setResult(e.target.value)} className="sr-only peer" />
                  <div className="bg-slate-900 border border-slate-700 text-slate-300 py-3 rounded-xl text-center font-bold peer-checked:bg-rose-500/20 peer-checked:text-rose-400 peer-checked:border-rose-500/50 transition">NO Won</div>
                </label>
              </div>
            </div>
            <button type="submit" disabled={loading} className="w-full mt-8 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white font-bold py-4 rounded-xl shadow-lg transition">
              Broadcast Result via Oracle
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
