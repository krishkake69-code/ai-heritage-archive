import { describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import { runLiveHeritagePipeline, extractionSchema } from "./heritageAi";
import { MAX_UPLOAD_BYTES, mediaKindFromMime, validateMediaUpload } from "./media";
import { notifyOwner } from "./_core/notification";
import { practitioners, records } from "@shared/heritage";
import type { TrpcContext } from "./_core/context";

vi.mock("./_core/notification", () => ({ notifyOwner: vi.fn().mockResolvedValue(true) }));
vi.mock("./storage", () => ({ storagePut: vi.fn().mockResolvedValue({ key: "heritage/demo/source.mp3", url: "/manus-storage/heritage/demo/source.mp3" }), storageGetSignedUrl: vi.fn().mockResolvedValue("https://storage.example/source.mp3"), storageGet: vi.fn() }));

function context(role: "user" | "admin" = "user"): TrpcContext {
  return {
    user: { id: role === "admin" ? 1 : 2, openId: `${role}-workflow`, email: `${role}@example.com`, name: role === "admin" ? "Archive Reviewer" : "Contributor", loginMethod: "manus", role, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("heritage workflow contracts", () => {
  it("validates supported source media and rejects oversized or unsafe uploads", () => {
    expect(mediaKindFromMime("audio/mpeg")).toBe("audio");
    expect(mediaKindFromMime("image/jpeg")).toBe("photo");
    expect(validateMediaUpload({ mimeType: "audio/mpeg", byteLength: 128 })).toBe("audio");
    expect(() => validateMediaUpload({ mimeType: "application/zip", byteLength: 128 })).toThrow("Unsupported media type");
    expect(() => validateMediaUpload({ mimeType: "audio/mpeg", byteLength: MAX_UPLOAD_BYTES + 1 })).toThrow("16 MB");
  });

  it("uploads a consented source through the storage boundary", async () => {
    const caller = appRouter.createCaller(context());
    const created = await caller.archive.createDraft({ title: "A source audio note", category: "Traditional craft", language: "Assamese", practitionerName: "Demo holder", district: "Majuli", contributorNote: "A source file with explicit permission for private processing.", consentConfirmed: true });
    const uploaded = await caller.archive.uploadMedia({ slug: created.draft.slug, fileName: "source.mp3", mimeType: "audio/mpeg", dataBase64: "c2FtcGxlLWF1ZGlv" });
    expect(uploaded.kind).toBe("audio");
    expect(uploaded.draft.sourceLabel).toContain("source.mp3");
    expect(uploaded.draft.media[0]?.url).toContain("manus-storage");
  });

  it("keeps a strict structured extraction contract and fails safely without live audio", async () => {
    expect(extractionSchema.required).toContain("uncertaintyNotes");
    const photoOnlyRecord = { ...records[0], media: [{ type: "photo" as const, label: "Consent-safe still", url: "/manus-storage/still.jpg" }] };
    await expect(runLiveHeritagePipeline(photoOnlyRecord)).rejects.toThrow("audio or video source");
  });

  it("creates, processes, edits, submits, and notifies without publishing early", async () => {
    const caller = appRouter.createCaller(context());
    const created = await caller.archive.createDraft({ title: "A consented regional song", category: "Folk music", language: "Tamil", region: "Tamil Nadu", practitionerName: "Demo knowledge holder", district: "Chennai", contributorNote: "A private demonstration submitted for careful community review.", consentConfirmed: true });
    expect(created.draft.publicationState).toBe("preview");
    expect(created.draft.region).toBe("Tamil Nadu");
    const processed = await caller.archive.processDraft({ slug: created.draft.slug, useDemoFallback: true });
    const summary = processed.draft?.knowledge.find((section) => section.kind === "summary");
    const edited = await caller.archive.updateDraft({ slug: created.draft.slug, summary: String(summary?.content ?? "A source-linked song record for review."), significance: "The contributor has asked reviewers to preserve the setting and language context." });
    expect(edited.knowledge.some((section) => section.status === "Human edited")).toBe(true);
    const submitted = await caller.archive.submitForReview({ slug: created.draft.slug, note: "Please compare the translation with the original recording before publication." });
    expect(submitted.record.status).toBe("pending");
    expect(submitted.record.publicationState).toBe("preview");
    expect(submitted.notified).toBe(true);
    expect(vi.mocked(notifyOwner)).toHaveBeenCalled();
  });

  it("publishes only after an attributable admin review decision", async () => {
    const contributor = appRouter.createCaller(context());
    const reviewer = appRouter.createCaller(context("admin"));
    const created = await contributor.archive.createDraft({ title: "A reviewable weaving note", category: "Traditional weaving", language: "Assamese", practitionerName: "Demo weaver", district: "Sivasagar", contributorNote: "A private weaving note with a source cue for reviewers.", consentConfirmed: true });
    await contributor.archive.processDraft({ slug: created.draft.slug, useDemoFallback: true });
    await contributor.archive.submitForReview({ slug: created.draft.slug, note: "Please confirm the materials list against the attached source." });
    const decision = await reviewer.archive.reviewDecision({ slug: created.draft.slug, decision: "expert", comment: "The source cue and structured fields are consistent for the pilot." });
    expect(decision.record.status).toBe("expert");
    expect(decision.record.publicationState).toBe("public");
    const publicRecord = await reviewer.archive.get({ slug: created.draft.slug });
    expect(publicRecord.record?.publicationState).toBe("public");
  });

  it("covers every requested State or region while keeping orientation cards distinct from primary evidence", () => {
    const requestedCoverage = ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Ladakh", "Jammu & Kashmir"];
    const coveredRegions = new Set(records.map((record) => record.region));
    const sourceLinkedAssamRecords = records.filter((record) => record.region === "Assam");
    const orientationRecords = records.filter((record) => Boolean(record.referenceUrl));
    expect(requestedCoverage.every((region) => coveredRegions.has(region))).toBe(true);
    expect(sourceLinkedAssamRecords).toHaveLength(5);
    expect(sourceLinkedAssamRecords.every((record) => record.knowledge.every((section) => section.evidence.quote.length > 0 && section.evidence.timecode.length > 0))).toBe(true);
    expect(orientationRecords).toHaveLength(29);
    expect(orientationRecords.every((record) => record.status === "pending" && record.risk.level === "unassessed" && record.referenceUrl)).toBe(true);
    expect(practitioners.every((person) => !person.isPublic || person.archiveCount >= 0)).toBe(true);
  });
});
