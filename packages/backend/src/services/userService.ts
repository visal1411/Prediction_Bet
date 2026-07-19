import prisma from '../config/database';
import { UserProfile, LeaderboardEntry } from '../types';
import { createError } from '../middleware/errorHandler';

function dbUserToProfile(user: {
  walletAddress: string;
  username: string | null;
  avatarUrl: string | null;
  totalBets: number;
  totalWon: number;
  totalStaked: number;
  totalProfit: number;
  joinedAt: Date;
}): UserProfile {
  return {
    walletAddress: user.walletAddress,
    username: user.username,
    avatarUrl: user.avatarUrl,
    totalBets: user.totalBets,
    totalWon: user.totalWon,
    totalStaked: user.totalStaked,
    totalProfit: user.totalProfit,
    joinedAt: user.joinedAt.toISOString(),
  };
}

export async function getOrCreateUser(walletAddress: string): Promise<UserProfile> {
  const user = await prisma.user.upsert({
    where: { walletAddress: walletAddress.toLowerCase() },
    update: {},
    create: { walletAddress: walletAddress.toLowerCase() },
  });
  return dbUserToProfile(user);
}

export async function getUserProfile(walletAddress: string): Promise<UserProfile> {
  const user = await prisma.user.findUnique({
    where: { walletAddress: walletAddress.toLowerCase() },
  });
  if (!user) throw createError('User not found', 404);
  return dbUserToProfile(user);
}

export async function updateUserProfile(
  walletAddress: string,
  data: { username?: string; avatarUrl?: string }
): Promise<UserProfile> {
  const user = await prisma.user.upsert({
    where: { walletAddress: walletAddress.toLowerCase() },
    update: {
      ...(data.username !== undefined && { username: data.username }),
      ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
    },
    create: {
      walletAddress: walletAddress.toLowerCase(),
      username: data.username,
      avatarUrl: data.avatarUrl,
    },
  });
  return dbUserToProfile(user);
}

export async function getLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  const users = await prisma.user.findMany({
    orderBy: { totalWon: 'desc' },
    take: limit,
    where: { totalBets: { gt: 0 } },
  });

  return users.map((u, index) => ({
    rank: index + 1,
    walletAddress: u.walletAddress,
    username: u.username,
    totalWon: u.totalWon,
    totalBets: u.totalBets,
    totalProfit: u.totalProfit,
  }));
}
