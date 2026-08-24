CREATE TABLE `rate_limit_counters` (
	`bucketKey` varchar(255) NOT NULL,
	`scope` varchar(80) NOT NULL,
	`identifierHash` varchar(64) NOT NULL,
	`windowStartedAt` timestamp NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`count` int NOT NULL DEFAULT 0,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `rate_limit_counters_bucketKey` PRIMARY KEY(`bucketKey`)
);
--> statement-breakpoint
CREATE INDEX `rate_limit_counters_expires_idx` ON `rate_limit_counters` (`expiresAt`);