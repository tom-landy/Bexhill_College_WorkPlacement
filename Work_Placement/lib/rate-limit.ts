import { prisma } from "@/lib/prisma";

const WINDOW_FAILS = 5;
const COOLDOWN_MINUTES = 15;

type RateLimitResult = {
  blocked: boolean;
  remaining: number;
  cooldownUntil?: Date;
};

export async function checkAndRecordFailure(key: string): Promise<RateLimitResult> {
  const now = new Date();
  const existing = await prisma.authRateLimit.upsert({
    where: { key },
    update: {},
    create: { key }
  });

  if (existing.cooldownUntil && existing.cooldownUntil > now) {
    return { blocked: true, remaining: 0, cooldownUntil: existing.cooldownUntil };
  }

  const nextFailCount = existing.failCount + 1;
  const cooldownUntil =
    nextFailCount >= WINDOW_FAILS ? new Date(now.getTime() + COOLDOWN_MINUTES * 60 * 1000) : null;

  await prisma.authRateLimit.update({
    where: { key },
    data: { failCount: nextFailCount, cooldownUntil, lastFailureAt: now }
  });

  return {
    blocked: Boolean(cooldownUntil),
    remaining: Math.max(0, WINDOW_FAILS - nextFailCount),
    cooldownUntil: cooldownUntil ?? undefined
  };
}

export async function clearFailures(key: string): Promise<void> {
  await prisma.authRateLimit.upsert({
    where: { key },
    update: { failCount: 0, cooldownUntil: null, lastFailureAt: null },
    create: { key, failCount: 0 }
  });
}

export async function assertNotCoolingDown(key: string): Promise<void> {
  const existing = await prisma.authRateLimit.findUnique({ where: { key } });
  if (existing?.cooldownUntil && existing.cooldownUntil > new Date()) {
    throw new Error(`Too many attempts. Try again after ${existing.cooldownUntil.toISOString()}`);
  }
}
