import { MongoClient, Db, Collection } from "mongodb";

const MONGODB_URI =
  import.meta.env.VITE_MONGODB_URI ||
  "mongodb://localhost:27017/template-manager";

let client: MongoClient;
let db: Db;

export async function connectToDatabase() {
  if (!client) {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    db = client.db();
  }
  return { client, db };
}

export async function getDatabase(): Promise<Db> {
  if (!db) {
    await connectToDatabase();
  }
  return db;
}

// User interface
export interface User {
  _id?: string;
  name: string;
  email: string;
  password: string;
  role: "read" | "read-write" | "admin";
  isActive: boolean;
  emailVerified: boolean;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  preferences: {
    theme: "light" | "dark";
    emailNotifications: boolean;
    marketingEmails: boolean;
  };
}

// Template interface
export interface Template {
  _id?: string;
  title: string;
  description: string;
  content: string; // Rich text content (HTML or JSON)
  category: string;
  tags: string[];
  authorId: string;
  authorName: string;
  version: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  viewCount: number;
  starCount: number;
  bookmarkCount: number;
  thumbnailUrl?: string;
}

// Category interface
export interface Category {
  _id?: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  createdAt: Date;
}

// Template Version interface
export interface TemplateVersion {
  _id?: string;
  templateId: string;
  version: number;
  title: string;
  description: string;
  content: string;
  changes: string;
  createdAt: Date;
  createdBy: string;
}

// User Action interface (for bookmarks, follows, etc.)
export interface UserAction {
  _id?: string;
  userId: string;
  targetId: string; // template ID or user ID
  actionType: "bookmark" | "star" | "follow";
  createdAt: Date;
}

// Comment interface
export interface Comment {
  _id?: string;
  templateId: string;
  authorId: string;
  authorName: string;
  content: string;
  parentId?: string; // for nested comments
  createdAt: Date;
  updatedAt: Date;
}

// Password Reset Token interface
export interface PasswordResetToken {
  _id?: string;
  email: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// Collection getters
export async function getUsersCollection(): Promise<Collection<User>> {
  const database = await getDatabase();
  return database.collection<User>("users");
}

export async function getTemplatesCollection(): Promise<Collection<Template>> {
  const database = await getDatabase();
  return database.collection<Template>("templates");
}

export async function getCategoriesCollection(): Promise<Collection<Category>> {
  const database = await getDatabase();
  return database.collection<Category>("categories");
}

export async function getTemplateVersionsCollection(): Promise<
  Collection<TemplateVersion>
> {
  const database = await getDatabase();
  return database.collection<TemplateVersion>("template_versions");
}

export async function getUserActionsCollection(): Promise<
  Collection<UserAction>
> {
  const database = await getDatabase();
  return database.collection<UserAction>("user_actions");
}

export async function getCommentsCollection(): Promise<Collection<Comment>> {
  const database = await getDatabase();
  return database.collection<Comment>("comments");
}

export async function getPasswordResetTokensCollection(): Promise<
  Collection<PasswordResetToken>
> {
  const database = await getDatabase();
  return database.collection<PasswordResetToken>("password_reset_tokens");
}
