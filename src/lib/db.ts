// MongoDB imports removed for browser compatibility - using ObjectId alternative
class ObjectId {
  static toString() {
    return Math.random().toString(36).substr(2, 9);
  }

  toString() {
    return Math.random().toString(36).substr(2, 9);
  }
}

const MONGODB_URI =
  import.meta.env.VITE_MONGODB_URI ||
  "mongodb://localhost:27017/template-manager";

// Removed MongoDB client and db variables for browser compatibility

// In-memory storage for development (since we can't connect to MongoDB in browser)
let inMemoryStorage = {
  users: [] as User[],
  templates: [] as Template[],
  categories: [] as Category[],
  templateVersions: [] as TemplateVersion[],
  userActions: [] as UserAction[],
  comments: [] as Comment[],
  passwordResetTokens: [] as PasswordResetToken[],
};

// Initialize with some default data
if (inMemoryStorage.categories.length === 0) {
  inMemoryStorage.categories = [
    {
      _id: "1",
      name: "Authentication",
      slug: "authentication",
      description: "User authentication and authorization templates",
      color: "#3B82F6",
      createdAt: new Date(),
    },
    {
      _id: "2",
      name: "UI Components",
      slug: "ui-components",
      description: "Reusable UI component templates",
      color: "#10B981",
      createdAt: new Date(),
    },
    {
      _id: "3",
      name: "E-commerce",
      slug: "e-commerce",
      description: "E-commerce related design templates",
      color: "#F59E0B",
      createdAt: new Date(),
    },
    {
      _id: "4",
      name: "Backend",
      slug: "backend",
      description: "Backend architecture and API templates",
      color: "#8B5CF6",
      createdAt: new Date(),
    },
    {
      _id: "5",
      name: "Mobile",
      slug: "mobile",
      description: "Mobile application design templates",
      color: "#EF4444",
      createdAt: new Date(),
    },
  ];
}

export async function connectToDatabase() {
  // For development, we'll use in-memory storage
  // In production, this would connect to actual MongoDB
  return { client: null, db: null };
}

