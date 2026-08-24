import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { rateLimitPolicies, resetRateLimitsForTests } from "./rateLimit";

const originalLimits = Object.fromEntries(Object.entries(rateLimitPolicies).map(([name, policy]) => [name, { ...policy }]));

function context(role: "user" | "admin" = "user"): TrpcContext {
  return {
    user: {
      id: role === "admin" ? 92 : 91,
      openId: `rate-limit-${role}`,
      email: `${role}@example.com`,
      name: `Rate limit ${role}`,
      loginMethod: "test",
      role,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", ip: "127.0.0.1", headers: {}, socket: {} } as TrpcContext["req"],
    res: { setHeader: () => undefined } as TrpcContext["res"],
  };
}

function publicContext(): TrpcContext {
  return { user: null, req: { protocol: "https", ip: "127.0.0.2", headers: {}, socket: {} } as TrpcContext["req"], res: { setHeader: () => undefined } as TrpcContext["res"] };
}

function setOneRequestLimit(name: keyof typeof rateLimitPolicies) {
  rateLimitPolicies[name].limit = 1;
  rateLimitPolicies[name].windowMs = 60_000;
}

beforeEach(() => resetRateLimitsForTests());
afterEach(() => {
  for (const [name, policy] of Object.entries(originalLimits)) Object.assign(rateLimitPolicies[name as keyof typeof rateLimitPolicies], policy);
  resetRateLimitsForTests();
});

describe("rate-limited archive procedures", () => {
  it("limits public discovery by anonymous request identity", async () => {
    setOneRequestLimit("publicRead");
    const caller = appRouter.createCaller(publicContext());
    await caller.archive.list({ limit: 1 });
    await expect(caller.archive.list({ limit: 1 })).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
  });

  it("limits contributor draft creation, AI processing, and review submission", async () => {
    const contributor = appRouter.createCaller(context());
    setOneRequestLimit("draftCreation");
    await contributor.archive.createDraft({ title: "First rate limited draft", category: "Traditional craft", language: "Hindi", region: "Bihar", practitionerName: "Test holder", district: "Patna", contributorNote: "A private source note with enough factual context for review.", consentConfirmed: true });
    await expect(contributor.archive.createDraft({ title: "Second rate limited draft", category: "Traditional craft", language: "Hindi", region: "Bihar", practitionerName: "Test holder", district: "Patna", contributorNote: "A second private source note with enough factual context for review.", consentConfirmed: true })).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });

    rateLimitPolicies.draftCreation.limit = 10;
    const draft = await contributor.archive.createDraft({ title: "Process rate limited draft", category: "Traditional craft", language: "Hindi", region: "Bihar", practitionerName: "Test holder", district: "Patna", contributorNote: "A third private source note with enough factual context for review.", consentConfirmed: true });
    setOneRequestLimit("aiProcessing");
    await contributor.archive.processDraft({ slug: draft.draft.slug, useDemoFallback: true });
    await expect(contributor.archive.processDraft({ slug: draft.draft.slug, useDemoFallback: true })).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });

    setOneRequestLimit("reviewSubmission");
    await contributor.archive.submitForReview({ slug: draft.draft.slug, note: "Please inspect the source notes and edited wording before publication." });
    await expect(contributor.archive.submitForReview({ slug: draft.draft.slug, note: "Please inspect the source notes and edited wording before publication." })).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
  });

  it("limits repeated reviewer decisions", async () => {
    const contributor = appRouter.createCaller(context());
    const reviewer = appRouter.createCaller(context("admin"));
    const draft = await contributor.archive.createDraft({ title: "Reviewer rate limit draft", category: "Traditional weaving", language: "Hindi", region: "Uttar Pradesh", practitionerName: "Test holder", district: "Varanasi", contributorNote: "A private source note prepared for the reviewer rate-limit test.", consentConfirmed: true });
    setOneRequestLimit("reviewerDecision");
    await reviewer.archive.reviewDecision({ slug: draft.draft.slug, decision: "changes_requested", comment: "Please confirm the source wording before an approval decision." });
    await expect(reviewer.archive.reviewDecision({ slug: draft.draft.slug, decision: "changes_requested", comment: "Please confirm the source wording before an approval decision." })).rejects.toMatchObject({ code: "TOO_MANY_REQUESTS" });
  });
});
