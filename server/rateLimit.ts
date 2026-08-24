import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { rateLimitCounters } from "../drizzle/schema";
import { getDb } from "./db";

export type RateLimitPolicy = {
  limit: number;
  windowMs: number;
};

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

export const rateLimitPolicies = {
  publicRead: { limit: 120, windowMs: 60_000 },
  draftCreation: { limit: 10, windowMs: 60 * 60_000 },
  draftUpdate: { limit: 30, windowMs: 60 * 60_000 },
  mediaUpload: { limit: 6, windowMs: 60 * 60_000 },
  aiProcessing: { limit: 6, windowMs: 60 * 60_000 },
  reviewSubmission: { limit: 12, windowMs: 60 * 60_000 },
  reviewerDecision: { limit: 30, windowMs: 60 * 60_000 },
} satisfies Record<string, RateLimitPolicy>;

const memoryCounters = new Map<string, { count: number; expiresAt: number }>();
let lastExpiryCleanup = 0;

function hashIdentifier(identifier: string) {
  return createHash("sha256").update(identifier).digest("hex");
}

function getWindow(now: number, windowMs: number) {
  const startedAt = Math.floor(now / windowMs) * windowMs;
  return { startedAt, expiresAt: startedAt + windowMs };
}

function fromMemory(bucketKey: string, policy: RateLimitPolicy, now: number): RateLimitResult {
  const { expiresAt } = getWindow(now, policy.windowMs);
  const current = memoryCounters.get(bucketKey);
  const entry = !current || current.expiresAt <= now ? { count: 0, expiresAt } : current;
  entry.count += 1;
  memoryCounters.set(bucketKey, entry);
  return { allowed: entry.count <= policy.limit, remaining: Math.max(0, policy.limit - entry.count), resetAt: entry.expiresAt };
}

/**
 * Enforces a fixed-window limit. Database storage makes counters visible across
 * autoscaled instances; a short-lived memory fallback preserves availability if
 * the database is temporarily unavailable. Identifiers are hashed before they
 * leave process memory.
 */
export async function enforceRateLimit(scope: string, identifier: string, policy: RateLimitPolicy, now = Date.now()): Promise<RateLimitResult> {
  const identifierHash = hashIdentifier(identifier);
  const { startedAt, expiresAt } = getWindow(now, policy.windowMs);
  const bucketKey = `${scope}:${identifierHash}:${startedAt}`;
  if (process.env.VITEST) return fromMemory(bucketKey, policy, now);
  const db = await getDb();

  if (!db) return fromMemory(bucketKey, policy, now);

  try {
    await db.insert(rateLimitCounters).values({
      bucketKey,
      scope,
      identifierHash,
      windowStartedAt: new Date(startedAt),
      expiresAt: new Date(expiresAt),
      count: 1,
    }).onDuplicateKeyUpdate({ set: { count: sql`${rateLimitCounters.count} + 1` } });

    const result = await db.select({ count: rateLimitCounters.count, expiresAt: rateLimitCounters.expiresAt })
      .from(rateLimitCounters)
      .where(sql`${rateLimitCounters.bucketKey} = ${bucketKey}`)
      .limit(1);
    const entry = result[0];
    const count = entry?.count ?? 1;

    if (now - lastExpiryCleanup > 30 * 60_000) {
      lastExpiryCleanup = now;
      void db.delete(rateLimitCounters).where(sql`${rateLimitCounters.expiresAt} < ${new Date(now)}`).catch(() => undefined);
    }

    return { allowed: count <= policy.limit, remaining: Math.max(0, policy.limit - count), resetAt: entry?.expiresAt?.getTime() ?? expiresAt };
  } catch (error) {
    console.warn("[RateLimit] Durable counter unavailable; using process fallback.", error);
    return fromMemory(bucketKey, policy, now);
  }
}

export function resetRateLimitsForTests() {
  memoryCounters.clear();
  lastExpiryCleanup = 0;
}