export async function getDatabase(): Promise<any> {
  // For development, return null as we're using in-memory storage
  return null;
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

// API Service Functions for in-memory storage

// User API functions
export const UserAPI = {
  async create(
    userData: Omit<User, "_id" | "createdAt" | "updatedAt">,
  ): Promise<User> {
    const user: User = {
      _id: new ObjectId().toString(),
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryStorage.users.push(user);
    return user;
  },

  async findByEmail(email: string): Promise<User | null> {
    return inMemoryStorage.users.find((user) => user.email === email) || null;
  },

  async findById(id: string): Promise<User | null> {
    return inMemoryStorage.users.find((user) => user._id === id) || null;
  },

  async updateById(id: string, updates: Partial<User>): Promise<User | null> {
    const userIndex = inMemoryStorage.users.findIndex(
      (user) => user._id === id,
    );
    if (userIndex === -1) return null;

    inMemoryStorage.users[userIndex] = {
      ...inMemoryStorage.users[userIndex],
      ...updates,
      updatedAt: new Date(),
    };
    return inMemoryStorage.users[userIndex];
  },

  async getAll(): Promise<User[]> {
    return inMemoryStorage.users;
  },
};

// Template API functions
export const TemplateAPI = {
  async create(
    templateData: Omit<
      Template,
      | "_id"
      | "createdAt"
      | "updatedAt"
      | "viewCount"
      | "starCount"
      | "bookmarkCount"
    >,
  ): Promise<Template> {
    const template: Template = {
      _id: new ObjectId().toString(),
      ...templateData,
      viewCount: 0,
      starCount: 0,
      bookmarkCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryStorage.templates.push(template);
    return template;
  },

  async findById(id: string): Promise<Template | null> {
    return (
      inMemoryStorage.templates.find((template) => template._id === id) || null
    );
  },

  async updateById(
    id: string,
    updates: Partial<Template>,
  ): Promise<Template | null> {
    const templateIndex = inMemoryStorage.templates.findIndex(
      (template) => template._id === id,
    );
    if (templateIndex === -1) return null;

    inMemoryStorage.templates[templateIndex] = {
      ...inMemoryStorage.templates[templateIndex],
      ...updates,
      updatedAt: new Date(),
    };
    return inMemoryStorage.templates[templateIndex];
  },

  async deleteById(id: string): Promise<boolean> {
    const templateIndex = inMemoryStorage.templates.findIndex(
      (template) => template._id === id,
    );
    if (templateIndex === -1) return false;

    inMemoryStorage.templates.splice(templateIndex, 1);
    return true;
  },

  async getAll(filters?: {
    category?: string;
    authorId?: string;
    search?: string;
    isPublic?: boolean;
  }): Promise<Template[]> {
    let templates = [...inMemoryStorage.templates];

    if (filters?.category && filters.category !== "all") {
      templates = templates.filter((t) => t.category === filters.category);
    }

    if (filters?.authorId) {
      templates = templates.filter((t) => t.authorId === filters.authorId);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      templates = templates.filter(
        (t) =>
          t.title.toLowerCase().includes(searchLower) ||
          t.description.toLowerCase().includes(searchLower),
      );
    }

    if (filters?.isPublic !== undefined) {
      templates = templates.filter((t) => t.isPublic === filters.isPublic);
    }

    return templates;
  },

  async incrementViewCount(id: string): Promise<void> {
    const template = await this.findById(id);
    if (template) {
      await this.updateById(id, { viewCount: template.viewCount + 1 });
    }
  },
};

// Category API functions
export const CategoryAPI = {
  async getAll(): Promise<Category[]> {
    return inMemoryStorage.categories;
  },

  async create(
    categoryData: Omit<Category, "_id" | "createdAt">,
  ): Promise<Category> {
    const category: Category = {
      _id: new ObjectId().toString(),
      ...categoryData,
      createdAt: new Date(),
    };
    inMemoryStorage.categories.push(category);
    return category;
  },

  async findById(id: string): Promise<Category | null> {
    return (
      inMemoryStorage.categories.find((category) => category._id === id) || null
    );
  },

  async updateById(
    id: string,
    updates: Partial<Category>,
  ): Promise<Category | null> {
    const categoryIndex = inMemoryStorage.categories.findIndex(
      (category) => category._id === id,
    );
    if (categoryIndex === -1) return null;

    inMemoryStorage.categories[categoryIndex] = {
      ...inMemoryStorage.categories[categoryIndex],
      ...updates,
    };
    return inMemoryStorage.categories[categoryIndex];
  },

  async deleteById(id: string): Promise<boolean> {
    const categoryIndex = inMemoryStorage.categories.findIndex(
      (category) => category._id === id,
    );
    if (categoryIndex === -1) return false;

    inMemoryStorage.categories.splice(categoryIndex, 1);
    return true;
  },
};

// User Action API functions
export const UserActionAPI = {
  async create(
    actionData: Omit<UserAction, "_id" | "createdAt">,
  ): Promise<UserAction> {
    const action: UserAction = {
      _id: new ObjectId().toString(),
      ...actionData,
      createdAt: new Date(),
    };
    inMemoryStorage.userActions.push(action);
    return action;
  },

  async findByUserAndTarget(
    userId: string,
    targetId: string,
    actionType: UserAction["actionType"],
  ): Promise<UserAction | null> {
    return (
      inMemoryStorage.userActions.find(
        (action) =>
          action.userId === userId &&
          action.targetId === targetId &&
          action.actionType === actionType,
      ) || null
    );
  },

  async deleteByUserAndTarget(
    userId: string,
    targetId: string,
    actionType: UserAction["actionType"],
  ): Promise<boolean> {
    const actionIndex = inMemoryStorage.userActions.findIndex(
      (action) =>
        action.userId === userId &&
        action.targetId === targetId &&
        action.actionType === actionType,
    );

    if (actionIndex === -1) return false;

    inMemoryStorage.userActions.splice(actionIndex, 1);
    return true;
  },

  async getByUser(
    userId: string,
    actionType?: UserAction["actionType"],
  ): Promise<UserAction[]> {
    return inMemoryStorage.userActions.filter((action) => {
      if (action.userId !== userId) return false;
      if (actionType && action.actionType !== actionType) return false;
      return true;
    });
  },

  async getCountByTarget(
    targetId: string,
    actionType: UserAction["actionType"],
  ): Promise<number> {
    return inMemoryStorage.userActions.filter(
      (action) =>
        action.targetId === targetId && action.actionType === actionType,
    ).length;
  },
};

// Comment API functions
export const CommentAPI = {
  async create(
    commentData: Omit<Comment, "_id" | "createdAt" | "updatedAt">,
  ): Promise<Comment> {
    const comment: Comment = {
      _id: new ObjectId().toString(),
      ...commentData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    inMemoryStorage.comments.push(comment);
    return comment;
  },

  async getByTemplate(templateId: string): Promise<Comment[]> {
    return inMemoryStorage.comments.filter(
      (comment) => comment.templateId === templateId,
    );
  },

  async updateById(
    id: string,
    updates: Partial<Comment>,
  ): Promise<Comment | null> {
    const commentIndex = inMemoryStorage.comments.findIndex(
      (comment) => comment._id === id,
    );
    if (commentIndex === -1) return null;

    inMemoryStorage.comments[commentIndex] = {
      ...inMemoryStorage.comments[commentIndex],
      ...updates,
      updatedAt: new Date(),
    };
    return inMemoryStorage.comments[commentIndex];
  },

  async deleteById(id: string): Promise<boolean> {
    const commentIndex = inMemoryStorage.comments.findIndex(
      (comment) => comment._id === id,
    );
    if (commentIndex === -1) return false;

    inMemoryStorage.comments.splice(commentIndex, 1);
    return true;
  },
};

// Password Reset Token API functions
export const PasswordResetTokenAPI = {
  async create(
    tokenData: Omit<PasswordResetToken, "_id" | "createdAt">,
  ): Promise<PasswordResetToken> {
    const token: PasswordResetToken = {
      _id: new ObjectId().toString(),
      ...tokenData,
      createdAt: new Date(),
    };
    inMemoryStorage.passwordResetTokens.push(token);
    return token;
  },

  async findByToken(token: string): Promise<PasswordResetToken | null> {
    return (
      inMemoryStorage.passwordResetTokens.find((t) => t.token === token) || null
    );
  },

  async deleteByToken(token: string): Promise<boolean> {
    const tokenIndex = inMemoryStorage.passwordResetTokens.findIndex(
      (t) => t.token === token,
    );
    if (tokenIndex === -1) return false;

    inMemoryStorage.passwordResetTokens.splice(tokenIndex, 1);
    return true;
  },

  async deleteExpired(): Promise<void> {
    const now = new Date();
    inMemoryStorage.passwordResetTokens =
      inMemoryStorage.passwordResetTokens.filter(
        (token) => token.expiresAt > now,
      );
  },
};

// Initialize with some sample data
if (inMemoryStorage.templates.length === 0) {
  const sampleTemplates: Template[] = [
    {
      _id: "1",
      title: "User Authentication Flow",
      description:
        "A comprehensive design template for implementing secure user authentication with multi-factor options.",
      content: `<div><h2>Design Context</h2><p>This authentication flow is designed for web applications requiring secure user access with multiple authentication options.</p><img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80" alt="Authentication Flow Diagram" /><p>The flow supports email/password, social logins, and two-factor authentication methods.</p></div>`,
      category: "Authentication",
      tags: ["authentication", "security", "login"],
      authorId: "demo-user-id",
      authorName: "Alex Johnson",
      version: 2,
      isPublic: true,
      createdAt: new Date("2023-05-15T10:30:00Z"),
      updatedAt: new Date("2023-06-20T14:45:00Z"),
      viewCount: 156,
      starCount: 24,
      bookmarkCount: 18,
    },
    {
      _id: "2",
      title: "Dashboard Layout",
      description:
        "Responsive dashboard layout with customizable widgets and data visualization components.",
      content: `<div><h2>Dashboard Design</h2><p>Modern dashboard layout with responsive grid system and customizable widgets.</p></div>`,
      category: "UI Components",
      tags: ["dashboard", "layout", "responsive"],
      authorId: "demo-user-id",
      authorName: "John Doe",
      version: 3,
      isPublic: true,
      createdAt: new Date("2023-04-10T09:15:00Z"),
      updatedAt: new Date("2023-06-15T11:20:00Z"),
      viewCount: 203,
      starCount: 42,
      bookmarkCount: 31,
    },
    {
      _id: "3",
      title: "E-commerce Checkout Process",
      description:
        "Step-by-step checkout flow optimized for conversion and user experience.",
      content: `<div><h2>Checkout Flow</h2><p>Optimized checkout process with minimal steps and clear progress indicators.</p></div>`,
      category: "E-commerce",
      tags: ["checkout", "e-commerce", "conversion"],
      authorId: "demo-user-id",
      authorName: "Alex Johnson",
      version: 1,
      isPublic: true,
      createdAt: new Date("2023-03-22T13:45:00Z"),
      updatedAt: new Date("2023-05-30T16:10:00Z"),
      viewCount: 89,
      starCount: 18,
      bookmarkCount: 12,
    },
  ];

  inMemoryStorage.templates = sampleTemplates;
}

// Legacy collection getters (for backward compatibility)
export async function getUsersCollection(): Promise<any> {
  return null; // Not used with new API
}

export async function getTemplatesCollection(): Promise<any> {
  return null; // Not used with new API
}

export async function getCategoriesCollection(): Promise<any> {
  return null; // Not used with new API
}

export async function getTemplateVersionsCollection(): Promise<any> {
  return null; // Not used with new API
}

export async function getUserActionsCollection(): Promise<any> {
  return null; // Not used with new API
}

export async function getCommentsCollection(): Promise<any> {
  return null; // Not used with new API
}

export async function getPasswordResetTokensCollection(): Promise<any> {
  return null; // Not used with new API
}
