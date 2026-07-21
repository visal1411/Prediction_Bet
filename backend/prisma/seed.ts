import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Rich Match Details Data
const detailsData: any = {
  1: {
    date: '20 July 2026',
    time: '20:00 GMT',
    venue: 'Old Trafford, Manchester',
    team1: { name: 'Manchester United', shortName: 'MUN', league: 'Premier League', manager: 'Ruben Amorim', color: '#dc2626', form: ['W', 'W', 'D', 'L', 'W'], keyPlayer: { name: 'Bruno Fernandes', role: 'CAPTAIN', goals: 12, assists: 8, xp: 9.2 } },
    team2: { name: 'Arsenal', shortName: 'ARS', league: 'Premier League', manager: 'Mikel Arteta', color: '#ef4444', form: ['W', 'W', 'W', 'D', 'W'], keyPlayer: { name: 'Bukayo Saka', role: 'STAR', goals: 15, assists: 11, xp: 9.5 } },
    stats: { possession: [48, 52], shotsOnTarget: ['14 (6)', '16 (8)'], corners: [5, 7], wins: [45, 32, 38] },
    markets: [
      { title: 'Full Time Result', options: [{ label: 'MUN', odds: 2.0 }, { label: 'DRAW', odds: 3.0 }, { label: 'ARS', odds: 2.0 }] },
      { title: 'First Goal Scorer', options: [{ label: 'Bukayo Saka', odds: 5.50 }, { label: 'Bruno Fernandes', odds: 7.00 }, { label: 'Marcus Rashford', odds: 7.50 }] },
      { title: 'Correct Score', options: [{ label: 'MUN 1-0', odds: 9.00 }, { label: 'ARS 1-2', odds: 11.00 }, { label: 'DRAW 1-1', odds: 6.50 }, { label: 'DRAW 2-2', odds: 13.00 }] }
    ]
  },
  2: {
    date: '20 July 2026',
    time: '21:00 GMT',
    venue: 'Camp Nou, Barcelona',
    team1: { name: 'Barcelona', shortName: 'BAR', league: 'La Liga', manager: 'Hansi Flick', color: '#1d4ed8', form: ['W', 'W', 'W', 'W', 'D'], keyPlayer: { name: 'Lamine Yamal', role: 'STAR', goals: 18, assists: 13, xp: 9.7 } },
    team2: { name: 'Atletico Madrid', shortName: 'ATM', league: 'La Liga', manager: 'Diego Simeone', color: '#b91c1c', form: ['W', 'D', 'W', 'L', 'W'], keyPlayer: { name: 'Antoine Griezmann', role: 'CAPTAIN', goals: 14, assists: 7, xp: 8.9 } },
    stats: { possession: [62, 38], shotsOnTarget: ['18 (9)', '8 (4)'], corners: [9, 3], wins: [72, 41, 52] },
    markets: [
      { title: 'Full Time Result', options: [{ label: 'BAR', odds: 2.0 }, { label: 'DRAW', odds: 3.5 }, { label: 'ATM', odds: 2.0 }] },
      { title: 'First Goal Scorer', options: [{ label: 'Lamine Yamal', odds: 4.50 }, { label: 'Griezmann', odds: 6.00 }, { label: 'R. Lewandowski', odds: 4.00 }] },
      { title: 'Correct Score', options: [{ label: 'BAR 2-0', odds: 7.00 }, { label: 'BAR 1-0', odds: 6.00 }, { label: 'DRAW 1-1', odds: 7.50 }, { label: 'ATM 0-1', odds: 12.00 }] }
    ]
  },
  3: {
    date: '20 July 2026',
    time: '20:30 PST',
    venue: 'Crypto.com Arena, Los Angeles',
    team1: { name: 'Los Angeles Lakers', shortName: 'LAL', league: 'NBA', manager: 'JJ Redick', color: '#7c3aed', form: ['W', 'W', 'L', 'W', 'W'], keyPlayer: { name: 'LeBron James', role: 'CAPTAIN', goals: 28, assists: 9, xp: 9.8 } },
    team2: { name: 'Golden State Warriors', shortName: 'GSW', league: 'NBA', manager: 'Steve Kerr', color: '#d97706', form: ['W', 'D', 'W', 'W', 'L'], keyPlayer: { name: 'Stephen Curry', role: 'STAR', goals: 32, assists: 7, xp: 9.6 } },
    stats: { possession: [52, 48], shotsOnTarget: ['44 (19)', '39 (17)'], corners: [0, 0], wins: [35, 0, 30] },
    markets: [
      { title: 'Match Winner', options: [{ label: 'LAL', odds: 2.0 }, { label: 'DRAW', odds: 15.00 }, { label: 'GSW', odds: 2.0 }] },
      { title: 'Point Spread', options: [{ label: 'LAL -2.5', odds: 1.91 }, { label: 'GSW +2.5', odds: 1.91 }] },
      { title: 'Total Points', options: [{ label: 'Over 220.5', odds: 1.85 }, { label: 'Under 220.5', odds: 1.95 }] }
    ]
  }
};

