import SportPage from '../components/main/SportPage';
import { esportsMatches } from '../data/mockData';

export default function EsportsPage() {
  return (
    <SportPage
      sport="Esports"
      icon="🎮"
      accentColor="#8b5cf6"
      heroTitle="Esports"
      heroSubtitle="CS2, League of Legends, Dota 2, Valorant and more competitive gaming markets"
      featuredMatch={esportsMatches[0]} // NaVi vs Vitality - live
      matches={esportsMatches}
      league="CS2 • LoL • Dota 2 • Valorant • BLAST"
    />
  );
}
