import SportPage from '../components/main/SportPage';
import { tennisMatches } from '../data/mockData';
import tennisIcon from '../components/icons/tennis_icon.png';

export default function TennisPage() {
  return (
    <SportPage
      sport="Tennis"
      icon={<img src={tennisIcon} alt="Tennis" className="w-12 h-12 object-contain brightness-0 invert" />}
      accentColor="#84cc16"
      heroTitle="Tennis"
      heroSubtitle="ATP, WTA and Grand Slam live betting – every set, every point"
      featuredMatch={tennisMatches[0]} // Alcaraz vs Djokovic - live
      matches={tennisMatches}
      league="ATP • WTA • Grand Slam"
      backgroundImage="https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=2072&auto=format&fit=crop"
    />
  );
}
