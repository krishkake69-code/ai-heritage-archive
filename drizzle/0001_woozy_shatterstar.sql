CREATE TABLE `entity_relationships` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recordId` int NOT NULL,
	`relationType` varchar(80) NOT NULL,
	`entityType` varchar(80) NOT NULL,
	`entityLabel` varchar(180) NOT NULL,
	`confidence` decimal(5,4),
	`sourceLabel` varchar(240),
	CONSTRAINT `entity_relationships_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `evidence_links` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sectionId` int NOT NULL,
	`mediaId` int NOT NULL,
	`quote` text,
	`startSeconds` decimal(10,3),
	`endSeconds` decimal(10,3),
	`sourceLabel` varchar(240) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `evidence_links_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `heritage_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`slug` varchar(180) NOT NULL,
	`title` varchar(240) NOT NULL,
	`shortDescription` text NOT NULL,
	`originalLanguage` varchar(80) NOT NULL,
	`region` varchar(120) NOT NULL,
	`district` varchar(120),
	`village` varchar(120),
	`category` varchar(100) NOT NULL,
	`festival` varchar(120),
	`practitionerId` int,
	`ownerId` int,
	`status` enum('draft','processing','pending','community','expert','changes_requested') NOT NULL DEFAULT 'draft',
	`publicationState` enum('private','preview','public') NOT NULL DEFAULT 'private',
	`sourceLabel` varchar(240),
	`isDemo` boolean NOT NULL DEFAULT false,
	`latitude` decimal(10,7),
	`longitude` decimal(10,7),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `heritage_records_id` PRIMARY KEY(`id`),
	CONSTRAINT `heritage_records_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `knowledge_sections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recordId` int NOT NULL,
	`kind` enum('summary','procedure','materials','tools','significance','metadata','uncertainty') NOT NULL,
	`content` json NOT NULL,
	`originalContent` json,
	`aiStatus` enum('generated','edited','needs_review','verified') NOT NULL DEFAULT 'generated',
	`confidence` decimal(5,4),
	`modelVersion` varchar(120),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `knowledge_sections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `media_assets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recordId` int NOT NULL,
	`type` enum('video','audio','photo','text') NOT NULL,
	`storageKey` text NOT NULL,
	`url` text NOT NULL,
	`originalFilename` varchar(255),
	`mimeType` varchar(120),
	`durationSeconds` int,
	`caption` text,
	`language` varchar(80),
	`visibility` enum('private','preview','public') NOT NULL DEFAULT 'private',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `media_assets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `practitioners` (
	`id` int AUTO_INCREMENT NOT NULL,
	`displayName` varchar(180) NOT NULL,
	`biography` text NOT NULL,
	`region` varchar(120) NOT NULL,
	`district` varchar(120),
	`village` varchar(120),
	`languages` json NOT NULL,
	`specialties` json NOT NULL,
	`isPublic` boolean NOT NULL DEFAULT false,
	`workshopAvailable` boolean NOT NULL DEFAULT false,
	`verificationStatus` enum('pending','community','expert') NOT NULL DEFAULT 'pending',
	`avatarUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `practitioners_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `risk_assessments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recordId` int NOT NULL,
	`score` int NOT NULL,
	`level` enum('low','moderate','high','critical') NOT NULL,
	`practitionerCount` int NOT NULL,
	`averageAge` int NOT NULL,
	`youngPractitionerCount` int NOT NULL,
	`documentationLevel` int NOT NULL,
	`commercialPractice` int NOT NULL,
	`geographicSpread` int NOT NULL,
	`explanation` text NOT NULL,
	`rulesVersion` varchar(40) NOT NULL,
	`assessedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `risk_assessments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `search_documents` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recordId` int NOT NULL,
	`searchableText` text NOT NULL,
	`embeddingRef` text,
	`indexingStatus` enum('pending','indexed','excluded') NOT NULL DEFAULT 'pending',
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `search_documents_id` PRIMARY KEY(`id`),
	CONSTRAINT `search_documents_recordId_unique` UNIQUE(`recordId`)
);
--> statement-breakpoint
CREATE TABLE `transcript_segments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mediaId` int NOT NULL,
	`sequence` int NOT NULL,
	`originalText` text NOT NULL,
	`translatedText` text,
	`startSeconds` decimal(10,3),
	`endSeconds` decimal(10,3),
	`confidence` decimal(5,4),
	`language` varchar(20),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `transcript_segments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `verification_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recordId` int NOT NULL,
	`reviewerId` int NOT NULL,
	`decision` enum('submitted','community_verified','expert_verified','changes_requested') NOT NULL,
	`comment` text,
	`evidenceNote` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `verification_events_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `heritage_records_region_idx` ON `heritage_records` (`region`);--> statement-breakpoint
CREATE INDEX `heritage_records_status_idx` ON `heritage_records` (`status`);--> statement-breakpoint
CREATE INDEX `heritage_records_category_idx` ON `heritage_records` (`category`);--> statement-breakpoint
CREATE INDEX `media_assets_record_idx` ON `media_assets` (`recordId`);