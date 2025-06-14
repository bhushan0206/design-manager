import React, { useState, useEffect } from "react";
import { Search, Filter, SortAsc, SortDesc, Plus, Loader2, Star, Bookmark, Eye, Calendar, User } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { TemplateService, CategoryService } from "@/lib/api";
import type { Template, Category } from "@/lib/db";

// Enhanced TemplateCard component with modern design
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
    views: number;
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
  const formattedDate = new Date(template.updatedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const getCategoryColor = (category: string) => {
    const colors = {
      'UI Design': 'from-purple-500 to-pink-500',
      'UX Design': 'from-blue-500 to-teal-500',
      'System Design': 'from-orange-500 to-red-500',
      'Architecture': 'from-green-500 to-emerald-500',
      'Database': 'from-indigo-500 to-purple-500',
      'default': 'from-gray-500 to-slate-500'
    };
    return colors[category as keyof typeof colors] || colors.default;
  };

  return (
    <Card className="group relative overflow-hidden border-0 bg-white/80 backdrop-blur-xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:bg-white/95 rounded-2xl">
      {/* Gradient border effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-teal-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardContent className="relative p-6 space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-start justify-between">
            <h3 className="font-bold text-xl leading-tight text-gray-900 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-blue-600 group-hover:bg-clip-text transition-all duration-300 line-clamp-2">
              {template.title}
            </h3>
            <Badge 
              variant="secondary" 
              className={`ml-2 bg-gradient-to-r ${getCategoryColor(template.category)} text-white border-0 font-semibold px-3 py-1 text-xs whitespace-nowrap shadow-lg`}
            >
              {template.category}
            </Badge>
          </div>

          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 group-hover:text-gray-700 transition-colors duration-300">
            {template.description}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-100">
            <Star className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-semibold text-amber-700">{template.stars}</span>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-100">
            <Bookmark className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-blue-700">{template.bookmarks}</span>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-100">
            <Eye className="w-4 h-4 text-green-600" />
            <span className="text-sm font-semibold text-green-700">{template.views || 0}</span>
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50/80 rounded-lg p-3 border border-gray-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            <span className="font-medium">{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-3 h-3" />
            <span className="font-medium">{template.createdBy}</span>
          </div>
          <Badge variant="outline" className="text-xs font-medium">
            v{template.version}
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onView}
            className="flex-1 bg-gradient-to-r from-purple-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 border-purple-200 hover:border-purple-300 text-purple-700 hover:text-purple-800 font-medium transition-all duration-300"
          >
            View
          </Button>

          {(userRole === "read-write" || userRole === "admin") && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
                className="flex-1 bg-gradient-to-r from-blue-50 to-teal-50 hover:from-blue-100 hover:to-teal-100 border-blue-200 hover:border-blue-300 text-blue-700 hover:text-blue-800 font-medium transition-all duration-300"
              >
                Edit
              </Button>
              {userRole === "admin" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDelete}
                  className="bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 border-red-200 hover:border-red-300 text-red-700 hover:text-red-800 font-medium transition-all duration-300"
                >
                  Delete
                </Button>
              )}
            </>
          )}
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-teal-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 lg:py-12">
        <div className="space-y-8 lg:space-y-12">
          {/* Hero Header */}
          <div className="text-center space-y-6">
            <div className="space-y-4">
              <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 bg-clip-text text-transparent leading-tight">
                Design Templates
              </h1>
              <p className="text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Discover, create, and manage your design templates with our modern, intuitive platform
              </p>
            </div>
            
            {(userRole === "read-write" || userRole === "admin") && (
              <Button
                onClick={handleCreateTemplate}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl group"
              >
                <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                Create Template
              </Button>
            )}
          </div>

          {error && (
            <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 shadow-lg">
              <p className="text-red-700 font-medium text-center">{error}</p>
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="flex justify-center items-center h-96">
              <div className="text-center space-y-6">
                <div className="relative">
                  <Loader2 className="h-16 w-16 animate-spin text-purple-600 mx-auto" />
                  <div className="absolute inset-0 h-16 w-16 animate-ping bg-purple-400/20 rounded-full mx-auto" />
                </div>
                <div className="space-y-2">
                  <p className="text-gray-700 font-semibold text-lg">Loading templates...</p>
                  <p className="text-gray-500 text-sm">Please wait while we fetch your amazing templates</p>
                </div>
              </div>
            </div>
          ) : templates.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {templates.map((template, index) => (
                <div
                  key={template._id}
                  className="animate-fade-in"
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    animationFillMode: 'both'
                  }}
                >
                  <TemplateCard
                    template={{
                      id: template._id!,
                      title: template.title,
                      category: template.category,
                      description: template.description,
                      updatedAt:
                        typeof template.updatedAt === "string"
                          ? template.updatedAt
                          : new Date(template.updatedAt).toISOString(),
                      createdBy: template.authorName,
                      version: template.version,
                      stars: template.starCount,
                      bookmarks: template.bookmarkCount,
                      views: template.viewCount,
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
            <Card className="bg-white/80 backdrop-blur-xl border-0 shadow-xl rounded-2xl overflow-hidden">
              <CardContent className="p-12 text-center">
                <div className="space-y-8">
                  <div className="relative">
                    <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                      <div className="text-6xl">🎨</div>
                    </div>
                    <div className="absolute inset-0 w-32 h-32 bg-gradient-to-br from-purple-400/20 to-blue-400/20 rounded-full animate-pulse mx-auto" />
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      {searchQuery || category !== "all" || filterByStarred || filterByRecent
                        ? "No templates found"
                        : "Ready to create something amazing?"}
                    </h3>
                    <p className="text-gray-600 text-lg max-w-md mx-auto leading-relaxed">
                      {searchQuery || category !== "all" || filterByStarred || filterByRecent
                        ? "Try adjusting your search criteria or filters to discover the perfect template."
                        : "Start your creative journey by creating your first template and organize your design workflow."}
                    </p>
                  </div>

                  {(userRole === "read-write" || userRole === "admin") &&
                    !searchQuery &&
                    category === "all" &&
                    !filterByStarred &&
                    !filterByRecent && (
                      <Button
                        onClick={handleCreateTemplate}
                        size="lg"
                        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 px-8 py-4 text-lg font-semibold rounded-xl group"
                      >
                        <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
                        Create Your First Template
                      </Button>
                    )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
};

export default TemplateGrid;
