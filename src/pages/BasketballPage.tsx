import MatchCard from '../components/main/MatchCard';
import SportPage from '../components/main/SportPage';
import basketballIcon from '../components/icons/basketball_icon.png';
import { basketballMatches } from '../data/mockData';

export default function BasketballPage() {
  return (
    <SportPage
      sport="Basketball"
      icon={<img src={basketballIcon} alt="Basketball" className="w-12 h-12 object-contain brightness-0 invert" />}
      accentColor="#f97316"
      heroTitle="Basketball"
      heroSubtitle="Real-time NBA, EuroLeague and global basketball betting markets"
      featuredMatch={basketballMatches[0]} // Lakers vs Warriors - live
      matches={basketballMatches}
      league="NBA • EuroLeague • NCAA"
      backgroundImage="https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2090&auto=format&fit=crop"
    />
  );
}
