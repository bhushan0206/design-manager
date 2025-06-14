// Database API client - connects to backend server

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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

// API request helper
class ApiClient {
  private static async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API request failed: ${url}`, error);
      throw error;
    }
  }

  static async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  static async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// User API functions
export const UserAPI = {
  async create(userData: Omit<User, "_id" | "createdAt" | "updatedAt">): Promise<User> {
    return ApiClient.post<User>('/users', userData);
  },

  async findByEmail(email: string): Promise<User | null> {
    try {
      return await ApiClient.get<User>(`/users/email/${encodeURIComponent(email)}`);
    } catch (error) {
      // Return null if user not found (404)
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  },

  async findById(id: string): Promise<User | null> {
    try {
      return await ApiClient.get<User>(`/users/${id}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  },

  async updateById(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      return await ApiClient.put<User>(`/users/${id}`, updates);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  },

  async getAll(): Promise<User[]> {
    return ApiClient.get<User[]>('/users');
  },
};

// Template API functions
export const TemplateAPI = {
  async create(templateData: Omit<Template, "_id" | "createdAt" | "updatedAt" | "viewCount" | "starCount" | "bookmarkCount">): Promise<Template> {
    return ApiClient.post<Template>('/templates', templateData);
  },

  async findById(id: string): Promise<Template | null> {
    try {
      return await ApiClient.get<Template>(`/templates/${id}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  },

  async updateById(id: string, updates: Partial<Template>): Promise<Template | null> {
    try {
      return await ApiClient.put<Template>(`/templates/${id}`, updates);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  },

  async deleteById(id: string): Promise<boolean> {
    try {
      await ApiClient.delete(`/templates/${id}`);
      return true;
    } catch (error) {
      return false;
    }
  },

  async getAll(filters?: {
    category?: string;
    authorId?: string;
    search?: string;
    isPublic?: boolean;
  }): Promise<Template[]> {
    const params = new URLSearchParams();
    
    if (filters?.category && filters.category !== "all") {
      params.append('category', filters.category);
    }
    if (filters?.authorId) {
      params.append('authorId', filters.authorId);
    }
    if (filters?.search) {
      params.append('search', filters.search);
    }
    if (filters?.isPublic !== undefined) {
      params.append('isPublic', filters.isPublic.toString());
    }

    const queryString = params.toString();
    const endpoint = queryString ? `/templates?${queryString}` : '/templates';
    
    return ApiClient.get<Template[]>(endpoint);
  },

  async incrementViewCount(id: string): Promise<void> {
    await ApiClient.post(`/templates/${id}/view`);
  },
};

// Category API functions
export const CategoryAPI = {
  async getAll(): Promise<Category[]> {
    return ApiClient.get<Category[]>('/categories');
  },

  async create(categoryData: Omit<Category, "_id" | "createdAt">): Promise<Category> {
    return ApiClient.post<Category>('/categories', categoryData);
  },

  async findById(id: string): Promise<Category | null> {
    try {
      return await ApiClient.get<Category>(`/categories/${id}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  },

  async updateById(id: string, updates: Partial<Category>): Promise<Category | null> {
    try {
      return await ApiClient.put<Category>(`/categories/${id}`, updates);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  },

  async deleteById(id: string): Promise<boolean> {
    try {
      await ApiClient.delete(`/categories/${id}`);
      return true;
    } catch (error) {
      return false;
    }
  },
};

// User Action API functions
export const UserActionAPI = {
  async create(actionData: Omit<UserAction, "_id" | "createdAt">): Promise<UserAction> {
    return ApiClient.post<UserAction>('/user-actions', actionData);
  },

  async findByUserAndTarget(
    userId: string,
    targetId: string,
    actionType: UserAction["actionType"],
  ): Promise<UserAction | null> {
    try {
      return await ApiClient.get<UserAction>(`/user-actions/user/${userId}/target/${targetId}/type/${actionType}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  },

  async deleteByUserAndTarget(
    userId: string,
    targetId: string,
    actionType: UserAction["actionType"],
  ): Promise<boolean> {
    try {
      await ApiClient.delete(`/user-actions/user/${userId}/target/${targetId}/type/${actionType}`);
      return true;
    } catch (error) {
      return false;
    }
  },

  async getByUser(userId: string, actionType?: UserAction["actionType"]): Promise<UserAction[]> {
    const params = new URLSearchParams();
    if (actionType) {
      params.append('actionType', actionType);
    }
    
    const queryString = params.toString();
    const endpoint = queryString ? `/user-actions/user/${userId}?${queryString}` : `/user-actions/user/${userId}`;
    
    return ApiClient.get<UserAction[]>(endpoint);
  },

  async getCountByTarget(targetId: string, actionType: UserAction["actionType"]): Promise<number> {
    const response = await ApiClient.get<{ count: number }>(`/user-actions/target/${targetId}/type/${actionType}/count`);
    return response.count;
  },
};

// Comment API functions
export const CommentAPI = {
  async create(commentData: Omit<Comment, "_id" | "createdAt" | "updatedAt">): Promise<Comment> {
    return ApiClient.post<Comment>('/comments', commentData);
  },

  async getByTemplate(templateId: string): Promise<Comment[]> {
    return ApiClient.get<Comment[]>(`/comments/template/${templateId}`);
  },

  async updateById(id: string, updates: Partial<Comment>): Promise<Comment | null> {
    try {
      return await ApiClient.put<Comment>(`/comments/${id}`, updates);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  },

  async deleteById(id: string): Promise<boolean> {
    try {
      await ApiClient.delete(`/comments/${id}`);
      return true;
    } catch (error) {
      return false;
    }
  },
};

// Password Reset Token API functions
export const PasswordResetTokenAPI = {
  async create(tokenData: Omit<PasswordResetToken, "_id" | "createdAt">): Promise<PasswordResetToken> {
    return ApiClient.post<PasswordResetToken>('/password-reset-tokens', tokenData);
  },

  async findByToken(token: string): Promise<PasswordResetToken | null> {
    try {
      return await ApiClient.get<PasswordResetToken>(`/password-reset-tokens/${token}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  },

  async deleteByToken(token: string): Promise<boolean> {
    try {
      await ApiClient.delete(`/password-reset-tokens/${token}`);
      return true;
    } catch (error) {
      return false;
    }
  },

  async deleteExpired(): Promise<void> {
    await ApiClient.delete('/password-reset-tokens/expired');
  },
};
