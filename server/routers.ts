import { TRPCError } from "@trpc/server";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { notifyOwner } from "./_core/notification";
import { runLiveHeritagePipeline } from "./heritageAi";
import { validateMediaUpload } from "./media";
import { storagePut } from "./storage";
import { getDb } from "./db";
import { searchDocuments } from "../drizzle/schema";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  categories,
  getRecord,
  languages,
  matchesRecord,
  practitioners,
  records as seedRecords,
  riskLevels,
  statusLabel,
  verificationLevels,
  type HeritageRecord,
  type HeritageStatus,
} from "@shared/heritage";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";

const drafts = new Map<string, HeritageRecord>();
const reviewEvents = new Map<string, Array<{ id: string; decision: string; comment: string; reviewer: string; createdAt: string }>>();

function allRecords() {
  return [...seedRecords, ...Array.from(drafts.values())];
}

function toPublic(record: HeritageRecord) {
  if (record.publicationState !== "public") return null;
  return record;
}

function findRecord(slug: string) {
  return drafts.get(slug) ?? getRecord(slug);
}

function normalizeStatus(input: string | undefined): HeritageStatus | undefined {
  if (!input || input === "All verification") return undefined;
  if (input === "Community verified") return "community";
  if (input === "Expert verified") return "expert";
  return "pending";
}

function normalizeRisk(input: string | undefined) {
  if (!input || input === "All risk levels") return undefined;
  return input.toLowerCase() as HeritageRecord["risk"]["level"];
}

function searchableText(record: HeritageRecord) {
  return [record.title, record.shortDescription, record.category, record.region, record.district, record.originalLanguage, record.practitionerName, record.festival, record.transcript.original, record.transcript.translation, ...record.relationships.map((relationship) => `${relationship.label} ${relationship.detail}`), ...record.knowledge.flatMap((section) => Array.isArray(section.content) ? section.content : [section.content])].filter(Boolean).join(" ");
}

