import React, { useState, useEffect } from "react";
import { Search, Filter, SortAsc, SortDesc, Plus, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplateService, CategoryService } from "@/lib/api";
import type { Template, Category } from "@/lib/db";

// Define the TemplateCard component inline since it's not available for import
interface TemplateCardProps {
  template: {
    id: string;
    title: string;
    category: string;
    description: string;
    updatedAt: string;
    createdBy: string;
    version: number;
    stars: number;
    bookmarks: number;
  };
  userRole: "read" | "read-write" | "admin";
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  userRole,
  onView,
  onEdit,
  onDelete,
}) => {
  const formattedDate = new Date(template.updatedAt).toLocaleDateString();

  return (
    <Card className="h-full flex flex-col bg-white/80 backdrop-blur-sm border border-white/20 card-hover group">
      <CardContent className="flex flex-col p-6 h-full">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-lg line-clamp-2 mb-2 group-hover:text-primary transition-colors">
              {template.title}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 px-3 py-1 rounded-full font-medium">
                {template.category}
              </span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                v{template.version}
              </span>
            </div>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-grow leading-relaxed">
          {template.description}
        </p>

        <div className="flex justify-between items-center text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <span className="w-1 h-1 bg-green-500 rounded-full"></span>
            Updated: {formattedDate}
          </div>
          <div>By: {template.createdBy}</div>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200/50">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-yellow-600">
              <span className="text-sm">⭐</span>
              <span className="text-sm font-medium">{template.stars}</span>
            </span>
            <span className="flex items-center gap-1 text-blue-600">
              <span className="text-sm">🔖</span>
              <span className="text-sm font-medium">{template.bookmarks}</span>
            </span>
          </div>

          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onView}
              className="hover:bg-purple-50 hover:text-purple-700 transition-colors"
            >
              View
            </Button>

            {(userRole === "read-write" || userRole === "admin") && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEdit}
                  className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 transition-colors"
                >
                  Edit
                </Button>
                {userRole === "admin" && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={onDelete}
                    className="hover:bg-red-50 hover:text-red-700 transition-colors"
                  >
                    Delete
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface TemplateGridProps {
  category?: string;
  searchQuery?: string;
  sortBy?: string;
  userRole?: "read" | "read-write" | "admin";
  filterByUser?: string;
  filterByStarred?: boolean;
  filterByRecent?: boolean;
}

const TemplateGrid = ({
  category = "all",
  searchQuery = "",
  sortBy = "updatedAt",
  userRole = "read",
  filterByUser,
  filterByStarred,
  filterByRecent,
}: TemplateGridProps) => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load templates and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load categories
        const categoriesData = await CategoryService.getCategories();
        setCategories(categoriesData);

        // Prepare filters
        const filters: any = {
          category: category !== "all" ? category : undefined,
          search: searchQuery || undefined,
          sortBy: sortBy as any,
          sortDirection: "desc" as const,
        };

        // Apply user-specific filters
        if (filterByUser) {
          filters.authorId = filterByUser;
        }

        let templatesData: Template[];

        if (filterByStarred) {
          // This would need user ID - for now, show empty
          templatesData = [];
        } else if (filterByRecent) {
          // Get recently viewed templates - for now, show all sorted by view count
          filters.sortBy = "views";
          templatesData = await TemplateService.getTemplates(filters);
        } else {
          templatesData = await TemplateService.getTemplates(filters);
        }

        setTemplates(templatesData);
      } catch (err) {
        console.error("Error loading templates:", err);
        setError("Failed to load templates");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [
    category,
    searchQuery,
    sortBy,
    filterByUser,
    filterByStarred,
    filterByRecent,
  ]);

  const handleViewTemplate = (id: string) => {
    navigate(`/templates/${id}`);
  };

  const handleEditTemplate = (id: string) => {
    navigate(`/templates/edit/${id}`);
  };

  const handleDeleteTemplate = async (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      try {
        await TemplateService.deleteTemplate(id);
        // Reload templates
        setTemplates(templates.filter((t) => t._id !== id));
      } catch (err) {
        console.error("Error deleting template:", err);
        alert("Failed to delete template");
      }
    }
  };

  const handleCreateTemplate = () => {
    navigate("/templates/edit/new");
  };

  return (
    <div className="w-full p-6">
      <div className="flex flex-col space-y-8">
        {/* Header with title and create button */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Design Templates
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and organize your design templates
            </p>
          </div>
          {(userRole === "read-write" || userRole === "admin") && (
            <Button onClick={handleCreateTemplate} className="shadow-glow">
              <Plus className="mr-2 h-4 w-4" /> Create Template
            </Button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Templates grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : templates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in">
            {templates.map((template, index) => (
              <div
                key={template._id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <TemplateCard
                  template={{
                    id: template._id!,
                    title: template.title,
                    category: template.category,
                    description: template.description,
                    updatedAt: template.updatedAt.toISOString(),
                    createdBy: template.authorName,
                    version: template.version,
                    stars: template.starCount,
                    bookmarks: template.bookmarkCount,
                  }}
                  userRole={userRole}
                  onView={() => handleViewTemplate(template._id!)}
                  onEdit={() => handleEditTemplate(template._id!)}
                  onDelete={() => handleDeleteTemplate(template._id!)}
                />
              </div>
            ))}
          </div>
        ) : (
          <Card className="w-full glass-effect border border-white/20">
            <CardContent className="flex flex-col items-center justify-center h-64">
              <div className="text-center animate-fade-in">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📋</span>
                </div>
                <p className="text-muted-foreground text-center mb-4">
                  {searchQuery ||
                  category !== "all" ||
                  filterByStarred ||
                  filterByRecent
                    ? "No templates match your search criteria."
                    : "No templates available. Create your first template!"}
                </p>
                {(userRole === "read-write" || userRole === "admin") &&
                  !searchQuery &&
                  category === "all" &&
                  !filterByStarred &&
                  !filterByRecent && (
                    <Button
                      onClick={handleCreateTemplate}
                      className="shadow-glow"
                    >
                      <Plus className="mr-2 h-4 w-4" /> Create Template
                    </Button>
                  )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TemplateGrid;
