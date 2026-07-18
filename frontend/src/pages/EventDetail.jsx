import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWeb3 } from '../context/Web3Context';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { Loader2, ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { API_URL } from '../config';

export default function EventDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { account, contract, isConnected } = useWeb3();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [betAmount, setBetAmount] = useState('0.1');
  const [betting, setBetting] = useState(false);

  useEffect(() => {
    fetchEvent();
    // eslint-disable-next-line
  }, [id, contract]);

  const fetchEvent = async () => {
    try {
      // Mock for display
      let eventData = {
        id: id,
        title: "Manchester United vs Liverpool",
        description: "Premier League Derby Match. Will Manchester United win?",
        team_a: "Manchester United",
        team_b: "Liverpool",
        deadline: new Date(Date.now() + 86400000).toISOString(),
        status: "active",
        totalYes: "1000000000000000000",
        totalNo: "500000000000000000"
      };

      try {
        const res = await fetch(`${API_URL}/events/${id}`);
        if(res.ok) eventData = await res.json();
      } catch(e) { }

      // If Web3 is connected, attempt to get real pool sizes
      if (contract) {
        try {
          const contractEvent = await contract.events(id);
          // contractEvent returns tuple: id, name, deadline, totalYes, totalNo, finished, result
          eventData.totalYes = contractEvent.totalYes.toString();
          eventData.totalNo = contractEvent.totalNo.toString();
          eventData.status = contractEvent.finished ? "completed" : "active";
          eventData.result = contractEvent.result;
        } catch (error) {
          console.warn("Could not fetch from contract, likely local node not running.");
        }
      }

      setEvent(eventData);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const handleBet = async (isYes) => {
    if (!isConnected) {
      return toast.error("Please connect your wallet first");
    }
    if (!betAmount || parseFloat(betAmount) <= 0) {
      return toast.error("Please enter a valid bet amount");
    }

    setBetting(true);
    try {
      const amountParsed = ethers.parseEther(betAmount);
      let tx;
      
      if (isYes) {
        tx = await contract.betYes(id, { value: amountParsed });
      } else {
        tx = await contract.betNo(id, { value: amountParsed });
      }

      toast.loading("Transaction pending...", { id: "bet-tx" });
      await tx.wait();
      toast.success("Prediction submitted successfully!", { id: "bet-tx" });
      
      // Refresh event to show new pools
      fetchEvent();
    } catch (error) {
      console.error(error);
      toast.error(error.reason || "Transaction failed", { id: "bet-tx" });
    } finally {
      setBetting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" size={48} /></div>;
  if (!event) return <div className="text-center py-20 text-slate-400">Event not found</div>;

  const totalYesEth = parseFloat(ethers.formatEther(event.totalYes || "0"));
  const totalNoEth = parseFloat(ethers.formatEther(event.totalNo || "0"));
  const totalPoolEth = totalYesEth + totalNoEth;
  
  const yesRatio = totalPoolEth === 0 ? 50 : Math.round((totalYesEth / totalPoolEth) * 100);
  const noRatio = totalPoolEth === 0 ? 50 : Math.round((totalNoEth / totalPoolEth) * 100);

  return (
    <div className="max-w-4xl mx-auto py-8 lg:py-12">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition">
        <ArrowLeft size={20} /> Back to Markets
      </button>

      <div className="bg-slate-800/80 border border-slate-700/50 rounded-3xl p-8 shadow-2xl relative overflow-hidden backdrop-blur-sm">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl -ml-20 -mb-20"></div>

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:justify-between items-start mb-6 gap-4">
            <div>
              <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full mb-4 ${event.status === 'active' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-700 text-slate-300'}`}>
                {event.status.toUpperCase()}
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{event.title}</h1>
              <p className="text-slate-400 max-w-2xl text-lg">{event.description}</p>
            </div>
            <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-center min-w-[150px]">
              <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mb-1">Total Pool</p>
              <p className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">{totalPoolEth.toFixed(2)} ETH</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-10 mb-12">
            <div className="flex justify-between text-sm font-bold mb-2">
              <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 size={16}/> YES ({yesRatio}%)</span>
              <span className="text-rose-400 flex items-center gap-1">NO ({noRatio}%) <XCircle size={16}/></span>
            </div>
            <div className="h-4 w-full bg-slate-700 rounded-full overflow-hidden flex shadow-inner">
              <div className="h-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-1000" style={{ width: `${yesRatio}%` }}></div>
              <div className="h-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)] transition-all duration-1000" style={{ width: `${noRatio}%` }}></div>
            </div>
          </div>

          {event.status === 'active' ? (
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-md">
              <h3 className="text-xl font-bold text-white mb-6">Place Your Prediction</h3>
              
              <div className="flex items-center gap-4 mb-6">
                <input 
                  type="number" 
                  step="0.01" 
                  min="0.01"
                  value={betAmount}
                  onChange={(e) => setBetAmount(e.target.value)}
                  className="bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white text-lg w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                  placeholder="Amount in ETH"
                />
                <span className="text-slate-400 font-medium">ETH</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button 
                  onClick={() => handleBet(true)}
                  disabled={betting || !isConnected}
                  className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/50 py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                >
                  Predict YES
                </button>
                <button 
                  onClick={() => handleBet(false)}
                  disabled={betting || !isConnected}
                  className="flex-1 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/50 py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(244,63,94,0.2)]"
                >
                  Predict NO
                </button>
              </div>
              {!isConnected && <p className="text-center text-sm text-rose-400 mt-4">Please connect wallet to place a bet.</p>}
            </div>
          ) : (
            <div className="text-center py-10 bg-slate-900/50 rounded-2xl border border-slate-700">
              <h3 className="text-2xl font-bold mb-2 text-white">Event Completed</h3>
              <p className="text-slate-400">Winning Outcome: <span className={event.result ? "text-emerald-400 font-bold" : "text-rose-400 font-bold"}>{event.result ? "YES" : "NO"}</span></p>
              <button 
                onClick={() => navigate('/wallet')}
                className="mt-6 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 transition rounded-lg font-semibold text-white"
              >
                Go to Wallet to Claim Rewards
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
