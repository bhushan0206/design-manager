/**
 * Database Migration Script for Design Template Manager
 *
 * This script creates the complete database schema for the application.
 * Run this script to set up your MongoDB database with all required collections and indexes.
 *
 * Usage:
 * 1. Make sure MongoDB is running
 * 2. Update the MONGODB_URI in your .env file
 * 3. Run: node db/migration.js
 */

const { MongoClient } = require("mongodb");
require("dotenv").config();

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/template-manager";

async function createDatabase() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db();

    // Create Users Collection
    console.log("Creating users collection...");
    const usersCollection = db.collection("users");

    // Create indexes for users
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await usersCollection.createIndex({ createdAt: 1 });
    await usersCollection.createIndex({ role: 1 });
    await usersCollection.createIndex({ isActive: 1 });

    // Create Templates Collection
    console.log("Creating templates collection...");
    const templatesCollection = db.collection("templates");

    // Create indexes for templates
    await templatesCollection.createIndex({
      title: "text",
      description: "text",
    });
    await templatesCollection.createIndex({ category: 1 });
    await templatesCollection.createIndex({ authorId: 1 });
    await templatesCollection.createIndex({ createdAt: -1 });
    await templatesCollection.createIndex({ updatedAt: -1 });
    await templatesCollection.createIndex({ isPublic: 1 });
    await templatesCollection.createIndex({ tags: 1 });

    // Create Categories Collection
    console.log("Creating categories collection...");
    const categoriesCollection = db.collection("categories");

    // Create indexes for categories
    await categoriesCollection.createIndex({ name: 1 }, { unique: true });
    await categoriesCollection.createIndex({ slug: 1 }, { unique: true });

    // Create Template Versions Collection
    console.log("Creating template_versions collection...");
    const versionsCollection = db.collection("template_versions");

    // Create indexes for versions
    await versionsCollection.createIndex(
      { templateId: 1, version: 1 },
      { unique: true },
    );
    await versionsCollection.createIndex({ templateId: 1, createdAt: -1 });

    // Create User Actions Collection (for bookmarks, follows, etc.)
    console.log("Creating user_actions collection...");
    const actionsCollection = db.collection("user_actions");

    // Create indexes for user actions
    await actionsCollection.createIndex(
      { userId: 1, targetId: 1, actionType: 1 },
      { unique: true },
    );
    await actionsCollection.createIndex({ userId: 1, actionType: 1 });
    await actionsCollection.createIndex({ targetId: 1, actionType: 1 });

    // Create Comments Collection
    console.log("Creating comments collection...");
    const commentsCollection = db.collection("comments");

    // Create indexes for comments
    await commentsCollection.createIndex({ templateId: 1, createdAt: -1 });
    await commentsCollection.createIndex({ authorId: 1 });
    await commentsCollection.createIndex({ parentId: 1 });

    // Create Password Reset Tokens Collection
    console.log("Creating password_reset_tokens collection...");
    const resetTokensCollection = db.collection("password_reset_tokens");

    // Create indexes for reset tokens
    await resetTokensCollection.createIndex({ email: 1 });
    await resetTokensCollection.createIndex({ token: 1 }, { unique: true });
    await resetTokensCollection.createIndex(
      { expiresAt: 1 },
      { expireAfterSeconds: 0 },
    );

    // Insert default categories
    console.log("Inserting default categories...");
    const defaultCategories = [
      {
        name: "UI Design",
        slug: "ui-design",
        description: "User interface design templates",
        color: "#8B5CF6",
        createdAt: new Date(),
      },
      {
        name: "UX Design",
        slug: "ux-design",
        description: "User experience design templates",
        color: "#3B82F6",
        createdAt: new Date(),
      },
      {
        name: "System Design",
        slug: "system-design",
        description: "System architecture design templates",
        color: "#10B981",
        createdAt: new Date(),
      },
      {
        name: "Architecture",
        slug: "architecture",
        description: "Software architecture templates",
        color: "#F59E0B",
        createdAt: new Date(),
      },
      {
        name: "Wireframes",
        slug: "wireframes",
        description: "Wireframe and mockup templates",
        color: "#EF4444",
        createdAt: new Date(),
      },
    ];

    await categoriesCollection.insertMany(defaultCategories);

    // Create default admin user
    console.log("Creating default admin user...");
    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash("admin123", 12);

    const adminUser = {
      name: "Admin User",
      email: "admin@templatemanager.com",
      password: hashedPassword,
      role: "admin",
      isActive: true,
      emailVerified: true,
      avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLoginAt: null,
      preferences: {
        theme: "light",
        emailNotifications: true,
        marketingEmails: false,
      },
    };

    try {
      await usersCollection.insertOne(adminUser);
      console.log("Default admin user created successfully");
      console.log("Email: admin@templatemanager.com");
      console.log("Password: admin123");
      console.log("Please change the password after first login!");
    } catch (error) {
      if (error.code === 11000) {
        console.log("Admin user already exists, skipping...");
      } else {
        throw error;
      }
    }

    console.log("\n✅ Database migration completed successfully!");
    console.log("\n📋 Collections created:");
    console.log("  - users (with indexes on email, createdAt, role, isActive)");
    console.log("  - templates (with text search and category indexes)");
    console.log("  - categories (with default categories)");
    console.log("  - template_versions (for version control)");
    console.log("  - user_actions (for bookmarks, follows, etc.)");
    console.log("  - comments (for template discussions)");
    console.log("  - password_reset_tokens (with TTL index)");
    console.log("\n🔐 Default admin account:");
    console.log("  Email: admin@templatemanager.com");
    console.log("  Password: admin123");
    console.log("  ⚠️  Please change this password after first login!");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    await client.close();
    console.log("\nDatabase connection closed.");
  }
}

// Run migration
if (require.main === module) {
  createDatabase();
}

module.exports = { createDatabase };
