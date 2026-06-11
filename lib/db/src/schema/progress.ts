import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const videoProgressTable = pgTable("video_progress", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  videoId: text("video_id").notNull(),
  sectionId: text("section_id").notNull(),
  watchedAt: timestamp("watched_at", { withTimezone: true }).notNull().defaultNow(),
});

export const quizResultsTable = pgTable("quiz_results", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  sectionId: text("section_id").notNull(),
  score: integer("score").notNull(),
  total: integer("total").notNull(),
  passed: boolean("passed").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const certificatesTable = pgTable("certificates", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull(),
  sectionId: text("section_id").notNull(),
  awardedAt: timestamp("awarded_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertVideoProgressSchema = createInsertSchema(videoProgressTable).omit({ id: true, watchedAt: true });
export const insertQuizResultSchema = createInsertSchema(quizResultsTable).omit({ id: true, createdAt: true });
export const insertCertificateSchema = createInsertSchema(certificatesTable).omit({ id: true, awardedAt: true });

export type VideoProgress = typeof videoProgressTable.$inferSelect;
export type QuizResult = typeof quizResultsTable.$inferSelect;
export type CertificateRow = typeof certificatesTable.$inferSelect;
export type InsertVideoProgress = z.infer<typeof insertVideoProgressSchema>;
export type InsertQuizResult = z.infer<typeof insertQuizResultSchema>;
export type InsertCertificate = z.infer<typeof insertCertificateSchema>;
