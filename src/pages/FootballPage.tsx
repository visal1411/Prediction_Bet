import SportPage from '../components/main/SportPage';
import { footballMatches } from '../data/mockData';

export default function FootballPage() {
  return (
    <SportPage
      sport="Football"
      icon="⚽"
      accentColor="#22c55e"
      heroTitle="Football"
      heroSubtitle="Live scores, odds and betting markets for top football leagues worldwide"
      featuredMatch={footballMatches[4]} // PSG vs Lyon - live
      matches={footballMatches}
      league="Premier League • La Liga • Serie A • Bundesliga"
    />
  );
}
