import {
  users,
  tasks,
  catalysts,
  taskAnalytics,
  type User,
  type UpsertUser,
  type Task,
  type InsertTask,
  type TaskWithCatalyst,
  type Catalyst,
  type InsertCatalyst,
  type TaskAnalytics,
  type InsertTaskAnalytics,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql, count } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;
  
  // Task operations
  createTask(task: InsertTask): Promise<Task>;
  getUserTasks(userId: string): Promise<TaskWithCatalyst[]>;
  getTask(taskId: string, userId: string): Promise<TaskWithCatalyst | undefined>;
  updateTaskStatus(taskId: string, userId: string, status: "not_started" | "in_progress" | "completed"): Promise<Task>;
  deleteTask(taskId: string, userId: string): Promise<void>;
  
  // Catalyst operations
  createCatalyst(catalyst: InsertCatalyst): Promise<Catalyst>;
  updateCatalystCompletion(catalystId: string, completed: boolean): Promise<Catalyst>;
  
  // Analytics operations
  createTaskAnalytics(analytics: InsertTaskAnalytics): Promise<TaskAnalytics>;
  getUserAnalytics(userId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    tasksStartedToday: number;
    catalystSuccessRate: number;
    averageTimeToStart: number;
    completionRate: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        stripeCustomerId,
        stripeSubscriptionId,
        subscriptionStatus: "active",
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Task operations
  async createTask(task: InsertTask): Promise<Task> {
    const [newTask] = await db.insert(tasks).values(task).returning();
    return newTask;
  }

  async getUserTasks(userId: string): Promise<TaskWithCatalyst[]> {
    const result = await db
      .select({
        task: tasks,
        catalyst: catalysts,
      })
      .from(tasks)
      .leftJoin(catalysts, eq(tasks.id, catalysts.taskId))
      .where(eq(tasks.userId, userId))
      .orderBy(desc(tasks.createdAt));

    // Group catalysts with tasks
    const tasksMap = new Map<string, TaskWithCatalyst>();
    
    for (const row of result) {
      const taskId = row.task.id;
      if (!tasksMap.has(taskId)) {
        tasksMap.set(taskId, {
          ...row.task,
          catalyst: row.catalyst || undefined,
        });
      }
    }

    return Array.from(tasksMap.values());
  }

  async getTask(taskId: string, userId: string): Promise<TaskWithCatalyst | undefined> {
    const result = await db
      .select({
        task: tasks,
        catalyst: catalysts,
      })
      .from(tasks)
      .leftJoin(catalysts, eq(tasks.id, catalysts.taskId))
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .limit(1);

    if (result.length === 0) return undefined;

    return {
      ...result[0].task,
      catalyst: result[0].catalyst || undefined,
    };
  }

  async updateTaskStatus(taskId: string, userId: string, status: "not_started" | "in_progress" | "completed"): Promise<Task> {
    const updateData: any = {
      status,
      updatedAt: new Date(),
    };

    if (status === "completed") {
      updateData.completedAt = new Date();
    }

    const [task] = await db
      .update(tasks)
      .set(updateData)
      .where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)))
      .returning();
    
    return task;
  }

  async deleteTask(taskId: string, userId: string): Promise<void> {
    await db.delete(catalysts).where(eq(catalysts.taskId, taskId));
    await db.delete(tasks).where(and(eq(tasks.id, taskId), eq(tasks.userId, userId)));
  }

  // Catalyst operations
  async createCatalyst(catalyst: InsertCatalyst): Promise<Catalyst> {
    const [newCatalyst] = await db.insert(catalysts).values(catalyst).returning();
    return newCatalyst;
  }

  async updateCatalystCompletion(catalystId: string, completed: boolean): Promise<Catalyst> {
    const updateData: any = {
      completed,
    };

    if (completed) {
      updateData.completedAt = new Date();
    }

    const [catalyst] = await db
      .update(catalysts)
      .set(updateData)
      .where(eq(catalysts.id, catalystId))
      .returning();
    
    return catalyst;
  }

  // Analytics operations
  async createTaskAnalytics(analytics: InsertTaskAnalytics): Promise<TaskAnalytics> {
    const [newAnalytics] = await db.insert(taskAnalytics).values(analytics).returning();
    return newAnalytics;
  }

  async getUserAnalytics(userId: string): Promise<{
    totalTasks: number;
    completedTasks: number;
    tasksStartedToday: number;
    catalystSuccessRate: number;
    averageTimeToStart: number;
    completionRate: number;
  }> {
    // Get total tasks count
    const [totalTasksResult] = await db
      .select({ count: count() })
      .from(tasks)
      .where(eq(tasks.userId, userId));

    // Get completed tasks count
    const [completedTasksResult] = await db
      .select({ count: count() })
      .from(tasks)
      .where(and(eq(tasks.userId, userId), eq(tasks.status, "completed")));

    // Get tasks started today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [tasksStartedTodayResult] = await db
      .select({ count: count() })
      .from(tasks)
      .where(and(
        eq(tasks.userId, userId),
        sql`${tasks.createdAt} >= ${today}`,
        sql`${tasks.status} != 'not_started'`
      ));

    // Get catalyst success rate
    const [catalystAnalytics] = await db
      .select({
        totalCatalysts: count(),
        completedCatalysts: count(sql`CASE WHEN ${taskAnalytics.catalystCompleted} = true THEN 1 END`),
      })
      .from(taskAnalytics)
      .where(eq(taskAnalytics.userId, userId));

    // Get average time to start (in minutes)
    const [timeAnalytics] = await db
      .select({
        avgTimeToStart: sql`AVG(${taskAnalytics.timeToStart})`,
      })
      .from(taskAnalytics)
      .where(and(
        eq(taskAnalytics.userId, userId),
        sql`${taskAnalytics.timeToStart} IS NOT NULL`
      ));

    const totalTasks = totalTasksResult.count || 0;
    const completedTasks = completedTasksResult.count || 0;
    const tasksStartedToday = tasksStartedTodayResult.count || 0;
    const catalystSuccessRate = catalystAnalytics.totalCatalysts > 0 
      ? (catalystAnalytics.completedCatalysts / catalystAnalytics.totalCatalysts) * 100 
      : 0;
    const averageTimeToStart = Number(timeAnalytics.avgTimeToStart) || 0;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      totalTasks,
      completedTasks,
      tasksStartedToday,
      catalystSuccessRate: Math.round(catalystSuccessRate),
      averageTimeToStart: Math.round(averageTimeToStart),
      completionRate: Math.round(completionRate),
    };
  }
}

export const storage = new DatabaseStorage();
