import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const rsvps = sqliteTable('wedding_rsvps', {
 id: text('id').primaryKey(), tokenHash: text('token_hash').notNull(),
 name: text('name').notNull(), attendance: text('attendance').notNull(),
 partySize: integer('party_size').notNull(), guests: text('guests').notNull().default(''),
 message: text('message').notNull().default(''), updatedAt: text('updated_at').notNull(),
});
