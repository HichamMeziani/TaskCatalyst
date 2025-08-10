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

  // Task routes
  app.post("/api/tasks", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const taskData = insertTaskSchema.parse({ ...req.body, userId });

      // Create the task
      const task = await storage.createTask(taskData);

      // Generate AI catalyst
      const catalystRequest = {
        taskTitle: task.title,
        taskDescription: task.description || undefined,
        category: task.category || undefined,
        priority: task.priority || undefined,
      };

      const catalystResponse = await aiService.generateCatalyst(catalystRequest);

      // Save the catalyst
      const catalyst = await storage.createCatalyst({
        taskId: task.id,
        content: catalystResponse.content,
        estimatedMinutes: catalystResponse.estimatedMinutes,
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

  app.patch("/api/tasks/:taskId/status", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { taskId } = req.params;
      const { status } = req.body;

      if (!["not_started", "in_progress", "completed"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const task = await storage.updateTaskStatus(taskId, userId, status);
      
      // Update analytics
      if (status === "in_progress") {
        // Calculate time to start (in minutes)
        const timeToStart = Math.floor((Date.now() - new Date(task.createdAt).getTime()) / (1000 * 60));
        await storage.createTaskAnalytics({
          userId,
          taskId,
          taskStarted: true,
          timeToStart,
        });
      } else if (status === "completed") {
        const timeToComplete = Math.floor((Date.now() - new Date(task.createdAt).getTime()) / (1000 * 60));
        await storage.createTaskAnalytics({
          userId,
          taskId,
          taskCompleted: true,
          timeToComplete,
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
      const { catalystId } = req.params;
      const { completed } = req.body;

      const catalyst = await storage.updateCatalystCompletion(catalystId, completed);
      
      if (completed) {
        // Update analytics
        const userId = req.user.claims.sub;
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

  app.post("/api/catalysts/:catalystId/regenerate", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { catalystId } = req.params;

      // Get the current catalyst to find the associated task
      const task = await storage.getTask(req.body.taskId, userId);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }

      // Generate new catalyst
      const catalystRequest = {
        taskTitle: task.title,
        taskDescription: task.description || undefined,
        category: task.category || undefined,
        priority: task.priority || undefined,
      };

      const catalystResponse = await aiService.generateCatalyst(catalystRequest);

      // Update the existing catalyst
      const catalyst = await storage.createCatalyst({
        taskId: task.id,
        content: catalystResponse.content,
        estimatedMinutes: catalystResponse.estimatedMinutes,
      });

      res.json(catalyst);
    } catch (error) {
      console.error("Error regenerating catalyst:", error);
      res.status(500).json({ message: "Failed to regenerate catalyst" });
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
