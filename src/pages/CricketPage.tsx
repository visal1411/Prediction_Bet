import SportPage from '../components/main/SportPage';
import { cricketMatches } from '../data/mockData';

export default function CricketPage() {
  return (
    <SportPage
      sport="Cricket"
      icon="🏏"
      accentColor="#84cc16"
      heroTitle="Cricket"
      heroSubtitle="ICC World Cup, The Ashes, IPL and all major cricket tournaments"
      featuredMatch={cricketMatches[0]} // India vs Australia - live
      matches={cricketMatches}
      league="ICC World Cup • IPL • The Ashes • T20"
    />
  );
}
