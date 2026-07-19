// Единая точка доступа к Prisma-клиенту для backend.
// Клиент генерируется в ./generated/client (см. schema.prisma) командой `prisma generate`.
import { PrismaClient } from './generated/client/index.js';

// Singleton, чтобы в dev-режиме (hot-reload) не плодить подключения.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export * from './generated/client/index.js';
