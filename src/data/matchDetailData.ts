import type { Match } from './mockData';

export interface Player {
  name: string;
  role: 'CAPTAIN' | 'STAR';
  goals: number;
  assists: number;
  xp: number;
  image?: string;
}

export interface TeamDetail {
  name: string;
  shortName: string;
  league: string;
  manager: string;
  form: ('W' | 'D' | 'L')[];
  color: string;
  keyPlayer: Player;
}

export interface MatchStats {
  possession: [number, number];
  shotsOnTarget: [string, string];
  corners: [number, number];
  wins: [number, number, number]; // [team1wins, draws, team2wins]
}

export interface BettingMarket {
  title: string;
  options: { label: string; odds: number }[];
}

export interface MatchDetail {
  id: number;
  match: Match;
  date: string;
  time: string;
  venue: string;
  team1: TeamDetail;
  team2: TeamDetail;
  stats: MatchStats;
  markets: BettingMarket[];
}

export const matchDetails: Record<number, MatchDetail> = {
  1: {
    id: 1,
    match: {
      id: 1, league: 'Premier League', sport: 'Football', time: 'Today, 17:30',
      team1: 'Manchester Utd', team2: 'Arsenal',
      score1: '-', score2: '-', odds: { win1: 2.45, draw: 3.20, win2: 2.80 },
    },
    date: '20 July 2026',
    time: '20:00 GMT',
    venue: 'Old Trafford, Manchester',
    team1: {
      name: 'Manchester United', shortName: 'MUN', league: 'Premier League',
      manager: 'Ruben Amorim', color: '#dc2626',
      form: ['W', 'W', 'D', 'L', 'W'],
      keyPlayer: { name: 'Bruno Fernandes', role: 'CAPTAIN', goals: 12, assists: 8, xp: 9.2 },
    },
    team2: {
      name: 'Arsenal', shortName: 'ARS', league: 'Premier League',
      manager: 'Mikel Arteta', color: '#ef4444',
      form: ['W', 'W', 'W', 'D', 'W'],
      keyPlayer: { name: 'Bukayo Saka', role: 'STAR', goals: 15, assists: 11, xp: 9.5 },
    },
    stats: {
      possession: [48, 52],
      shotsOnTarget: ['14 (6)', '16 (8)'],
      corners: [5, 7],
      wins: [45, 32, 38],
    },
    markets: [
      {
        title: 'Full Time Result',
        options: [
          { label: 'MUN', odds: 2.45 },
          { label: 'DRAW', odds: 3.40 },
          { label: 'ARS', odds: 2.80 },
        ],
      },
      {
        title: 'First Goal Scorer',
        options: [
          { label: 'Bukayo Saka', odds: 5.50 },
          { label: 'Bruno Fernandes', odds: 7.00 },
          { label: 'Marcus Rashford', odds: 7.50 },
        ],
      },
      {
        title: 'Correct Score',
        options: [
          { label: 'MUN 1-0', odds: 9.00 },
          { label: 'ARS 1-2', odds: 11.00 },
          { label: 'DRAW 1-1', odds: 6.50 },
          { label: 'DRAW 2-2', odds: 13.00 },
        ],
      },
    ],
  },
  2: {
    id: 2,
    match: {
      id: 2, league: 'La Liga', sport: 'Football', time: 'Today, 21:00',
      team1: 'Barcelona', team2: 'Atletico Madrid',
      score1: '-', score2: '-', odds: { win1: 1.95, draw: 3.40, win2: 4.10 },
    },
    date: '20 July 2026',
    time: '21:00 GMT',
    venue: 'Camp Nou, Barcelona',
    team1: {
      name: 'Barcelona', shortName: 'BAR', league: 'La Liga',
      manager: 'Hansi Flick', color: '#1d4ed8',
      form: ['W', 'W', 'W', 'W', 'D'],
      keyPlayer: { name: 'Lamine Yamal', role: 'STAR', goals: 18, assists: 13, xp: 9.7 },
    },
    team2: {
      name: 'Atletico Madrid', shortName: 'ATM', league: 'La Liga',
      manager: 'Diego Simeone', color: '#b91c1c',
      form: ['W', 'D', 'W', 'L', 'W'],
      keyPlayer: { name: 'Antoine Griezmann', role: 'CAPTAIN', goals: 14, assists: 7, xp: 8.9 },
    },
    stats: {
      possession: [62, 38],
      shotsOnTarget: ['18 (9)', '8 (4)'],
      corners: [9, 3],
      wins: [72, 41, 52],
    },
    markets: [
      {
        title: 'Full Time Result',
        options: [
          { label: 'BAR', odds: 1.95 },
          { label: 'DRAW', odds: 3.40 },
          { label: 'ATM', odds: 4.10 },
        ],
      },
      {
        title: 'First Goal Scorer',
        options: [
          { label: 'Lamine Yamal', odds: 4.50 },
          { label: 'Griezmann', odds: 6.00 },
          { label: 'R. Lewandowski', odds: 4.00 },
        ],
      },
      {
        title: 'Correct Score',
        options: [
          { label: 'BAR 2-0', odds: 7.00 },
          { label: 'BAR 1-0', odds: 6.00 },
          { label: 'DRAW 1-1', odds: 7.50 },
          { label: 'ATM 0-1', odds: 12.00 },
        ],
      },
    ],
  },
  3: {
    id: 3,
    match: {
      id: 3, league: 'NBA Regular Season', sport: 'Basketball', time: 'Live 3Q',
      team1: 'Lakers', team2: 'Warriors',
      score1: '102', score2: '98', odds: { win1: 1.91, draw: null, win2: 1.91 }, isLive: true,
    },
    date: '20 July 2026',
    time: '20:30 PST',
    venue: 'Crypto.com Arena, Los Angeles',
    team1: {
      name: 'Los Angeles Lakers', shortName: 'LAL', league: 'NBA',
      manager: 'JJ Redick', color: '#7c3aed',
      form: ['W', 'W', 'L', 'W', 'W'],
      keyPlayer: { name: 'LeBron James', role: 'CAPTAIN', goals: 28, assists: 9, xp: 9.8 },
    },
    team2: {
      name: 'Golden State Warriors', shortName: 'GSW', league: 'NBA',
      manager: 'Steve Kerr', color: '#d97706',
      form: ['W', 'D', 'W', 'W', 'L'],
      keyPlayer: { name: 'Stephen Curry', role: 'STAR', goals: 32, assists: 7, xp: 9.6 },
    },
    stats: {
      possession: [52, 48],
      shotsOnTarget: ['44 (19)', '39 (17)'],
      corners: [0, 0],
      wins: [35, 0, 30],
    },
    markets: [
      {
        title: 'Match Winner',
        options: [
          { label: 'LAL', odds: 1.91 },
          { label: 'GSW', odds: 1.91 },
        ],
      },
      {
        title: 'Point Spread',
        options: [
          { label: 'LAL -2.5', odds: 1.91 },
          { label: 'GSW +2.5', odds: 1.91 },
        ],
      },
      {
        title: 'Total Points',
        options: [
          { label: 'Over 220.5', odds: 1.85 },
          { label: 'Under 220.5', odds: 1.95 },
        ],
      },
    ],
  },
};

// Generate details for other matches
export function getMatchDetail(id: number): MatchDetail | null {
  return matchDetails[id] ?? null;
}
