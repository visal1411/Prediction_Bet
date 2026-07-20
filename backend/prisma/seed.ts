import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sportsCategories = ['Football', 'Basketball', 'Tennis', 'Volleyball', 'Racing', 'Esports'];

async function main() {
  console.log('Seeding database with mock data...');

  // 1. Seed demo markets from mockMarkets array
  const mockMarkets = [
    {
      eventId: 'EVT-001',
      sport: 'Football',
      league: 'Premier League',
      teamHome: 'Manchester Utd',
      teamAway: 'Arsenal',
      eventDate: '2026-07-25T17:30:00Z',
      marketAddress: '0x1234abcd1234abcd1234abcd1234abcd1234abcd',
      status: 'open',
      totalPool: '12500000000000000000', // 12.5 ETH in wei
      poolHome: '5200000000000000000',
      poolDraw: '3100000000000000000',
      poolAway: '4200000000000000000',
      totalBettors: 34,
      isDemo: true,
    },
    {
      eventId: 'EVT-002',
      sport: 'Football',
      league: 'La Liga',
      teamHome: 'Barcelona',
      teamAway: 'Atletico Madrid',
      eventDate: '2026-07-26T21:00:00Z',
      marketAddress: '0x5678efgh5678efgh5678efgh5678efgh5678efgh',
      status: 'locked',
      totalPool: '8300000000000000000',
      poolHome: '4100000000000000000',
      poolDraw: '1800000000000000000',
      poolAway: '2400000000000000000',
      totalBettors: 21,
      isDemo: true,
    },
    {
      eventId: 'EVT-003',
      sport: 'Basketball',
      league: 'NBA Regular Season',
      teamHome: 'Lakers',
      teamAway: 'Warriors',
      eventDate: '2026-07-20T20:30:00Z',
      marketAddress: '0x9abcijkl9abcijkl9abcijkl9abcijkl9abcijkl',
      status: 'resolved',
      totalPool: '22700000000000000000',
      poolHome: '12100000000000000000',
      poolDraw: '0',
      poolAway: '10600000000000000000',
      totalBettors: 58,
      result: 0,
      isDemo: false,
    },
  ];

  for (const market of mockMarkets) {
    const existing = await prisma.event.findFirst({
      where: { externalApiId: market.eventId } as any // Prisma creates ID as UUID, we use externalApiId if needed, but schema uses `id`
    });
    // Let's create directly
    await prisma.event.create({
      data: {
        sport: market.sport,
        league: market.league,
        teamHome: market.teamHome,
        teamAway: market.teamAway,
        eventDate: new Date(market.eventDate),
        externalApiId: market.eventId,
        marketAddress: market.marketAddress,
        isDemo: market.isDemo,
        status: market.status,
        result: market.result,
        totalPool: market.totalPool,
        poolHome: market.poolHome,
        poolDraw: market.poolDraw,
        poolAway: market.poolAway,
        totalBettors: market.totalBettors,
      },
    });
  }

  // 2. Add some "upcoming" matches from allMatches
  const upcomingMatches = [
    {
      sport: 'Football',
      league: 'Premier League',
      teamHome: 'Manchester Utd',
      teamAway: 'Arsenal',
      eventDate: '2026-07-25T17:30:00Z',
      isDemo: false,
      status: 'upcoming',
    },
    {
      sport: 'Football',
      league: 'La Liga',
      teamHome: 'Barcelona',
      teamAway: 'Atletico Madrid',
      eventDate: '2026-07-26T21:00:00Z',
      isDemo: false,
      status: 'upcoming',
    },
  ];

  for (const match of upcomingMatches) {
    await prisma.event.create({
      data: {
        sport: match.sport,
        league: match.league,
        teamHome: match.teamHome,
        teamAway: match.teamAway,
        eventDate: new Date(match.eventDate),
        isDemo: match.isDemo,
        status: match.status,
      },
    });
  }

  console.log('Database seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
