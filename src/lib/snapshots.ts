import { prisma } from "@/lib/prisma";

// Truncate to UTC midnight so a "date" in the DB is one row per calendar day.
export function startOfUtcDay(d: Date = new Date()): Date {
  const out = new Date(d);
  out.setUTCHours(0, 0, 0, 0);
  return out;
}

// Upsert today's snapshot. Multiple calls the same day overwrite with the
// latest computed value — cron at end of day gets the last word.
export async function upsertDailySnapshot(
  userId: string,
  totalValuePLN: number,
  totalCostPLN: number
): Promise<void> {
  const date = startOfUtcDay();
  await prisma.portfolioSnapshot.upsert({
    where: { userId_date: { userId, date } },
    create: { userId, date, totalValuePLN, totalCostPLN },
    update: { totalValuePLN, totalCostPLN },
  });
}

export async function getSnapshotsForUser(userId: string) {
  return prisma.portfolioSnapshot.findMany({
    where: { userId },
    orderBy: { date: "asc" },
    select: { date: true, totalValuePLN: true, totalCostPLN: true },
  });
}
