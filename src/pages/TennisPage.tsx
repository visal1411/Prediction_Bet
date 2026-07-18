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
      league="ATP • WTA • Grand Slams • ITF"
    />
  );
}
