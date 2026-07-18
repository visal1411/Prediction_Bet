import SportPage from '../components/main/SportPage';
import { volleyballMatches } from '../data/mockData';

export default function VolleyballPage() {
  return (
    <SportPage
      sport="Volleyball"
      icon="🏐"
      accentColor="#a855f7"
      heroTitle="Volleyball"
      heroSubtitle="FIVB World League, Olympics, and top club volleyball betting"
      featuredMatch={volleyballMatches[0]} // Brazil vs Poland - live
      matches={volleyballMatches}
      league="FIVB • Olympics • CEV Champions League • NCAA"
    />
  );
}
