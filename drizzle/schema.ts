import {
  boolean,
  decimal,
  index,
  int,
  json,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const practitioners = mysqlTable("practitioners", {
  id: int("id").autoincrement().primaryKey(),
  displayName: varchar("displayName", { length: 180 }).notNull(),
  biography: text("biography").notNull(),
  region: varchar("region", { length: 120 }).notNull(),
  district: varchar("district", { length: 120 }),
  village: varchar("village", { length: 120 }),
  languages: json("languages").$type<string[]>().notNull(),
  specialties: json("specialties").$type<string[]>().notNull(),
  isPublic: boolean("isPublic").default(false).notNull(),
  workshopAvailable: boolean("workshopAvailable").default(false).notNull(),
  verificationStatus: mysqlEnum("verificationStatus", ["pending", "community", "expert"]).default("pending").notNull(),
  avatarUrl: text("avatarUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const heritageRecords = mysqlTable("heritage_records", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 180 }).notNull().unique(),
  title: varchar("title", { length: 240 }).notNull(),
  shortDescription: text("shortDescription").notNull(),
  originalLanguage: varchar("originalLanguage", { length: 80 }).notNull(),
  region: varchar("region", { length: 120 }).notNull(),
  district: varchar("district", { length: 120 }),
  village: varchar("village", { length: 120 }),
  category: varchar("category", { length: 100 }).notNull(),
  festival: varchar("festival", { length: 120 }),
  practitionerId: int("practitionerId"),
  ownerId: int("ownerId"),
  status: mysqlEnum("status", ["draft", "processing", "pending", "community", "expert", "changes_requested"]).default("draft").notNull(),
  publicationState: mysqlEnum("publicationState", ["private", "preview", "public"]).default("private").notNull(),
  sourceLabel: varchar("sourceLabel", { length: 240 }),
  isDemo: boolean("isDemo").default(false).notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 7 }),
  longitude: decimal("longitude", { precision: 10, scale: 7 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({
  regionIdx: index("heritage_records_region_idx").on(table.region),
  statusIdx: index("heritage_records_status_idx").on(table.status),
  categoryIdx: index("heritage_records_category_idx").on(table.category),
}));

export const mediaAssets = mysqlTable("media_assets", {
  id: int("id").autoincrement().primaryKey(),
  recordId: int("recordId").notNull(),
  type: mysqlEnum("type", ["video", "audio", "photo", "text"]).notNull(),
  storageKey: text("storageKey").notNull(),
  url: text("url").notNull(),
  originalFilename: varchar("originalFilename", { length: 255 }),
  mimeType: varchar("mimeType", { length: 120 }),
  durationSeconds: int("durationSeconds"),
  caption: text("caption"),
  language: varchar("language", { length: 80 }),
  visibility: mysqlEnum("visibility", ["private", "preview", "public"]).default("private").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, (table) => ({ recordIdx: index("media_assets_record_idx").on(table.recordId) }));

export const transcriptSegments = mysqlTable("transcript_segments", {
  id: int("id").autoincrement().primaryKey(),
  mediaId: int("mediaId").notNull(),
  sequence: int("sequence").notNull(),
  originalText: text("originalText").notNull(),
  translatedText: text("translatedText"),
  startSeconds: decimal("startSeconds", { precision: 10, scale: 3 }),
  endSeconds: decimal("endSeconds", { precision: 10, scale: 3 }),
  confidence: decimal("confidence", { precision: 5, scale: 4 }),
  language: varchar("language", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const knowledgeSections = mysqlTable("knowledge_sections", {
  id: int("id").autoincrement().primaryKey(),
  recordId: int("recordId").notNull(),
  kind: mysqlEnum("kind", ["summary", "procedure", "materials", "tools", "significance", "metadata", "uncertainty"]).notNull(),
  content: json("content").$type<string | string[] | Record<string, unknown>>().notNull(),
  originalContent: json("originalContent").$type<string | string[] | Record<string, unknown>>(),
  aiStatus: mysqlEnum("aiStatus", ["generated", "edited", "needs_review", "verified"]).default("generated").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 4 }),
  modelVersion: varchar("modelVersion", { length: 120 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const evidenceLinks = mysqlTable("evidence_links", {
  id: int("id").autoincrement().primaryKey(),
  sectionId: int("sectionId").notNull(),
  mediaId: int("mediaId").notNull(),
  quote: text("quote"),
  startSeconds: decimal("startSeconds", { precision: 10, scale: 3 }),
  endSeconds: decimal("endSeconds", { precision: 10, scale: 3 }),
  sourceLabel: varchar("sourceLabel", { length: 240 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const verificationEvents = mysqlTable("verification_events", {
  id: int("id").autoincrement().primaryKey(),
  recordId: int("recordId").notNull(),
  reviewerId: int("reviewerId").notNull(),
  decision: mysqlEnum("decision", ["submitted", "community_verified", "expert_verified", "changes_requested"]).notNull(),
  comment: text("comment"),
  evidenceNote: text("evidenceNote"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export const riskAssessments = mysqlTable("risk_assessments", {
  id: int("id").autoincrement().primaryKey(),
  recordId: int("recordId").notNull(),
  score: int("score").notNull(),
  level: mysqlEnum("level", ["low", "moderate", "high", "critical"]).notNull(),
  practitionerCount: int("practitionerCount").notNull(),
  averageAge: int("averageAge").notNull(),
  youngPractitionerCount: int("youngPractitionerCount").notNull(),
  documentationLevel: int("documentationLevel").notNull(),
  commercialPractice: int("commercialPractice").notNull(),
  geographicSpread: int("geographicSpread").notNull(),
  explanation: text("explanation").notNull(),
  rulesVersion: varchar("rulesVersion", { length: 40 }).notNull(),
  assessedAt: timestamp("assessedAt").defaultNow().notNull(),
});

export const entityRelationships = mysqlTable("entity_relationships", {
  id: int("id").autoincrement().primaryKey(),
  recordId: int("recordId").notNull(),
  relationType: varchar("relationType", { length: 80 }).notNull(),
  entityType: varchar("entityType", { length: 80 }).notNull(),
  entityLabel: varchar("entityLabel", { length: 180 }).notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 4 }),
  sourceLabel: varchar("sourceLabel", { length: 240 }),
});

export const searchDocuments = mysqlTable("search_documents", {
  id: int("id").autoincrement().primaryKey(),
  recordId: varchar("recordId", { length: 180 }).notNull().unique(),
  searchableText: text("searchableText").notNull(),
  embeddingRef: text("embeddingRef"),
  indexingStatus: mysqlEnum("indexingStatus", ["pending", "indexed", "excluded"]).default("pending").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Fixed-window counters for rate-limit enforcement. The caller identifier is
 * hashed before storage so the table never retains raw IP addresses or IDs.
 */
export const rateLimitCounters = mysqlTable("rate_limit_counters", {
  bucketKey: varchar("bucketKey", { length: 255 }).primaryKey(),
  scope: varchar("scope", { length: 80 }).notNull(),
  identifierHash: varchar("identifierHash", { length: 64 }).notNull(),
  windowStartedAt: timestamp("windowStartedAt").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  count: int("count").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, (table) => ({ expiresAtIdx: index("rate_limit_counters_expires_idx").on(table.expiresAt) }));

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type HeritageRecord = typeof heritageRecords.$inferSelect;
export type Practitioner = typeof practitioners.$inferSelect;
export type MediaAsset = typeof mediaAssets.$inferSelect;
export type KnowledgeSection = typeof knowledgeSections.$inferSelect;
export type RiskAssessment = typeof riskAssessments.$inferSelect;
export type VerificationEvent = typeof verificationEvents.$inferSelect;
export type EntityRelationship = typeof entityRelationships.$inferSelect;
export type RateLimitCounter = typeof rateLimitCounters.$inferSelect;
