import SportPage from '../components/main/SportPage';
import { basketballMatches } from '../data/mockData';

export default function BasketballPage() {
  return (
    <SportPage
      sport="Basketball"
      icon="🏀"
      accentColor="#f97316"
      heroTitle="Basketball"
      heroSubtitle="Real-time NBA, EuroLeague and global basketball betting markets"
      featuredMatch={basketballMatches[0]} // Lakers vs Warriors - live
      matches={basketballMatches}
      league="NBA • EuroLeague • NCAA"
    />
  );
}
