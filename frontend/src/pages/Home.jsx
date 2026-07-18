import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EventCard from '../components/EventCard';
import { API_URL } from '../config';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      // Mock data for display while backend is not running or empty
      const mockEvents = [
        {
          id: 1,
          title: "Manchester United vs Liverpool",
          description: "Premier League Derby Match. Will Manchester United win?",
          team_a: "Manchester United",
          team_b: "Liverpool",
          deadline: new Date(Date.now() + 86400000).toISOString(),
          status: "active",
          totalYes: "1000000000000000000", // 1 ETH
          totalNo: "500000000000000000" // 0.5 ETH
        },
        {
          id: 2,
          title: "Real Madrid vs Barcelona",
          description: "El Clasico. Will Real Madrid win the match?",
          team_a: "Real Madrid",
          team_b: "Barcelona",
          deadline: new Date(Date.now() + 172800000).toISOString(),
          status: "active",
          totalYes: "2500000000000000000",
          totalNo: "1200000000000000000" 
        }
      ];

      // Try fetching from real API
      try {
        const response = await fetch(`${API_URL}/events`);
        if(response.ok) {
          const data = await response.json();
          if(data.length > 0) {
            setEvents(data);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Backend not reachable, using mock data for demonstration.");
      }
      
      setEvents(mockEvents);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  return (
    <div className="py-8">
      <div className="mb-12 text-center max-w-2xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Predict the Future. <br/><span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">Win Crypto.</span></h1>
        <p className="text-slate-400 text-lg">A decentralized prediction market governed by smart contracts. Transparent, fair, and automated.</p>
      </div>

      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-100 items-center flex gap-2">Live Markets <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></span></h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-sm font-medium transition">All</button>
          <button className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-sm font-medium transition">Sports</button>
          <button className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-sm font-medium transition">Crypto</button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-indigo-500" size={48} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {events.map((event) => (
            <Link key={event.id} to={`/event/${event.id}`}>
              <EventCard event={event} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
