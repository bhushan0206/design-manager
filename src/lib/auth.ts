import CryptoJS from "crypto-js";

// Mock interfaces for now - will be replaced with actual API calls
interface User {
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

interface PasswordResetToken {
  _id?: string;
  email: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

const AUTH_SECRET = import.meta.env.VITE_AUTH_SECRET || "fallback-secret-key";
const TOKEN_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: "read" | "read-write" | "admin";
  avatarUrl?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export class AuthService {
  // Hash password using crypto-js
  static async hashPassword(password: string): Promise<string> {
    return CryptoJS.SHA256(password + AUTH_SECRET).toString();
  }

  // Compare password
  static async comparePassword(
    password: string,
    hashedPassword: string,
  ): Promise<boolean> {
    const hash = CryptoJS.SHA256(password + AUTH_SECRET).toString();
    return hash === hashedPassword;
  }

  // Generate simple token
  static generateToken(user: AuthUser): string {
    const payload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatarUrl: user.avatarUrl,
      exp: Date.now() + TOKEN_EXPIRES_IN,
    };

    const payloadStr = JSON.stringify(payload);
    const encrypted = CryptoJS.AES.encrypt(payloadStr, AUTH_SECRET).toString();
    return btoa(encrypted); // Base64 encode
  }

  // Verify token
  static verifyToken(token: string): AuthUser | null {
    try {
      const encrypted = atob(token); // Base64 decode
      const decrypted = CryptoJS.AES.decrypt(encrypted, AUTH_SECRET);
      const payloadStr = decrypted.toString(CryptoJS.enc.Utf8);

      if (!payloadStr) return null;

      const payload = JSON.parse(payloadStr);

      // Check expiration
      if (Date.now() > payload.exp) {
        return null;
      }

      return {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        role: payload.role,
        avatarUrl: payload.avatarUrl,
      };
    } catch (error) {
      return null;
    }
  }

  // Register new user (mock implementation for now)
  static async register(
    userData: RegisterData,
  ): Promise<{ user: AuthUser; token: string }> {
    // TODO: Replace with actual API call
    // For now, create a mock user
    const userId = Math.random().toString(36).substring(2, 15);

    const authUser: AuthUser = {
      id: userId,
      name: userData.name,
      email: userData.email,
      role: "read-write",
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
    };

    const token = this.generateToken(authUser);

    return { user: authUser, token };
  }

  // Login user (mock implementation for now)
  static async login(
    credentials: LoginCredentials,
  ): Promise<{ user: AuthUser; token: string }> {
    // TODO: Replace with actual API call
    // For now, create a mock successful login
    if (
      credentials.email === "demo@example.com" &&
      credentials.password === "demo123"
    ) {
      const authUser: AuthUser = {
        id: "demo-user-id",
        name: "Demo User",
        email: credentials.email,
        role: "admin",
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.email}`,
      };

      const token = this.generateToken(authUser);
      return { user: authUser, token };
    }

    throw new Error("Invalid email or password");
  }

  // Generate password reset token (mock implementation)
  static async generatePasswordResetToken(email: string): Promise<string> {
    // TODO: Replace with actual API call
    const token =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    return token;
  }

  // Reset password with token (mock implementation)
  static async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<void> {
    // TODO: Replace with actual API call
    // For now, just simulate success
    if (!token || !newPassword) {
      throw new Error("Invalid token or password");
    }
  }

  // Get user by ID (mock implementation)
  static async getUserById(userId: string): Promise<AuthUser | null> {
    // TODO: Replace with actual API call
    if (userId === "demo-user-id") {
      return {
        id: userId,
        name: "Demo User",
        email: "demo@example.com",
        role: "admin",
        avatarUrl:
          "https://api.dicebear.com/7.x/avataaars/svg?seed=demo@example.com",
      };
    }
    return null;
  }
}

// Local storage helpers for client-side auth state
export class AuthStorage {
  private static readonly TOKEN_KEY = "auth_token";
  private static readonly USER_KEY = "auth_user";

  static setAuth(user: AuthUser, token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static getUser(): AuthUser | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  static clearAuth(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  static isAuthenticated(): boolean {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }
}
