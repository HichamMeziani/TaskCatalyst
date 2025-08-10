import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  subscriptionStatus: varchar("subscription_status").default("free"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Task status enum
export const taskStatusEnum = pgEnum("task_status", ["not_started", "in_progress", "completed"]);
export const taskPriorityEnum = pgEnum("task_priority", ["low", "medium", "high"]);

// Tasks table
export const tasks = pgTable("tasks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  category: varchar("category").default("personal"),
  priority: taskPriorityEnum("priority").default("medium"),
  status: taskStatusEnum("status").default("not_started"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// AI Catalysts table
export const catalysts = pgTable("catalysts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  taskId: varchar("task_id").notNull(),
  content: text("content").notNull(),
  estimatedMinutes: integer("estimated_minutes").default(5),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Task analytics table
export const taskAnalytics = pgTable("task_analytics", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  taskId: varchar("task_id").notNull(),
  catalystCompleted: boolean("catalyst_completed").default(false),
  taskStarted: boolean("task_started").default(false),
  taskCompleted: boolean("task_completed").default(false),
  timeToStart: integer("time_to_start"), // minutes from creation to first progress
  timeToComplete: integer("time_to_complete"), // minutes from creation to completion
  catalystRating: integer("catalyst_rating"), // 1-5 rating of catalyst quality
  createdAt: timestamp("created_at").defaultNow(),
});

// Create insert schemas
export const upsertUserSchema = createInsertSchema(users);
export const insertTaskSchema = createInsertSchema(tasks).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCatalystSchema = createInsertSchema(catalysts).omit({ id: true, createdAt: true });
export const insertAnalyticsSchema = createInsertSchema(taskAnalytics).omit({ id: true, createdAt: true });

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Catalyst = typeof catalysts.$inferSelect;
export type InsertCatalyst = z.infer<typeof insertCatalystSchema>;
export type TaskAnalytics = typeof taskAnalytics.$inferSelect;
export type InsertTaskAnalytics = z.infer<typeof insertAnalyticsSchema>;

// Task with catalyst type
export type TaskWithCatalyst = Task & {
  catalyst?: Catalyst;
};
