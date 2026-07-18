import MatchCard from '../components/main/MatchCard';
import SportPage from '../components/main/SportPage';
import volleyballIcon from '../components/icons/volleyball_icon.png';
import { volleyballMatches } from '../data/mockData';

export default function VolleyballPage() {
  return (
    <SportPage
      sport="Volleyball"
      icon={<img src={volleyballIcon} alt="Volleyball" className="w-12 h-12 object-contain brightness-0 invert" />}
      accentColor="#f59e0b"
      heroTitle="Volleyball"
      heroSubtitle="FIVB World League, Olympics, and top club volleyball betting"
      featuredMatch={volleyballMatches[0]} // Brazil vs Poland - live
      matches={volleyballMatches}
      league="FIVB • Olympics • CEV Champions League • NCAA"
    />
  );
}