async function syncPublicationIndex() {
  const db = await getDb();
  if (!db) return null;
  const publicRecords = allRecords().filter((record) => record.publicationState === "public");
  const publicIds = new Set(publicRecords.map((record) => record.id));
  if (publicRecords.length) {
    await db.insert(searchDocuments).values(publicRecords.map((record) => ({ recordId: record.id, searchableText: searchableText(record), indexingStatus: "indexed" as const }))).onDuplicateKeyUpdate({ set: { searchableText: sql`VALUES(searchableText)`, indexingStatus: "indexed" } });
  }
  const existing = await db.select({ recordId: searchDocuments.recordId }).from(searchDocuments).where(eq(searchDocuments.indexingStatus, "indexed"));
  for (const document of existing) {
    if (!publicIds.has(document.recordId)) await db.update(searchDocuments).set({ indexingStatus: "excluded" }).where(eq(searchDocuments.recordId, document.recordId));
  }
  return new Set(publicRecords.map((record) => record.id));
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  archive: router({
    filters: publicProcedure.query(() => ({ categories, languages, riskLevels, verificationLevels })),
    summary: publicProcedure.query(() => ({
      records: seedRecords.filter((record) => record.publicationState === "public").length,
      traditions: new Set(seedRecords.map((record) => record.category)).size,
      practitioners: practitioners.filter((person) => person.isPublic).length,
      atRisk: seedRecords.filter((record) => ["high", "critical"].includes(record.risk.level)).length,
      regions: [{ label: "Assam", count: seedRecords.length, detail: "5 seeded living traditions" }],
    })),
    list: publicProcedure.input(z.object({
      query: z.string().optional(),
      category: z.string().optional(),
      language: z.string().optional(),
      risk: z.string().optional(),
      verification: z.string().optional(),
      limit: z.number().int().min(1).max(50).default(20),
    })).query(async ({ input }) => {
      const status = normalizeStatus(input.verification);
      const risk = normalizeRisk(input.risk);
      const indexedIds = await syncPublicationIndex();
      return allRecords().filter((record) => {
        if (record.publicationState !== "public") return false;
        if (indexedIds && !indexedIds.has(record.id)) return false;
        if (!matchesRecord(record, input.query ?? "")) return false;
        if (input.category && input.category !== "All categories" && record.category !== input.category) return false;
        if (input.language && input.language !== "All languages" && record.originalLanguage !== input.language) return false;
        if (risk && record.risk.level !== risk) return false;
        if (status && record.status !== status) return false;
        return true;
      }).slice(0, input.limit);
    }),
    get: publicProcedure.input(z.object({ slug: z.string() })).query(({ input }) => {
      const record = findRecord(input.slug);
      const visible = record && (record.publicationState === "public" || record.isDemo);
      if (!visible) throw new TRPCError({ code: "NOT_FOUND", message: "This record is not publicly available." });
      return { record, verification: reviewEvents.get(input.slug) ?? [] };
    }),
    map: publicProcedure.query(() => seedRecords.filter((record) => record.publicationState === "public").map((record) => ({
      id: record.id,
      slug: record.slug,
      title: record.title,
      category: record.category,
      district: record.district,
      coordinates: record.coordinates,
      risk: record.risk,
      status: statusLabel(record.status),
    }))),
    mapSummary: publicProcedure.query(() => {
      const publicRecords = seedRecords.filter((record) => record.publicationState === "public");
      const regions = Array.from(new Set(publicRecords.map((record) => record.district))).map((district) => ({ label: district, count: publicRecords.filter((record) => record.district === district).length, records: publicRecords.filter((record) => record.district === district).map((record) => record.title) }));
      const categories = Array.from(new Set(publicRecords.map((record) => record.category))).map((category) => ({ label: category, count: publicRecords.filter((record) => record.category === category).length }));
      return { regions, categories, publishedCount: publicRecords.length, seededCount: seedRecords.length };
    }),
    practitioners: publicProcedure.input(z.object({
      query: z.string().optional(),
      craft: z.string().optional(),
      verification: z.string().optional(),
      workshopOnly: z.boolean().default(false),
    })).query(({ input }) => practitioners.filter((person) => {
      if (!person.isPublic) return false;
      const query = input.query?.trim().toLowerCase();
      if (query && ![person.displayName, person.role, person.region, person.district, ...person.specialties].join(" ").toLowerCase().includes(query)) return false;
      if (input.craft && input.craft !== "All crafts" && !person.specialties.includes(input.craft)) return false;
      if (input.verification && input.verification !== "All verification" && statusLabel(person.verificationStatus) !== input.verification) return false;
      if (input.workshopOnly && !person.workshopAvailable) return false;
      return true;
    })),
    practitioner: publicProcedure.input(z.object({ id: z.string() })).query(({ input }) => {
      const person = practitioners.find((candidate) => candidate.id === input.id && candidate.isPublic);
      if (!person) throw new TRPCError({ code: "NOT_FOUND", message: "This practitioner profile is not publicly available." });
      const approvedRecords = seedRecords.filter((record) => record.practitionerId === person.id && record.publicationState === "public");
      return { person, approvedRecords };
    }),
    createDraft: protectedProcedure.input(z.object({
      title: z.string().min(3),
      category: z.string().min(2),
      language: z.string().min(2),
      practitionerName: z.string().min(2),
      district: z.string().min(2),
      contributorNote: z.string().min(10),
      consentConfirmed: z.literal(true),
    })).mutation(({ input, ctx }) => {
      const slug = `demo-${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}-${Date.now()}`;
      const template = seedRecords[0];
      const draft: HeritageRecord = {
        ...template,
        id: `draft-${Date.now()}`,
        slug,
        title: input.title,
        eyebrow: `${input.category} · Assam`,
        shortDescription: input.contributorNote,
        category: input.category,
        district: input.district,
        originalLanguage: input.language,
        practitionerName: input.practitionerName,
        status: "pending",
        publicationState: "preview",
        isDemo: true,
        sourceLabel: `Contributor sample recording · Submitted by ${ctx.user.name ?? "archive contributor"}`,
        knowledge: template.knowledge.map((section) => ({ ...section, status: "AI assisted" as const })),
        transcript: { ...template.transcript, language: input.language },
      };
      drafts.set(slug, draft);
      reviewEvents.set(slug, []);
      return { draft, next: "ready_to_process" as const };
    }),
    uploadMedia: protectedProcedure.input(z.object({ slug: z.string(), fileName: z.string().min(1).max(180), mimeType: z.string().min(3), dataBase64: z.string().min(8) })).mutation(async ({ input }) => {
      const draft = drafts.get(input.slug);
      if (!draft) throw new TRPCError({ code: "NOT_FOUND", message: "Draft not found." });
      const data = Buffer.from(input.dataBase64, "base64");
      const kind = validateMediaUpload({ mimeType: input.mimeType, byteLength: data.byteLength });
      const stored = await storagePut(`heritage/${draft.id}/${input.fileName}`, data, input.mimeType);
      const next = { ...draft, media: [{ type: kind, label: `Contributor source · ${input.fileName}`, url: stored.url }, ...draft.media], sourceLabel: `Contributor upload · ${input.fileName}` };
      drafts.set(input.slug, next);
      return { draft: next, media: stored, kind };
    }),
    processDraft: protectedProcedure.input(z.object({ slug: z.string(), useDemoFallback: z.boolean().default(true) })).mutation(async ({ input }) => {
      const draft = drafts.get(input.slug);
      if (!draft) throw new TRPCError({ code: "NOT_FOUND", message: "Draft not found." });
      const template = seedRecords[0];
      if (input.useDemoFallback) {
        const next = { ...draft, status: "pending" as const, knowledge: template.knowledge.map((section) => ({ ...section, status: "AI assisted" as const })) };
        drafts.set(input.slug, next);
        return { draft: next, processing: ["Transcript captured", "Translation prepared", "Knowledge fields structured", "Evidence links attached"], fallback: true };
      }
      const extraction = await runLiveHeritagePipeline(draft);
      const next = { ...draft, status: "pending" as const, transcript: { original: extraction.transcript, translation: extraction.translation, language: extraction.detectedLanguage }, knowledge: draft.knowledge.map((section) => {
        const content = section.kind === "summary" ? extraction.summary : section.kind === "procedure" ? extraction.procedure : section.kind === "materials" ? extraction.materials : section.kind === "tools" ? extraction.tools : section.kind === "significance" ? extraction.culturalSignificance : section.kind === "uncertainty" ? extraction.uncertaintyNotes : section.content;
        return { ...section, content, status: "AI assisted" as const };
      }) };
      drafts.set(input.slug, next);
      return { draft: next, processing: ["Transcript captured", "Translation prepared", "Knowledge fields structured", "Evidence links attached"], fallback: false };
    }),
    updateDraft: protectedProcedure.input(z.object({ slug: z.string(), summary: z.string().min(10), significance: z.string().min(10) })).mutation(({ input }) => {
      const draft = drafts.get(input.slug);
      if (!draft) throw new TRPCError({ code: "NOT_FOUND", message: "Draft not found." });
      const next = { ...draft, knowledge: draft.knowledge.map((section) => section.kind === "summary" ? { ...section, content: input.summary, status: "Human edited" as const } : section.kind === "significance" ? { ...section, content: input.significance, status: "Human edited" as const } : section) };
      drafts.set(input.slug, next);
      return next;
    }),
    submitForReview: protectedProcedure.input(z.object({ slug: z.string(), note: z.string().min(10) })).mutation(async ({ input, ctx }) => {
      const draft = drafts.get(input.slug);
      if (!draft) throw new TRPCError({ code: "NOT_FOUND", message: "Draft not found." });
      const next = { ...draft, status: "pending" as const };
      drafts.set(input.slug, next);
      const events = reviewEvents.get(input.slug) ?? [];
      events.push({ id: `event-${Date.now()}`, decision: "submitted", comment: input.note, reviewer: ctx.user.name ?? "Contributor", createdAt: new Date().toISOString() });
      reviewEvents.set(input.slug, events);
      const notified = await notifyOwner({ title: "Heritage record ready for review", content: `${draft.title} was submitted with source-linked fields. Contributor note: ${input.note}` });
      return { record: next, notified };
    }),
    reviewQueue: adminProcedure.query(() => allRecords().filter((record) => record.status === "pending" || record.status === "changes_requested")),
    reviewDecision: adminProcedure.input(z.object({ slug: z.string(), decision: z.enum(["community", "expert", "changes_requested"]), comment: z.string().min(10) })).mutation(async ({ input, ctx }) => {
      const record = drafts.get(input.slug) ?? getRecord(input.slug);
      if (!record) throw new TRPCError({ code: "NOT_FOUND", message: "Record not found." });
      const next = { ...record, status: input.decision === "changes_requested" ? "changes_requested" as const : input.decision, publicationState: input.decision === "changes_requested" ? "preview" as const : "public" as const };
      drafts.set(input.slug, next);
      const events = reviewEvents.get(input.slug) ?? [];
      events.push({ id: `event-${Date.now()}`, decision: input.decision, comment: input.comment, reviewer: ctx.user.name ?? "Archive reviewer", createdAt: new Date().toISOString() });
      reviewEvents.set(input.slug, events);
      const notified = input.decision === "changes_requested" ? await notifyOwner({ title: "Heritage record needs revision", content: `${record.title} needs a contributor revision. Reviewer note: ${input.comment}` }) : false;
      return { record: next, notified };
    }),
  }),
});

export type AppRouter = typeof appRouter;
