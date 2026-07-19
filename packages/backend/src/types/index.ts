// Shared TypeScript interfaces matching frontend data shapes

// ─── Match (matches frontend src/data/mockData.tsx Match interface) ───────────
export interface MatchOdds {
  win1: number;
  draw: number | null;
  win2: number;
}

export interface Match {
  id: number | string;
  sport: string;
  league: string;
  time: string;
  team1: string;
  team2: string;
  score1: string;
  score2: string;
  odds: MatchOdds;
  isLive?: boolean;
}

// ─── Player ───────────────────────────────────────────────────────────────────
export interface Player {
  name: string;
  role: 'CAPTAIN' | 'STAR';
  goals: number;
  assists: number;
  xp: number;
}

// ─── TeamDetail ───────────────────────────────────────────────────────────────
export interface TeamDetail {
  name: string;
  shortName: string;
  league: string;
  manager: string;
  form: ('W' | 'D' | 'L')[];
  color: string;
  keyPlayer: Player;
}

// ─── MatchStats ───────────────────────────────────────────────────────────────
export interface MatchStats {
  possession: [number, number];
  shotsOnTarget: [string, string];
  corners: [number, number];
  wins: [number, number, number]; // [team1wins, draws, team2wins]
}

// ─── BettingMarket ────────────────────────────────────────────────────────────
export interface MarketOption {
  label: string;
  odds: number;
  outcome?: number;
}

export interface BettingMarket {
  title: string;
  options: MarketOption[];
}

// ─── MatchDetail (for /api/events/:id) ───────────────────────────────────────
export interface MatchDetail {
  id: string;
  match: Match;
  date: string;
  time: string;
  venue: string;
  team1: TeamDetail;
  team2: TeamDetail;
  stats: MatchStats;
  markets: BettingMarket[];
}

// ─── Bet ──────────────────────────────────────────────────────────────────────
export interface BetResponse {
  id: string;
  date: string;
  match: string;
  sport: string;
  market: string;
  selection: string;
  odds: number;
  stake: number;
  potentialPayout: number;
  status: 'ACTIVE' | 'WON' | 'LOST' | 'CLAIMED' | 'CANCELLED';
  txHash?: string;
}

export interface PlaceBetRequest {
  eventId: string;
  marketOptionId: string;
  stake: number;
  walletAddress: string;
  txHash?: string;
}

// ─── User Profile ─────────────────────────────────────────────────────────────
export interface UserProfile {
  walletAddress: string;
  username: string | null;
  avatarUrl: string | null;
  totalBets: number;
  totalWon: number;
  totalStaked: number;
  totalProfit: number;
  joinedAt: string;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export interface NonceResponse {
  nonce: string;
  message: string;
}

export interface VerifyRequest {
  walletAddress: string;
  signature: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

// ─── API Response wrappers ───────────────────────────────────────────────────
export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  error: string;
  details?: unknown;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Leaderboard ─────────────────────────────────────────────────────────────
export interface LeaderboardEntry {
  rank: number;
  walletAddress: string;
  username: string | null;
  totalWon: number;
  totalBets: number;
  totalProfit: number;
}
