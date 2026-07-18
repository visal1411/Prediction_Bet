import SportPage from '../components/main/SportPage';
import { tennisMatches } from '../data/mockData';

export default function TennisPage() {
  return (
    <SportPage
      sport="Tennis"
      icon="🎾"
      accentColor="#facc15"
      heroTitle="Tennis"
      heroSubtitle="ATP, WTA and Grand Slam live betting – every set, every point"
      featuredMatch={tennisMatches[0]} // Alcaraz vs Djokovic - live
      matches={tennisMatches}
      league="ATP • WTA • Grand Slams • ITF"
    />
  );
}
