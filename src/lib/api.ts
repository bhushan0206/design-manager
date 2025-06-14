// API service layer for template management
import { TemplateAPI, CategoryAPI, UserActionAPI, CommentAPI } from "./db";
import type { Template, Category, Comment, UserAction } from "./db";

export interface TemplateFilters {
  category?: string;
  search?: string;
  authorId?: string;
  sortBy?: "title" | "createdAt" | "updatedAt" | "stars" | "views";
  sortDirection?: "asc" | "desc";
  isPublic?: boolean;
}

export interface CreateTemplateData {
  title: string;
  description: string;
  content: string;
  category: string;
  tags: string[];
  authorId: string;
  authorName: string;
  isPublic: boolean;
}

export interface UpdateTemplateData {
  title?: string;
  description?: string;
  content?: string;
  category?: string;
  tags?: string[];
  isPublic?: boolean;
  version?: number;
}

export class TemplateService {
  static async getTemplates(
    filters: TemplateFilters = {},
  ): Promise<Template[]> {
    const templates = await TemplateAPI.getAll({
      category: filters.category,
      search: filters.search,
      authorId: filters.authorId,
      isPublic: filters.isPublic,
    });

    // Sort templates
    const sortBy = filters.sortBy || "updatedAt";
    const sortDirection = filters.sortDirection || "desc";

    templates.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "title":
          comparison = a.title.localeCompare(b.title);
          break;
        case "createdAt":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "updatedAt":
          comparison =
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case "stars":
          comparison = a.starCount - b.starCount;
          break;
        case "views":
          comparison = a.viewCount - b.viewCount;
          break;
        default:
          comparison =
            new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return templates;
  }

  static async getTemplateById(
    id: string,
    userId?: string,
  ): Promise<Template | null> {
    const template = await TemplateAPI.findById(id);
    if (!template) return null;

    // Increment view count
    try {
      await TemplateAPI.incrementViewCount(id);
    } catch (error) {
      console.warn('Failed to increment view count:', error);
    }

    // If user is provided, get user actions for this template
    if (userId) {
      try {
        const starAction = await UserActionAPI.findByUserAndTarget(
          userId,
          id,
          "star",
        );
        const bookmarkAction = await UserActionAPI.findByUserAndTarget(
          userId,
          id,
          "bookmark",
        );

        // Add user-specific data (this would be handled differently in a real API)
        (template as any).isStarred = !!starAction;
        (template as any).isBookmarked = !!bookmarkAction;
      } catch (error) {
        // If user actions fail, just set them to false
        console.warn('Failed to fetch user actions:', error);
        (template as any).isStarred = false;
        (template as any).isBookmarked = false;
      }
    }

    return template;
  }

  static async createTemplate(data: CreateTemplateData): Promise<Template> {
    return await TemplateAPI.create({
      ...data,
      version: 1,
    });
  }

  static async updateTemplate(
    id: string,
    data: UpdateTemplateData,
  ): Promise<Template | null> {
    const template = await TemplateAPI.findById(id);
    if (!template) return null;

    // Increment version if content changed
    const updates = { ...data };
    if (data.content && data.content !== template.content) {
      updates.version = template.version + 1;
    }

    return await TemplateAPI.updateById(id, updates);
  }

  static async deleteTemplate(id: string): Promise<boolean> {
    return await TemplateAPI.deleteById(id);
  }

  static async toggleStar(
    templateId: string,
    userId: string,
  ): Promise<{ isStarred: boolean; starCount: number }> {
    const existingAction = await UserActionAPI.findByUserAndTarget(
      userId,
      templateId,
      "star",
    );
    const template = await TemplateAPI.findById(templateId);

    if (!template) {
      throw new Error("Template not found");
    }

    if (existingAction) {
      // Remove star
      await UserActionAPI.deleteByUserAndTarget(userId, templateId, "star");
      const newStarCount = Math.max(0, template.starCount - 1);
      await TemplateAPI.updateById(templateId, { starCount: newStarCount });
      return { isStarred: false, starCount: newStarCount };
    } else {
      // Add star
      await UserActionAPI.create({
        userId,
        targetId: templateId,
        actionType: "star",
      });
      const newStarCount = template.starCount + 1;
      await TemplateAPI.updateById(templateId, { starCount: newStarCount });
      return { isStarred: true, starCount: newStarCount };
    }
  }

  static async toggleBookmark(
    templateId: string,
    userId: string,
  ): Promise<{ isBookmarked: boolean; bookmarkCount: number }> {
    const existingAction = await UserActionAPI.findByUserAndTarget(
      userId,
      templateId,
      "bookmark",
    );
    const template = await TemplateAPI.findById(templateId);

    if (!template) {
      throw new Error("Template not found");
    }

    if (existingAction) {
      // Remove bookmark
      await UserActionAPI.deleteByUserAndTarget(userId, templateId, "bookmark");
      const newBookmarkCount = Math.max(0, template.bookmarkCount - 1);
      await TemplateAPI.updateById(templateId, {
        bookmarkCount: newBookmarkCount,
      });
      return { isBookmarked: false, bookmarkCount: newBookmarkCount };
    } else {
      // Add bookmark
      await UserActionAPI.create({
        userId,
        targetId: templateId,
        actionType: "bookmark",
      });
      const newBookmarkCount = template.bookmarkCount + 1;
      await TemplateAPI.updateById(templateId, {
        bookmarkCount: newBookmarkCount,
      });
      return { isBookmarked: true, bookmarkCount: newBookmarkCount };
    }
  }

  static async getStarredTemplates(userId: string): Promise<Template[]> {
    const starredActions = await UserActionAPI.getByUser(userId, "star");
    const templateIds = starredActions.map((action) => action.targetId);

    const templates = [];
    for (const id of templateIds) {
      const template = await TemplateAPI.findById(id);
      if (template) {
        templates.push(template);
      }
    }

    return templates;
  }

  static async getBookmarkedTemplates(userId: string): Promise<Template[]> {
    const bookmarkedActions = await UserActionAPI.getByUser(userId, "bookmark");
    const templateIds = bookmarkedActions.map((action) => action.targetId);

    const templates = [];
    for (const id of templateIds) {
      const template = await TemplateAPI.findById(id);
      if (template) {
        templates.push(template);
      }
    }

    return templates;
  }
}

export class CategoryService {
  static async getCategories(): Promise<Category[]> {
    return await CategoryAPI.getAll();
  }

  static async createCategory(
    data: Omit<Category, "_id" | "createdAt">,
  ): Promise<Category> {
    return await CategoryAPI.create(data);
  }

  static async updateCategory(
    id: string,
    data: Partial<Category>,
  ): Promise<Category | null> {
    return await CategoryAPI.updateById(id, data);
  }

  static async deleteCategory(id: string): Promise<boolean> {
    return await CategoryAPI.deleteById(id);
  }
}

export class CommentService {
  static async getCommentsByTemplate(templateId: string): Promise<Comment[]> {
    return await CommentAPI.getByTemplate(templateId);
  }

  static async createComment(data: {
    templateId: string;
    authorId: string;
    authorName: string;
    content: string;
    parentId?: string;
  }): Promise<Comment> {
    return await CommentAPI.create(data);
  }

  static async updateComment(
    id: string,
    content: string,
  ): Promise<Comment | null> {
    return await CommentAPI.updateById(id, { content });
  }

  static async deleteComment(id: string): Promise<boolean> {
    return await CommentAPI.deleteById(id);
  }
}
