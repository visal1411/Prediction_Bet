import { PrismaClient } from '@prisma/client';
import { env } from './env';

// Singleton Prisma client with logging in dev mode
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.isDev() ? ['query', 'error', 'warn'] : ['error'],
  });

if (env.isDev()) {
  globalForPrisma.prisma = prisma;
}

export default prisma;
