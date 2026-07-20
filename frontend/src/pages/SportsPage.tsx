import { useParams, Navigate } from 'react-router';
import SportPage from '../components/main/SportPage';
import { 
  footballMatches, 
  basketballMatches, 
  tennisMatches, 
  volleyballMatches, 
  racingMatches, 
  esportsMatches 
} from '../data/mockData';

import footballIcon from '../components/icons/football_icon.png';
import basketballIcon from '../components/icons/basketball_icon.png';
import tennisIcon from '../components/icons/tennis_icon.png';
import volleyballIcon from '../components/icons/volleyball_icon.png';
import racingIcon from '../components/icons/racing_icon.png';
import esportIcon from '../components/icons/e-sport_icon.png';

export default function SportsPage() {
  const { sportId } = useParams<{ sportId: string }>();

  // Configuration for each sport type
  const sportConfigs: Record<string, any> = {
    football: {
      sport: "Football",
      icon: <img src={footballIcon} alt="Football" className="w-12 h-12 object-contain brightness-0 invert" />,
      accentColor: "#3b82f6", // blue
      heroTitle: "Football",
      heroSubtitle: "Live scores, odds and betting markets for top football leagues worldwide",
      featuredMatch: footballMatches[0],
      matches: footballMatches,
      league: "Premier League • La Liga • Serie A",
      backgroundImage: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=1935&auto=format&fit=crop"
    },
    basketball: {
      sport: "Basketball",
      icon: <img src={basketballIcon} alt="Basketball" className="w-12 h-12 object-contain brightness-0 invert" />,
      accentColor: "#f97316", // orange
      heroTitle: "Basketball",
      heroSubtitle: "Real-time NBA, EuroLeague and global basketball betting markets",
      featuredMatch: basketballMatches[0],
      matches: basketballMatches,
      league: "NBA • EuroLeague • NCAA",
      backgroundImage: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=2090&auto=format&fit=crop"
    },
    tennis: {
      sport: "Tennis",
      icon: <img src={tennisIcon} alt="Tennis" className="w-12 h-12 object-contain brightness-0 invert" />,
      accentColor: "#eab308", // yellow
      heroTitle: "Tennis",
      heroSubtitle: "ATP, WTA and Grand Slam tournament betting",
      featuredMatch: tennisMatches[0],
      matches: tennisMatches,
      league: "ATP • WTA • Grand Slams",
      backgroundImage: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?q=80&w=2072&auto=format&fit=crop"
    },
    volleyball: {
      sport: "Volleyball",
      icon: <img src={volleyballIcon} alt="Volleyball" className="w-12 h-12 object-contain brightness-0 invert" />,
      accentColor: "#8b5cf6", // purple
      heroTitle: "Volleyball",
      heroSubtitle: "Global volleyball leagues and international tournaments",
      featuredMatch: volleyballMatches[0],
      matches: volleyballMatches,
      league: "FIVB • CEV • Pro Leagues",
      backgroundImage: "https://images.unsplash.com/photo-1592656094267-764a45160876?q=80&w=2070&auto=format&fit=crop"
    },
    racing: {
      sport: "Racing",
      icon: <img src={racingIcon} alt="Racing" className="w-12 h-12 object-contain brightness-0 invert" />,
      accentColor: "#ef4444", // red
      heroTitle: "Racing",
      heroSubtitle: "Formula 1, MotoGP and international racing events",
      featuredMatch: racingMatches[0],
      matches: racingMatches,
      league: "F1 • MotoGP • WRC",
      backgroundImage: "https://images.unsplash.com/photo-1517026575980-3e1e2dedeab4?q=80&w=1998&auto=format&fit=crop"
    },
    esports: {
      sport: "Esports",
      icon: <img src={esportIcon} alt="Esports" className="w-12 h-12 object-contain brightness-0 invert" />,
      accentColor: "#10b981", // emerald
      heroTitle: "Esports",
      heroSubtitle: "CS:GO, LoL, Dota 2 and major esports tournaments",
      featuredMatch: esportsMatches[0],
      matches: esportsMatches,
      league: "CS:GO • LoL • Dota 2",
      backgroundImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=2070&auto=format&fit=crop"
    }
  };

  if (!sportId || !sportConfigs[sportId]) {
    return <Navigate to="/" replace />;
  }

  const config = sportConfigs[sportId];

  return <SportPage {...config} />;
}
