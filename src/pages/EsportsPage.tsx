import SportPage from '../components/main/SportPage';
import { esportsMatches } from '../data/mockData';
import esportIcon from '../components/icons/e-sport_icon.png';

export default function EsportsPage() {
  return (
    <SportPage
      sport="Esports"
      icon={<img src={esportIcon} alt="Esports" className="w-12 h-12 object-contain brightness-0 invert" />}
      accentColor="#8b5cf6"
      heroTitle="Esports"
      heroSubtitle="CS2, League of Legends, Dota 2, Valorant and more competitive gaming markets"
      featuredMatch={esportsMatches[0]} // NaVi vs Vitality - live
      matches={esportsMatches}
      league="CS2 • LoL • Valorant • Dota 2"
      backgroundImage="https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop"
    />
  );
}
