import SportPage from '../components/main/SportPage';
import { racingMatches } from '../data/mockData';
import racingIcon from '../components/icons/racing_icon.png';

export default function RacingPage() {
  return (
    <SportPage
      sport="Racing"
      icon={<img src={racingIcon} alt="Racing" className="w-12 h-12 object-contain brightness-0 invert" />}
      accentColor="#ef4444"
      heroTitle="Racing"
      heroSubtitle="Formula 1, MotoGP, NASCAR and all major motorsport betting events"
      featuredMatch={racingMatches[0]} // F1 British GP - live
      matches={racingMatches}
      league="F1 • MotoGP • NASCAR"
      backgroundImage="https://images.unsplash.com/photo-1502224562085-639556652f33?q=80&w=2064&auto=format&fit=crop"
    />
  );
}
