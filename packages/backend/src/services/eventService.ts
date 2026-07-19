import prisma from '../config/database';
import { Match, MatchDetail, TeamDetail, MatchStats, BettingMarket } from '../types';
import { createError } from '../middleware/errorHandler';
import { EventStatus } from '@prisma/client';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = date.getUTCHours().toString().padStart(2, '0') + ':' + date.getUTCMinutes().toString().padStart(2, '0');

  if (diff < 0) return `${mins} GMT`; // past
  if (hours < 24) return `Today, ${mins}`;
  if (hours < 48) return `Tomorrow, ${mins}`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) + `, ${mins}`;
}

function getHomeAwayOdds(markets: { options: { odds: number; outcome: number }[] }[]): {
  win1: number;
  draw: number | null;
  win2: number;
} {
  const ftm = markets[0];
  if (!ftm || !ftm.options.length) return { win1: 2.0, draw: null, win2: 2.0 };

  const win1 = ftm.options.find(o => o.outcome === 0)?.odds ?? 2.0;
  const draw = ftm.options.find(o => o.outcome === 2)?.odds ?? null;
  const win2 = ftm.options.find(o => o.outcome === 1)?.odds ?? 2.0;
  return { win1, draw, win2 };
}

function parseForm(formJson: string): ('W' | 'D' | 'L')[] {
  try {
    return JSON.parse(formJson);
  } catch {
    return [];
  }
}

// ─── Map DB event to frontend Match shape ────────────────────────────────────

function dbEventToMatch(
  event: {
    id: string;
    sport: string;
    league: string;
    teamHome: string;
    teamAway: string;
    scoreHome: string;
    scoreAway: string;
    eventDate: Date;
    isLive: boolean;
    markets: { options: { odds: number; outcome: number }[] }[];
  }
): Match {
  const odds = getHomeAwayOdds(event.markets);
  return {
    id: event.id,
    sport: event.sport,
    league: event.league,
    time: formatTime(event.eventDate),
    team1: event.teamHome,
    team2: event.teamAway,
    score1: event.scoreHome,
    score2: event.scoreAway,
    odds,
    isLive: event.isLive,
  };
}

// ─── Service functions ────────────────────────────────────────────────────────

export async function getAllEvents(filters: {
  sport?: string;
  status?: string;
  isLive?: boolean;
}): Promise<Match[]> {
  const where: Record<string, unknown> = {};

  if (filters.sport) {
    where.sport = { equals: filters.sport, mode: 'insensitive' };
  }
  if (filters.status) {
    const statusMap: Record<string, EventStatus> = {
      upcoming: EventStatus.UPCOMING,
      live: EventStatus.LIVE,
      completed: EventStatus.COMPLETED,
      cancelled: EventStatus.CANCELLED,
    };
    where.status = statusMap[filters.status.toLowerCase()];
  }
  if (filters.isLive !== undefined) {
    where.isLive = filters.isLive;
  }

  const events = await prisma.event.findMany({
    where,
    include: {
      markets: {
        include: { options: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
    orderBy: { eventDate: 'asc' },
  });

  return events.map(dbEventToMatch);
}

export async function getEventById(id: string): Promise<MatchDetail> {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      teamHomeDetail: true,
      teamAwayDetail: true,
      stats: true,
      markets: {
        include: { options: { orderBy: { outcome: 'asc' } } },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!event) throw createError('Event not found', 404);

  const match = dbEventToMatch({
    ...event,
    markets: event.markets.map(m => ({ options: m.options })),
  });

  const mapTeam = (team: typeof event.teamHomeDetail): TeamDetail => {
    if (!team) throw createError('Team detail missing', 500);
    return {
      name: team.name,
      shortName: team.shortName,
      league: team.league,
      manager: team.manager,
      form: parseForm(team.form),
      color: team.color,
      keyPlayer: {
        name: team.keyPlayerName,
        role: team.keyPlayerRole as 'CAPTAIN' | 'STAR',
        goals: team.keyPlayerGoals,
        assists: team.keyPlayerAssists,
        xp: team.keyPlayerXp,
      },
    };
  };

  const stats: MatchStats = event.stats
    ? {
        possession: [event.stats.possessionHome, event.stats.possessionAway],
        shotsOnTarget: [event.stats.shotsOnTargetHome, event.stats.shotsOnTargetAway],
        corners: [event.stats.cornersHome, event.stats.cornersAway],
        wins: [event.stats.winsHome, event.stats.winsDraw, event.stats.winsAway],
      }
    : {
        possession: [50, 50],
        shotsOnTarget: ['0', '0'],
        corners: [0, 0],
        wins: [0, 0, 0],
      };

  const markets: BettingMarket[] = event.markets.map(m => ({
    title: m.title,
    options: m.options.map(o => ({ label: o.label, odds: o.odds, outcome: o.outcome })),
  }));

  const dateStr = event.eventDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const timeStr =
    event.eventDate.getUTCHours().toString().padStart(2, '0') +
    ':' +
    event.eventDate.getUTCMinutes().toString().padStart(2, '0') +
    ' GMT';

  return {
    id: event.id,
    match,
    date: dateStr,
    time: timeStr,
    venue: event.venue || 'TBD',
    team1: mapTeam(event.teamHomeDetail),
    team2: mapTeam(event.teamAwayDetail),
    stats,
    markets,
  };
}

export async function getEventOdds(id: string) {
  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      markets: {
        include: { options: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });
  if (!event) throw createError('Event not found', 404);

  return event.markets.map(m => ({
    marketId: m.id,
    title: m.title,
    options: m.options.map(o => ({
      id: o.id,
      label: o.label,
      odds: o.odds,
      outcome: o.outcome,
    })),
  }));
}
