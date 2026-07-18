import { BrowserRouter, Routes, Route } from 'react-router';
import { BetSlipProvider } from './context/BetSlipContext';
import { WalletProvider } from './context/WalletContext';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import FootballPage from './pages/FootballPage';
import BasketballPage from './pages/BasketballPage';
import TennisPage from './pages/TennisPage';
import CricketPage from './pages/CricketPage';
import IceHockeyPage from './pages/IceHockeyPage';
import VolleyballPage from './pages/VolleyballPage';
import RacingPage from './pages/RacingPage';
import EsportsPage from './pages/EsportsPage';
import MatchDetailPage from './pages/MatchDetailPage';
import LivePage from './pages/LivePage';
import MyBetsPage from './pages/MyBetsPage';

function App() {
  return (
    <WalletProvider>
      <BetSlipProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/live" element={<LivePage />} />
              <Route path="/my-bets" element={<MyBetsPage />} />
              <Route path="/football" element={<FootballPage />} />
              <Route path="/basketball" element={<BasketballPage />} />
              <Route path="/tennis" element={<TennisPage />} />
              <Route path="/cricket" element={<CricketPage />} />
              <Route path="/ice-hockey" element={<IceHockeyPage />} />
              <Route path="/volleyball" element={<VolleyballPage />} />
              <Route path="/racing" element={<RacingPage />} />
              <Route path="/esports" element={<EsportsPage />} />
              <Route path="/match/:id" element={<MatchDetailPage />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </BetSlipProvider>
    </WalletProvider>
  );
}

export default App;

