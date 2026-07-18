import SportPage from '../components/main/SportPage';
import { racingMatches } from '../data/mockData';

export default function RacingPage() {
  return (
    <SportPage
      sport="Racing"
      icon="🏎️"
      accentColor="#ef4444"
      heroTitle="Racing"
      heroSubtitle="Formula 1, MotoGP, NASCAR and all major motorsport betting events"
      featuredMatch={racingMatches[0]} // F1 British GP - live
      matches={racingMatches}
      league="Formula 1 • MotoGP • NASCAR • IndyCar • WRC"
    />
  );
}