async function main() {
  console.log('Seeding database with mock data...');
  
  // Clear old data first
  await prisma.bet.deleteMany({});
  await prisma.event.deleteMany({});

  // 1. Seed demo markets from mockMarkets array
  const mockMarkets = [
    {
      eventId: 'EVT-001', sport: 'Football', league: 'Premier League', teamHome: 'Manchester Utd', teamAway: 'Arsenal',
      eventDate: '2026-07-25T17:30:00Z', marketAddress: '0xCafac3dD18aC6c6e92c921884f9E4176737C052c', status: 'open',
      totalPool: '12500000000000000000', poolHome: '5200000000000000000', poolDraw: '3100000000000000000', poolAway: '4200000000000000000',
      totalBettors: 34, details: detailsData[1],
    },
    {
      eventId: 'EVT-002', sport: 'Football', league: 'La Liga', teamHome: 'Barcelona', teamAway: 'Atletico Madrid',
      eventDate: '2026-07-26T21:00:00Z', marketAddress: '0x9f1ac54BEF0DD2f6f3462EA0fa94fC62300d3a8e', status: 'open',
      totalPool: '8300000000000000000', poolHome: '4100000000000000000', poolDraw: '1800000000000000000', poolAway: '2400000000000000000',
      totalBettors: 21, details: detailsData[2],
    },
    {
      eventId: 'EVT-003', sport: 'Basketball', league: 'NBA Regular Season', teamHome: 'Lakers', teamAway: 'Warriors',
      eventDate: '2026-07-20T20:30:00Z', marketAddress: '0x9abcijkl9abcijkl9abcijkl9abcijkl9abcijkl', status: 'resolved',
      totalPool: '22700000000000000000', poolHome: '12100000000000000000', poolDraw: '0', poolAway: '10600000000000000000',
      totalBettors: 58, result: 0, details: detailsData[3],
    },
  ];

  for (const market of mockMarkets) {
    await prisma.event.create({
      data: {
        sport: market.sport, league: market.league, teamHome: market.teamHome, teamAway: market.teamAway,
        eventDate: new Date(market.eventDate), externalApiId: market.eventId, marketAddress: market.marketAddress,
        status: market.status, result: market.result, totalPool: market.totalPool, poolHome: market.poolHome,
        poolDraw: market.poolDraw, poolAway: market.poolAway, totalBettors: market.totalBettors, details: market.details,
      },
    });
  }

  // 2. Add some "upcoming" matches
  const upcomingMatches = [
    {
      sport: 'Football', league: 'Premier League', teamHome: 'Manchester Utd', teamAway: 'Arsenal',
      eventDate: '2026-07-25T17:30:00Z', status: 'upcoming', details: detailsData[1]
    },
    {
      sport: 'Football', league: 'La Liga', teamHome: 'Barcelona', teamAway: 'Atletico Madrid',
      eventDate: '2026-07-26T21:00:00Z', status: 'upcoming', details: detailsData[2]
    },
  ];

  for (const match of upcomingMatches) {
    await prisma.event.create({
      data: {
        sport: match.sport, league: match.league, teamHome: match.teamHome, teamAway: match.teamAway,
        eventDate: new Date(match.eventDate), status: match.status, details: match.details,
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
