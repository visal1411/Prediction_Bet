import SportPage from '../components/main/SportPage';
import { iceHockeyMatches } from '../data/mockData';

export default function IceHockeyPage() {
  return (
    <SportPage
      sport="Ice Hockey"
      icon="🏒"
      accentColor="#38bdf8"
      heroTitle="Ice Hockey"
      heroSubtitle="NHL playoffs, KHL and international ice hockey betting markets"
      featuredMatch={iceHockeyMatches[0]} // Bruins vs Maple Leafs - live
      matches={iceHockeyMatches}
      league="NHL • KHL • SHL • IIHF"
    />
  );
}
