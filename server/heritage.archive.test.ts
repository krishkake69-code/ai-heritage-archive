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
  it("returns publicly discoverable national coverage and filters it by State or region", async () => {
    const caller = appRouter.createCaller(publicContext());
    const result = await caller.archive.list({ limit: 50 });
    const gujarat = await caller.archive.list({ region: "Gujarat", limit: 20 });
    expect(result).toHaveLength(33);
    expect(new Set(result.map((record) => record.region))).toHaveLength(30);
    expect(gujarat).toHaveLength(1);
    expect(gujarat[0]?.region).toBe("Gujarat");
  });

  it("returns the full State or region filter set and consented-directory filter options", async () => {
    const caller = appRouter.createCaller(publicContext());
    const filters = await caller.archive.filters();
    const directoryFilters = await caller.archive.directoryFilters();
    expect(filters.statesAndRegions).toHaveLength(31);
    expect(filters.statesAndRegions).toEqual(expect.arrayContaining(["Andhra Pradesh", "Assam", "Tamil Nadu", "Ladakh", "Jammu & Kashmir"]));
    expect(directoryFilters.statesAndRegions).toEqual(filters.statesAndRegions);
    expect(directoryFilters.crafts).toEqual(expect.arrayContaining(["All crafts", "Bamboo craft", "Hand weaving", "Folk music"]));
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
    expect(map).toHaveLength(33);
    expect(map.every((point) => point.coordinates && point.district && point.region)).toBe(true);
  });

  it("returns public-safe region and category aggregates for the map", async () => {
    const caller = appRouter.createCaller(publicContext());
    const summary = await caller.archive.mapSummary();
    expect(summary.seededCount).toBe(34);
    expect(summary.publishedCount).toBe(33);
    expect(summary.regions).toHaveLength(30);
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
