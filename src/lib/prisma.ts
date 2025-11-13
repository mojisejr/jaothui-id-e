import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client Singleton
 * 
 * This ensures a single instance of PrismaClient is used throughout the application,
 * preventing connection pool exhaustion during development hot-reloading.
 * 
 * In production, a new instance is created for each deployment.
 * In development, the instance is cached globally to survive hot-reloads.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
