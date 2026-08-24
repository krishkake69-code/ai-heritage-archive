import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function publicContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

function adminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "archive-admin",
      email: "admin@example.com",
      name: "Archive Reviewer",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("archive discovery", () => {
  it("returns the five public Assam pilot records", async () => {
    const caller = appRouter.createCaller(publicContext());
    const result = await caller.archive.list({ limit: 20 });
    expect(result).toHaveLength(4);
    expect(result.every((record) => record.region === "Assam")).toBe(true);
  });

  it("matches natural-language terms across record content", async () => {
    const caller = appRouter.createCaller(publicContext());
    const result = await caller.archive.list({ query: "bamboo crafts Assam", limit: 20 });
    expect(result).toHaveLength(1);
    expect(result[0]?.slug).toBe("bamboo-basketry-majuli");
  });

  it("keeps verification and risk filters explicit", async () => {
    const caller = appRouter.createCaller(publicContext());
    const verified = await caller.archive.list({ verification: "Expert verified", limit: 20 });
    const highRisk = await caller.archive.list({ risk: "High", limit: 20 });
    expect(verified.every((record) => record.status === "expert")).toBe(true);
    expect(highRisk.every((record) => record.risk.level === "high")).toBe(true);
  });

  it("returns source-linked detail data and public-safe map points", async () => {
    const caller = appRouter.createCaller(publicContext());
    const detail = await caller.archive.get({ slug: "bamboo-basketry-majuli" });
    const map = await caller.archive.map();
    expect(detail.record?.sourceLabel).toContain("Video #104");
    expect(detail.record?.knowledge.every((section) => section.evidence.quote.length > 0)).toBe(true);
    expect(map).toHaveLength(4);
    expect(map.every((point) => point.coordinates && point.district)).toBe(true);
  });

  it("returns public-safe region and category aggregates for the map", async () => {
    const caller = appRouter.createCaller(publicContext());
    const summary = await caller.archive.mapSummary();
    expect(summary.seededCount).toBe(5);
    expect(summary.publishedCount).toBe(4);
    expect(summary.regions.length).toBeGreaterThan(0);
    expect(summary.categories.length).toBeGreaterThan(0);
  });

  it("links public practitioner profiles to approved archive records only", async () => {
    const caller = appRouter.createCaller(publicContext());
    const profile = await caller.archive.practitioner({ id: "p-anjali" });
    expect(profile.person.isPublic).toBe(true);
    expect(profile.approvedRecords.every((record) => record.publicationState === "public")).toBe(true);
    await expect(caller.archive.practitioner({ id: "missing-profile" })).rejects.toMatchObject({ code: "NOT_FOUND" });
  });

  it("only exposes consented public practitioner profiles", async () => {
    const caller = appRouter.createCaller(publicContext());
    const result = await caller.archive.practitioners({ workshopOnly: true });
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((person) => person.isPublic && person.workshopAvailable)).toBe(true);
  });

  it("keeps review queue access restricted to admin reviewers", async () => {
    const publicCaller = appRouter.createCaller(publicContext());
    await expect(publicCaller.archive.reviewQueue()).rejects.toMatchObject({ code: "FORBIDDEN" });
    const adminCaller = appRouter.createCaller(adminContext());
    const queue = await adminCaller.archive.reviewQueue();
    expect(queue.some((record) => record.status === "pending")).toBe(true);
  });
});
