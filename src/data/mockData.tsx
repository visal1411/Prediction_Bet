import footballIcon from '../components/icons/football_icon.png';
import basketballIcon from '../components/icons/basketball_icon.png';
import tennisIcon from '../components/icons/tennis_icon.png';
import volleyballIcon from '../components/icons/volleyball_icon.png';
import racingIcon from '../components/icons/racing_icon.png';
import esportIcon from '../components/icons/e-sport_icon.png';

export const sportsCategories = [
  { id: 'football', name: 'Football', icon: <img src={footballIcon} alt="Football" className="w-6 h-6 object-contain brightness-0 invert" />, path: '/football' },
  { id: 'basketball', name: 'Basketball', icon: <img src={basketballIcon} alt="Basketball" className="w-6 h-6 object-contain brightness-0 invert" />, path: '/basketball' },
  { id: 'tennis', name: 'Tennis', icon: <img src={tennisIcon} alt="Tennis" className="w-6 h-6 object-contain brightness-0 invert" />, path: '/tennis' },
  { id: 'volleyball', name: 'Volleyball', icon: <img src={volleyballIcon} alt="Volleyball" className="w-6 h-6 object-contain brightness-0 invert" />, path: '/volleyball' },
];

export const sportTabCategories = [
  { id: 'football', name: 'Football', icon: <img src={footballIcon} alt="Football" className="w-6 h-6 object-contain brightness-0 invert" />, path: '/football' },
  { id: 'basketball', name: 'Basketball', icon: <img src={basketballIcon} alt="Basketball" className="w-6 h-6 object-contain brightness-0 invert" />, path: '/basketball' },
  { id: 'tennis', name: 'Tennis', icon: <img src={tennisIcon} alt="Tennis" className="w-6 h-6 object-contain brightness-0 invert" />, path: '/tennis' },
  { id: 'racing', name: 'Racing', icon: <img src={racingIcon} alt="Racing" className="w-6 h-6 object-contain brightness-0 invert" />, path: '/racing' },
  { id: 'esports', name: 'Esports', icon: <img src={esportIcon} alt="Esports" className="w-6 h-6 object-contain brightness-0 invert" />, path: '/esports' },
];

export interface Match {
  id: number;
  sport: string;
  league: string;
  time: string;
  team1: string;
  team2: string;
  score1: string;
  score2: string;
  odds: { win1: number; draw: number | null; win2: number };
  isLive?: boolean;
}

export const upcomingMatches: Match[] = [
  {
    id: 1,
    sport: 'Football',
    league: 'Premier League',
    time: 'Today, 17:30',
    team1: 'Manchester Utd',
    team2: 'Arsenal',
    score1: '-',
    score2: '-',
    odds: { win1: 2.45, draw: 3.20, win2: 2.80 },
  },
  {
    id: 2,
    sport: 'Football',
    league: 'La Liga',
    time: 'Today, 21:00',
    team1: 'Barcelona',
    team2: 'Atletico Madrid',
    score1: '-',
    score2: '-',
    odds: { win1: 1.95, draw: 3.40, win2: 4.10 },
  },
  {
    id: 3,
    sport: 'Basketball',
    league: 'NBA Regular Season',
    time: 'Live 3Q',
    team1: 'Lakers',
    team2: 'Warriors',
    score1: '102',
    score2: '98',
    odds: { win1: 1.91, draw: null, win2: 1.91 },
    isLive: true,
  },
];

// --- Sport-specific matches ---

export const footballMatches: Match[] = [
  { id: 1, sport: 'Football', league: 'Premier League', time: 'Today, 17:30', team1: 'Manchester Utd', team2: 'Arsenal', score1: '-', score2: '-', odds: { win1: 2.45, draw: 3.20, win2: 2.80 } },
  { id: 2, sport: 'Football', league: 'La Liga', time: 'Today, 21:00', team1: 'Barcelona', team2: 'Atletico Madrid', score1: '-', score2: '-', odds: { win1: 1.95, draw: 3.40, win2: 4.10 } },
];

export const basketballMatches: Match[] = [
  { id: 3, sport: 'Basketball', league: 'NBA Regular Season', time: 'Live 3Q', team1: 'Lakers', team2: 'Warriors', score1: '102', score2: '98', odds: { win1: 1.91, draw: null, win2: 1.91 }, isLive: true },
];

export const tennisMatches: Match[] = [];
export const volleyballMatches: Match[] = [];
export const racingMatches: Match[] = [];
export const esportsMatches: Match[] = [];

export const allMatches: Match[] = [
  ...footballMatches,
  ...basketballMatches,
  ...tennisMatches,
  ...volleyballMatches,
  ...racingMatches,
  ...esportsMatches,
];

export const leagueStandings = [
  { pos: 1, team: 'Manchester City', played: 38, won: 28, drawn: 7, lost: 3, gf: 96, ga: 34, gd: '+62', pts: 91, form: ['W', 'W', 'W', 'W', 'W'] },
  { pos: 2, team: 'Arsenal', played: 38, won: 28, drawn: 5, lost: 5, gf: 91, ga: 29, gd: '+62', pts: 89, form: ['W', 'W', 'W', 'W', 'W'] },
  { pos: 3, team: 'Liverpool', played: 38, won: 24, drawn: 10, lost: 4, gf: 86, ga: 41, gd: '+45', pts: 82, form: ['W', 'D', 'W', 'D', 'W'] },
  { pos: 4, team: 'Chelsea', played: 38, won: 21, drawn: 9, lost: 8, gf: 77, ga: 45, gd: '+32', pts: 72, form: ['W', 'W', 'D', 'L', 'W'] },
  { pos: 5, team: 'Tottenham', played: 38, won: 20, drawn: 6, lost: 12, gf: 70, ga: 52, gd: '+18', pts: 66, form: ['D', 'W', 'W', 'D', 'L'] },
];

export const betSlipItems = [
  { id: 1, sport: 'FOOTBALL', team: 'Manchester Utd (1)', market: 'Match Winner', odds: 2.45 },
  { id: 2, sport: 'BASKETBALL', team: 'Lakers (-2.5)', market: 'Point Spread', odds: 1.91 },
];
