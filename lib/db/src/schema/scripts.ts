import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const scriptsTable = pgTable("scripts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().default("anonymous"),
  topic: text("topic").notNull(),
  platform: text("platform").notNull(),
  tone: text("tone").notNull(),
  duration: text("duration").notNull(),
  audience: text("audience").notNull().default("general"),
  hookStyle: text("hook_style").notNull().default("question"),
  script: text("script").notNull(),
  hook: text("hook").notNull(),
  hashtags: text("hashtags").array().notNull().default([]),
  saved: boolean("saved").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertScriptSchema = createInsertSchema(scriptsTable).omit({ id: true, createdAt: true });
export type InsertScript = z.infer<typeof insertScriptSchema>;
export type Script = typeof scriptsTable.$inferSelect;
