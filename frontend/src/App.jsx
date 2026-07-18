import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Web3Provider } from './context/Web3Context';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import EventDetail from './pages/EventDetail';
import Wallet from './pages/Wallet';
import Admin from './pages/Admin';

function App() {
  return (
    <Web3Provider>
      <Router>
        <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col selection:bg-indigo-500/30">
          <div className="h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 w-full" />
          <Navbar />
          <main className="container mx-auto p-4 md:p-8 flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/event/:id" element={<EventDetail />} />
              <Route path="/wallet" element={<Wallet />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </main>
          
          <footer className="py-8 text-center text-slate-500 text-sm border-t border-slate-800">
            &copy; 2026 PredictX. Decentralized Prediction Markets on Ethereum.
          </footer>
          <Toaster position="bottom-right" toastOptions={{ style: { background: '#1e293b', color: '#fff', border: '1px solid #334155' } }} />
        </div>
      </Router>
    </Web3Provider>
  )
}

export default App;
