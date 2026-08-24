import { beforeEach, describe, expect, it } from "vitest";
import { enforceRateLimit, resetRateLimitsForTests } from "./rateLimit";

describe("rate limiting", () => {
  beforeEach(() => resetRateLimitsForTests());

  it("blocks requests over a fixed-window limit and reports the reset boundary", async () => {
    const policy = { limit: 2, windowMs: 60_000 };
    const now = Date.now();
    const scope = `test-window-${now}`;

    const first = await enforceRateLimit(scope, "user:test", policy, now);
    const second = await enforceRateLimit(scope, "user:test", policy, now + 1);
    const third = await enforceRateLimit(scope, "user:test", policy, now + 2);

    expect(first).toMatchObject({ allowed: true, remaining: 1 });
    expect(second).toMatchObject({ allowed: true, remaining: 0 });
    expect(third).toMatchObject({ allowed: false, remaining: 0 });
    expect(third.resetAt).toBeGreaterThan(now);
  });

  it("opens a new counter when the policy window advances", async () => {
    const policy = { limit: 1, windowMs: 60_000 };
    const now = Date.now();
    const scope = `test-reset-${now}`;

    await enforceRateLimit(scope, "ip:127.0.0.1", policy, now);
    const nextWindow = await enforceRateLimit(scope, "ip:127.0.0.1", policy, now + 60_000);

    expect(nextWindow).toMatchObject({ allowed: true, remaining: 0 });
  });
});
