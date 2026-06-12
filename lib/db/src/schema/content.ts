import { pgTable, serial, text, integer, jsonb, timestamp } from "drizzle-orm/pg-core";

export const sectionsTable = pgTable("sections", {
  id: serial("id").primaryKey(),
  sectionId: text("section_id").notNull().unique(),
  title: text("title").notNull(),
  fullTitle: text("full_title").notNull(),
  description: text("description").notNull(),
  color: text("color").notNull(),
  iconName: text("icon_name").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const videosTable = pgTable("videos", {
  id: serial("id").primaryKey(),
  sectionId: text("section_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  videoUrl: text("video_url").notNull(),
  duration: text("duration").notNull().default(""),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const quizQuestionsTable = pgTable("quiz_questions", {
  id: serial("id").primaryKey(),
  sectionId: text("section_id").notNull(),
  question: text("question").notNull(),
  options: jsonb("options").$type<string[]>().notNull(),
  correctIndex: integer("correct_index").notNull(),
  explanation: text("explanation").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});
