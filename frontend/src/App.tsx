import { BrowserRouter, Routes, Route } from 'react-router';
import { BetSlipProvider } from './context/BetSlipContext';
import { Web3Provider } from './context/Web3Context';
import AppLayout from './components/layout/AppLayout';
import HomePage from './pages/HomePage';
import SportsPage from './pages/SportsPage';
import MatchDetailPage from './pages/MatchDetailPage';
import LivePage from './pages/LivePage';
import MyBetsPage from './pages/MyBetsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Web3Provider>
      <BetSlipProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/live" element={<LivePage />} />
              <Route path="/my-bets" element={<MyBetsPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/match/:id" element={<MatchDetailPage />} />
              <Route path="/:sportId" element={<SportsPage />} />
            </Routes>

          </AppLayout>
        </BrowserRouter>
      </BetSlipProvider>
    </Web3Provider>
  );
}

export default App;

