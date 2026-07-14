import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "./generated/prisma/client";

// Re-export everything generated (enums, the `Prisma` namespace, model
// types) so both apps import model/enum types from "@rs/db" instead of
// reaching into the generated output directly.
export * from "./generated/prisma/client";

export function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Both apps/web and apps/admin import this singleton from @rs/db - each app
// process gets its own module-level singleton (no cross-process sharing),
// which is exactly what Next.js dev-mode hot-reload needs to avoid opening a
// new pool on every edit.
export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
