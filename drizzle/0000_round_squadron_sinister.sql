CREATE TABLE `bible_chapters` (
	`id` text PRIMARY KEY NOT NULL,
	`created_date` integer NOT NULL,
	`updated_date` integer,
	`book_id` text NOT NULL,
	`chapter_name` text,
	`chapter_number` integer NOT NULL,
	FOREIGN KEY (`book_id`) REFERENCES `books`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `bible_verses` (
	`id` text PRIMARY KEY NOT NULL,
	`created_date` integer NOT NULL,
	`updated_date` integer,
	`bible_chapter_id` text NOT NULL,
	`verse_number` integer NOT NULL,
	FOREIGN KEY (`bible_chapter_id`) REFERENCES `bible_chapters`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `books` (
	`id` text PRIMARY KEY NOT NULL,
	`created_date` integer NOT NULL,
	`updated_date` integer,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `cards` (
	`id` text PRIMARY KEY NOT NULL,
	`created_date` integer NOT NULL,
	`updated_date` integer,
	`collection_id` text NOT NULL,
	`verse_id` text NOT NULL,
	`last_review_date` integer NOT NULL,
	`ease_factor` integer NOT NULL,
	`interval` integer DEFAULT 0 NOT NULL,
	`repetition_number` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`collection_id`) REFERENCES `collections`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`verse_id`) REFERENCES `bible_verses`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `collections` (
	`id` text PRIMARY KEY NOT NULL,
	`created_date` integer NOT NULL,
	`updated_date` integer,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `languages` (
	`id` text PRIMARY KEY NOT NULL,
	`created_date` integer NOT NULL,
	`updated_date` integer,
	`name` text NOT NULL,
	`version` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `languages_version_unique` ON `languages` (`version`);--> statement-breakpoint
CREATE TABLE `translations` (
	`id` text PRIMARY KEY NOT NULL,
	`created_date` integer NOT NULL,
	`updated_date` integer,
	`verse_id` text NOT NULL,
	`language_id` text NOT NULL,
	`text` text NOT NULL,
	FOREIGN KEY (`verse_id`) REFERENCES `bible_verses`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`language_id`) REFERENCES `languages`(`id`) ON UPDATE no action ON DELETE no action
);
