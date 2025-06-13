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

  // Register new user
  static async register(
    userData: RegisterData,
  ): Promise<{ user: AuthUser; token: string }> {
    const { UserAPI } = await import("./db");

    // Check if user already exists
    const existingUser = await UserAPI.findByEmail(
      userData.email.toLowerCase(),
    );
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Hash password
    const hashedPassword = await this.hashPassword(userData.password);

    // Create user in database
    const dbUser = await UserAPI.create({
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      role: "read-write",
      isActive: true,
      emailVerified: false,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.email}`,
      preferences: {
        theme: "light",
        emailNotifications: true,
        marketingEmails: false,
      },
    });

    const authUser: AuthUser = {
      id: dbUser._id!,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      avatarUrl: dbUser.avatarUrl,
    };

    const token = this.generateToken(authUser);

    return { user: authUser, token };
  }

  // Login user
  static async login(
    credentials: LoginCredentials,
  ): Promise<{ user: AuthUser; token: string }> {
    const { UserAPI } = await import("./db");

    // Find user by email
    const dbUser = await UserAPI.findByEmail(credentials.email.toLowerCase());
    if (!dbUser) {
      throw new Error("Invalid email or password");
    }

    // Check if user is active
    if (!dbUser.isActive) {
      throw new Error("Account is deactivated. Please contact support.");
    }

    // Verify password
    const isPasswordValid = await this.comparePassword(
      credentials.password,
      dbUser.password,
    );
    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
    }

    // Update last login time
    await UserAPI.updateById(dbUser._id!, { lastLoginAt: new Date() });

    const authUser: AuthUser = {
      id: dbUser._id!,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      avatarUrl: dbUser.avatarUrl,
    };

    const token = this.generateToken(authUser);
    return { user: authUser, token };
  }

  // Generate password reset token
  static async generatePasswordResetToken(email: string): Promise<string> {
    const { UserAPI, PasswordResetTokenAPI } = await import("./db");

    // Check if user exists
    const user = await UserAPI.findByEmail(email.toLowerCase());
    if (!user) {
      throw new Error("No account found with this email address");
    }

    // Generate token
    const token =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    // Set expiration to 1 hour from now
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Save token to database
    await PasswordResetTokenAPI.create({
      email: email.toLowerCase(),
      token,
      expiresAt,
    });

    return token;
  }

  // Reset password with token
  static async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<void> {
    const { UserAPI, PasswordResetTokenAPI } = await import("./db");

    if (!token || !newPassword) {
      throw new Error("Invalid token or password");
    }

    // Find and validate token
    const resetToken = await PasswordResetTokenAPI.findByToken(token);
    if (!resetToken) {
      throw new Error("Invalid or expired reset token");
    }

    // Check if token is expired
    if (new Date() > resetToken.expiresAt) {
      await PasswordResetTokenAPI.deleteByToken(token);
      throw new Error("Reset token has expired");
    }

    // Find user
    const user = await UserAPI.findByEmail(resetToken.email);
    if (!user) {
      throw new Error("User not found");
    }

    // Hash new password
    const hashedPassword = await this.hashPassword(newPassword);

    // Update user password
    await UserAPI.updateById(user._id!, { password: hashedPassword });

    // Delete the used token
    await PasswordResetTokenAPI.deleteByToken(token);
  }

  // Get user by ID
  static async getUserById(userId: string): Promise<AuthUser | null> {
    const { UserAPI } = await import("./db");

    const dbUser = await UserAPI.findById(userId);
    if (!dbUser) {
      return null;
    }

    return {
      id: dbUser._id!,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      avatarUrl: dbUser.avatarUrl,
    };
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
