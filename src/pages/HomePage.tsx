import HeroBanner from '../components/main/HeroBanner';
import SportTabs from '../components/main/SportTabs';
import UpcomingMatches from '../components/main/UpcomingMatches';
import LeagueStandings from '../components/main/LeagueStandings';
import { useState } from 'react';

export default function HomePage() {
  const [activeSport, setActiveSport] = useState('all');

  return (
    <div className="max-w-7xl mx-auto px-8 py-8">
      <HeroBanner />
      <SportTabs activeSport={activeSport} onSportSelect={setActiveSport} />
      <UpcomingMatches sportFilter={activeSport} />
      <LeagueStandings />
    </div>
  );
}
