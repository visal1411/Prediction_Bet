import prisma from '../config/database';
import { BetResponse, PlaceBetRequest } from '../types';
import { createError } from '../middleware/errorHandler';

// ─── Map DB bet to frontend BetResponse shape ─────────────────────────────────

async function dbBetToResponse(bet: {
  id: string;
  placedAt: Date;
  stake: number;
  odds: number;
  potentialPayout: number;
  status: string;
  txHash: string | null;
  marketOption: {
    label: string;
    market: {
      title: string;
      event: {
        teamHome: string;
        teamAway: string;
        sport: string;
      };
    };
  };
}): Promise<BetResponse> {
  const { market } = bet.marketOption;
  const { event } = market;

  return {
    id: bet.id,
    date: bet.placedAt.toISOString(),
    match: `${event.teamHome} vs ${event.teamAway}`,
    sport: event.sport,
    market: market.title,
    selection: bet.marketOption.label,
    odds: bet.odds,
    stake: bet.stake,
    potentialPayout: bet.potentialPayout,
    status: bet.status as BetResponse['status'],
    txHash: bet.txHash ?? undefined,
  };
}

// ─── Service functions ────────────────────────────────────────────────────────

export async function getBetHistory(walletAddress: string): Promise<BetResponse[]> {
  const bets = await prisma.bet.findMany({
    where: { walletAddress: walletAddress.toLowerCase() },
    include: {
      marketOption: {
        include: {
          market: {
            include: {
              event: { select: { teamHome: true, teamAway: true, sport: true } },
            },
          },
        },
      },
    },
    orderBy: { placedAt: 'desc' },
  });

  return Promise.all(bets.map(dbBetToResponse));
}

export async function getActiveBets(walletAddress: string): Promise<BetResponse[]> {
  const bets = await prisma.bet.findMany({
    where: {
      walletAddress: walletAddress.toLowerCase(),
      status: 'ACTIVE',
    },
    include: {
      marketOption: {
        include: {
          market: {
            include: {
              event: { select: { teamHome: true, teamAway: true, sport: true } },
            },
          },
        },
      },
    },
    orderBy: { placedAt: 'desc' },
  });

  return Promise.all(bets.map(dbBetToResponse));
}

export async function placeBet(data: PlaceBetRequest): Promise<BetResponse> {
  // Verify the market option exists and get its odds
  const option = await prisma.marketOption.findUnique({
    where: { id: data.marketOptionId },
    include: {
      market: {
        include: { event: true },
      },
    },
  });

  if (!option) throw createError('Market option not found', 404);

  const event = option.market.event;
  if (event.status !== 'UPCOMING' && event.status !== 'LIVE') {
    throw createError('This event is no longer accepting bets', 400);
  }

  const odds = option.odds;
  const potentialPayout = parseFloat((data.stake * odds).toFixed(2));

  // Create bet
  const bet = await prisma.bet.create({
    data: {
      eventId: data.eventId,
      marketOptionId: data.marketOptionId,
      walletAddress: data.walletAddress.toLowerCase(),
      stake: data.stake,
      odds,
      potentialPayout,
      txHash: data.txHash,
      status: 'ACTIVE',
    },
    include: {
      marketOption: {
        include: {
          market: {
            include: {
              event: { select: { teamHome: true, teamAway: true, sport: true } },
            },
          },
        },
      },
    },
  });

  // Update user stats
  await prisma.user.upsert({
    where: { walletAddress: data.walletAddress.toLowerCase() },
    update: {
      totalBets: { increment: 1 },
      totalStaked: { increment: data.stake },
    },
    create: {
      walletAddress: data.walletAddress.toLowerCase(),
      totalBets: 1,
      totalStaked: data.stake,
    },
  });

  return dbBetToResponse(bet);
}
