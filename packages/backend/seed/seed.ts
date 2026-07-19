import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with mock data...');

  // Clean existing data
  await prisma.bet.deleteMany();
  await prisma.marketOption.deleteMany();
  await prisma.bettingMarket.deleteMany();
  await prisma.eventStats.deleteMany();
  await prisma.teamDetail.deleteMany();
  await prisma.event.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  const user1 = await prisma.user.create({
    data: {
      walletAddress: '0x1234567890123456789012345678901234567890',
      username: 'AliceBet',
      totalBets: 2,
      totalWon: 1,
      totalStaked: 150,
      totalProfit: 41,
    }
  });

  // Create Event 1: Manchester Utd vs Arsenal
  const event1 = await prisma.event.create({
    data: {
      sport: 'Football',
      league: 'Premier League',
      teamHome: 'Manchester Utd',
      teamAway: 'Arsenal',
      eventDate: new Date('2026-07-20T20:00:00Z'), // Today from the mock
      venue: 'Old Trafford, Manchester',
      status: 'UPCOMING',
      teamHomeDetail: {
        create: {
          side: 'HOME',
          name: 'Manchester United',
          shortName: 'MUN',
          league: 'Premier League',
          manager: 'Ruben Amorim',
          color: '#dc2626',
          form: JSON.stringify(['W', 'W', 'D', 'L', 'W']),
          keyPlayerName: 'Bruno Fernandes',
          keyPlayerRole: 'CAPTAIN',
          keyPlayerGoals: 12,
          keyPlayerAssists: 8,
          keyPlayerXp: 9.2,
        }
      },
      teamAwayDetail: {
        create: {
          side: 'AWAY',
          name: 'Arsenal',
          shortName: 'ARS',
          league: 'Premier League',
          manager: 'Mikel Arteta',
          color: '#ef4444',
          form: JSON.stringify(['W', 'W', 'W', 'D', 'W']),
          keyPlayerName: 'Bukayo Saka',
          keyPlayerRole: 'STAR',
          keyPlayerGoals: 15,
          keyPlayerAssists: 11,
          keyPlayerXp: 9.5,
        }
      },
      stats: {
        create: {
          possessionHome: 48,
          possessionAway: 52,
          shotsOnTargetHome: '14 (6)',
          shotsOnTargetAway: '16 (8)',
          cornersHome: 5,
          cornersAway: 7,
          winsHome: 45,
          winsDraw: 32,
          winsAway: 38,
        }
      },
      markets: {
        create: [
          {
            title: 'Full Time Result',
            sortOrder: 0,
            options: {
              create: [
                { label: 'MUN', odds: 2.45, outcome: 0 },
                { label: 'DRAW', odds: 3.40, outcome: 2 },
                { label: 'ARS', odds: 2.80, outcome: 1 },
              ]
            }
          },
          {
            title: 'First Goal Scorer',
            sortOrder: 1,
            options: {
              create: [
                { label: 'Bukayo Saka', odds: 5.50, outcome: 0 },
                { label: 'Bruno Fernandes', odds: 7.00, outcome: 1 },
                { label: 'Marcus Rashford', odds: 7.50, outcome: 2 },
              ]
            }
          }
        ]
      }
    },
    include: { markets: { include: { options: true } } }
  });

  // Create Event 2: Lakers vs Warriors (Live)
  const event2 = await prisma.event.create({
    data: {
      sport: 'Basketball',
      league: 'NBA Regular Season',
      teamHome: 'Lakers',
      teamAway: 'Warriors',
      scoreHome: '102',
      scoreAway: '98',
      eventDate: new Date('2026-07-20T20:30:00Z'),
      venue: 'Crypto.com Arena, Los Angeles',
      status: 'LIVE',
      isLive: true,
      teamHomeDetail: {
        create: {
          side: 'HOME',
          name: 'Los Angeles Lakers',
          shortName: 'LAL',
          league: 'NBA',
          manager: 'JJ Redick',
          color: '#7c3aed',
          form: JSON.stringify(['W', 'W', 'L', 'W', 'W']),
          keyPlayerName: 'LeBron James',
          keyPlayerRole: 'CAPTAIN',
          keyPlayerGoals: 28,
          keyPlayerAssists: 9,
          keyPlayerXp: 9.8,
        }
      },
      teamAwayDetail: {
        create: {
          side: 'AWAY',
          name: 'Golden State Warriors',
          shortName: 'GSW',
          league: 'NBA',
          manager: 'Steve Kerr',
          color: '#d97706',
          form: JSON.stringify(['W', 'D', 'W', 'W', 'L']),
          keyPlayerName: 'Stephen Curry',
          keyPlayerRole: 'STAR',
          keyPlayerGoals: 32,
          keyPlayerAssists: 7,
          keyPlayerXp: 9.6,
        }
      },
      markets: {
        create: [
          {
            title: 'Match Winner',
            sortOrder: 0,
            options: {
              create: [
                { label: 'LAL', odds: 1.91, outcome: 0 },
                { label: 'GSW', odds: 1.91, outcome: 1 },
              ]
            }
          }
        ]
      }
    },
    include: { markets: { include: { options: true } } }
  });

  // Create Mock Bets
  const munOption = event1.markets.find(m => m.title === 'Full Time Result')?.options.find(o => o.label === 'MUN');
  if (munOption) {
    await prisma.bet.create({
      data: {
        eventId: event1.id,
        marketOptionId: munOption.id,
        walletAddress: user1.walletAddress,
        stake: 50.00,
        odds: munOption.odds,
        potentialPayout: 50.00 * munOption.odds,
        status: 'ACTIVE',
        placedAt: new Date('2026-07-18T14:30:00Z'),
      }
    });
  }

  const lalOption = event2.markets.find(m => m.title === 'Match Winner')?.options.find(o => o.label === 'LAL');
  if (lalOption) {
    await prisma.bet.create({
      data: {
        eventId: event2.id,
        marketOptionId: lalOption.id,
        walletAddress: user1.walletAddress,
        stake: 100.00,
        odds: lalOption.odds,
        potentialPayout: 100.00 * lalOption.odds,
        status: 'WON',
        placedAt: new Date('2026-07-17T18:00:00Z'),
      }
    });
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
