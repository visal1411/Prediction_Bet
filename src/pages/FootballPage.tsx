import SportPage from '../components/main/SportPage';
import { footballMatches } from '../data/mockData';
import footballIcon from '../components/icons/football_icon.png';

export default function FootballPage() {
  return (
    <SportPage
      sport="Football"
      icon={<img src={footballIcon} alt="Football" className="w-12 h-12 object-contain brightness-0 invert" />}
      accentColor="#3b82f6"
      heroTitle="Football"
      heroSubtitle="Live scores, odds and betting markets for top football leagues worldwide"
      featuredMatch={footballMatches[4]} // PSG vs Lyon - live
      matches={footballMatches}
      league="Premier League • La Liga • Serie A"
      backgroundImage="https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop"
    />
  );
}
