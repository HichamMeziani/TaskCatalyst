import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { aiService } from "./services/aiService";
import { insertTaskSchema, insertCatalystSchema, insertAnalyticsSchema } from "@shared/schema";
import Stripe from "stripe";
import { z } from "zod";

// Stripe integration - optional for now
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2023-10-16",
    })
  : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Onboarding routes
  app.post("/api/onboarding", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const onboardingData = z.object({
        interests: z.array(z.string()).min(3).max(5),
        lifeGoal: z.string().min(1).max(200),
        dailyFreeTime: z.number().min(0).max(24),
        age: z.number().min(13).max(120),
        gender: z.enum(["male", "female", "non-binary", "prefer-not-to-say", "custom"]),
      }).parse(req.body);
      
      const user = await storage.completeOnboarding(userId, onboardingData);
      res.json({ user });
    } catch (error) {
      console.error("Error completing onboarding:", error);
      res.status(500).json({ message: "Failed to complete onboarding" });
    }
  });

  // Task routes
  app.get("/api/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const tasks = await storage.getUserTasks(userId);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      const taskData = insertTaskSchema.parse({ ...req.body, userId });

      // Create the task
      const task = await storage.createTask(taskData);

      // Generate AI catalyst with user interests
      const catalystRequest = {
        taskTitle: task.title,
        taskDescription: task.description || undefined,
        category: task.category || undefined,
        priority: task.priority || undefined,
      };

      const catalystResponse = await aiService.generateCatalyst(catalystRequest, user?.interests || []);

      // Save the catalyst
      const catalyst = await storage.createCatalyst({
        taskId: task.id,
        content: catalystResponse.content,
        estimatedMinutes: catalystResponse.estimatedMinutes,
        relevanceScore: catalystResponse.relevanceScore || 0,
        matchedInterests: catalystResponse.matchedInterests || [],
      });

      // Create analytics entry
      await storage.createTaskAnalytics({
        userId,
        taskId: task.id,
        catalystCompleted: false,
        taskStarted: false,
        taskCompleted: false,
      });

      res.json({ task, catalyst });
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:taskId/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { taskId } = req.params;
      const { status } = req.body;

      if (!["not_started", "in_progress", "completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const task = await storage.updateTaskStatus(taskId, userId, status);
      
      // Update productivity score and create activity feed entry
      if (status === "completed") {
        await storage.updateProductivityScore(userId, 10); // +10 for task completion
        
        const user = await storage.getUser(userId);
        await storage.createActivity({
          userId,
          username: user?.firstName || "Someone",
          activityType: "task_completed",
          description: "just completed a task! 🎉",
          taskTitle: task.title,
          productivityScore: user?.productivityScore || 0,
        });
        
        const timeToComplete = Math.floor((Date.now() - new Date(task.createdAt).getTime()) / (1000 * 60));
        await storage.createTaskAnalytics({
          userId,
          taskId,
          taskCompleted: true,
          timeToComplete,
        });
      } else if (status === "in_progress") {
        await storage.updateProductivityScore(userId, 3); // +3 for starting task
        const timeToStart = Math.floor((Date.now() - new Date(task.createdAt).getTime()) / (1000 * 60));
        await storage.createTaskAnalytics({
          userId,
          taskId,
          taskStarted: true,
          timeToStart,
        });
      }

      res.json(task);
    } catch (error) {
      console.error("Error updating task status:", error);
      res.status(500).json({ message: "Failed to update task status" });
    }
  });

  app.delete("/api/tasks/:taskId", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { taskId } = req.params;

      await storage.deleteTask(taskId, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(500).json({ message: "Failed to delete task" });
    }
  });

  // Catalyst routes
  app.patch("/api/catalysts/:catalystId/complete", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { catalystId } = req.params;
      const { completed } = req.body;

      const catalyst = await storage.updateCatalystCompletion(catalystId, completed);
      
      // Update productivity score for catalyst completion
      if (completed) {
        await storage.updateProductivityScore(userId, 3); // +3 for catalyst completion
        await storage.createTaskAnalytics({
          userId,
          taskId: catalyst.taskId,
          catalystCompleted: true,
        });
      }

      res.json(catalyst);
    } catch (error) {
      console.error("Error updating catalyst completion:", error);
      res.status(500).json({ message: "Failed to update catalyst completion" });
    }
  });

  // Analytics routes
  app.get("/api/analytics", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const analytics = await storage.getUserAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Activity feed routes
  app.get("/api/activity-feed", isAuthenticated, async (req: any, res) => {
    try {
      const activities = await storage.getActivityFeed(20);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activity feed:", error);
      res.status(500).json({ message: "Failed to fetch activity feed" });
    }
  });

  // Payment routes
  app.post('/api/get-or-create-subscription', isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.status(503).json({ 
        message: "Payment processing not configured. Please contact support." 
      });
    }

    const userId = req.user.claims.sub;
    let user = await storage.getUser(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.stripeSubscriptionId) {
      try {
        const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
        
        const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string, {
          expand: ['payment_intent'],
        });

        res.json({
          subscriptionId: subscription.id,
          clientSecret: (invoice.payment_intent as any)?.client_secret,
        });
        return;
      } catch (error) {
        console.error("Error retrieving subscription:", error);
      }
    }
    
    if (!user.email) {
      throw new Error('No user email on file');
    }

    try {
      let customerId = user.stripeCustomerId;
      
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        });
        customerId = customer.id;
      }

      const subscription = await stripe.subscriptions.create({
        customer: customerId,
        items: [{
          price: process.env.STRIPE_PRICE_ID || 'price_1234567890', // Replace with actual price ID
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      await storage.updateUserStripeInfo(userId, customerId, subscription.id);

      const invoice = subscription.latest_invoice as any;
      
      res.json({
        subscriptionId: subscription.id,
        clientSecret: invoice.payment_intent.client_secret,
      });
    } catch (error: any) {
      console.error("Error creating subscription:", error);
      return res.status(400).json({ error: { message: error.message } });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
