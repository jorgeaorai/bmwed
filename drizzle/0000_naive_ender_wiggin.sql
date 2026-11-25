CREATE TABLE `wedding_rsvps` (
	`id` text PRIMARY KEY NOT NULL,
	`token_hash` text NOT NULL,
	`name` text NOT NULL,
	`attendance` text NOT NULL,
	`party_size` integer NOT NULL,
	`guests` text DEFAULT '' NOT NULL,
	`message` text DEFAULT '' NOT NULL,
	`updated_at` text NOT NULL
);
