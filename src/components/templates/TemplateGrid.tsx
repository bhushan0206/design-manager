import React, { useState, useEffect } from "react";
import { Search, Filter, SortAsc, SortDesc, Plus, Loader2 } from "lucide-react";
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

interface Template {
  id: string;
  title: string;
  category: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  version: number;
  stars: number;
  bookmarks: number;
}

interface TemplateGridProps {
  userRole?: "read" | "read-write" | "admin";
  onCreateTemplate?: () => void;
  onEditTemplate?: (id: string) => void;
  onViewTemplate?: (id: string) => void;
  onDeleteTemplate?: (id: string) => void;
}

const TemplateGrid = ({
  userRole = "read",
  onCreateTemplate = () => {},
  onEditTemplate = () => {},
  onViewTemplate = () => {},
  onDeleteTemplate = () => {},
}: TemplateGridProps) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("updatedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [categories, setCategories] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("all");

  // Mock data for demonstration
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockTemplates: Template[] = [
        {
          id: "1",
          title: "User Authentication Flow",
          category: "Authentication",
          description:
            "A comprehensive design template for implementing secure user authentication with multi-factor options.",
          createdAt: "2023-05-15T10:30:00Z",
          updatedAt: "2023-06-20T14:45:00Z",
          createdBy: "Jane Smith",
          version: 2,
          stars: 24,
          bookmarks: 18,
        },
        {
          id: "2",
          title: "Dashboard Layout",
          category: "UI Components",
          description:
            "Responsive dashboard layout with customizable widgets and data visualization components.",
          createdAt: "2023-04-10T09:15:00Z",
          updatedAt: "2023-06-15T11:20:00Z",
          createdBy: "John Doe",
          version: 3,
          stars: 42,
          bookmarks: 31,
        },
        {
          id: "3",
          title: "E-commerce Checkout Process",
          category: "E-commerce",
          description:
            "Step-by-step checkout flow optimized for conversion and user experience.",
          createdAt: "2023-03-22T13:45:00Z",
          updatedAt: "2023-05-30T16:10:00Z",
          createdBy: "Alex Johnson",
          version: 1,
          stars: 18,
          bookmarks: 12,
        },
        {
          id: "4",
          title: "API Integration Pattern",
          category: "Backend",
          description:
            "Design patterns for seamless integration with third-party APIs and services.",
          createdAt: "2023-02-18T11:30:00Z",
          updatedAt: "2023-04-25T09:50:00Z",
          createdBy: "Sarah Williams",
          version: 2,
          stars: 36,
          bookmarks: 27,
        },
        {
          id: "5",
          title: "Mobile Navigation",
          category: "Mobile",
          description:
            "Intuitive navigation patterns for mobile applications with gesture support.",
          createdAt: "2023-01-05T15:20:00Z",
          updatedAt: "2023-03-12T10:15:00Z",
          createdBy: "Michael Brown",
          version: 4,
          stars: 29,
          bookmarks: 22,
        },
        {
          id: "6",
          title: "Data Visualization Components",
          category: "UI Components",
          description:
            "Reusable chart and graph components for effective data visualization.",
          createdAt: "2023-06-01T08:45:00Z",
          updatedAt: "2023-06-10T14:30:00Z",
          createdBy: "Emily Davis",
          version: 1,
          stars: 15,
          bookmarks: 9,
        },
      ];

      setTemplates(mockTemplates);

      // Extract unique categories
      const uniqueCategories = Array.from(
        new Set(mockTemplates.map((template) => template.category)),
      );
      setCategories(uniqueCategories);

      setLoading(false);
    }, 1000);
  }, []);

  // Filter and sort templates
  const filteredTemplates = templates
    .filter((template) => {
      // Search filter
      const matchesSearch =
        template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory =
        categoryFilter === "all" || template.category === categoryFilter;

      // Tab filter
      const matchesTab =
        activeTab === "all" ||
        (activeTab === "starred" && template.stars > 0) ||
        (activeTab === "bookmarked" && template.bookmarks > 0);

      return matchesSearch && matchesCategory && matchesTab;
    })
    .sort((a, b) => {
      // Sort logic
      let comparison = 0;

      if (sortBy === "title") {
        comparison = a.title.localeCompare(b.title);
      } else if (sortBy === "category") {
        comparison = a.category.localeCompare(b.category);
      } else if (sortBy === "createdAt") {
        comparison =
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === "updatedAt") {
        comparison =
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
      } else if (sortBy === "stars") {
        comparison = a.stars - b.stars;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
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
            <Button onClick={onCreateTemplate} className="shadow-glow">
              <Plus className="mr-2 h-4 w-4" /> Create Template
            </Button>
          )}
        </div>

        {/* Tabs for different views */}
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="glass-effect p-1 h-12 grid w-full md:w-auto grid-cols-3 md:inline-flex">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md"
            >
              All Templates
            </TabsTrigger>
            <TabsTrigger
              value="starred"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md"
            >
              Starred
            </TabsTrigger>
            <TabsTrigger
              value="bookmarked"
              className="data-[state=active]:bg-white data-[state=active]:shadow-md"
            >
              Bookmarked
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Search, filter and sort controls */}
        <div className="glass-effect rounded-2xl p-6 border border-white/20">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-white/50 border-white/30 focus:bg-white/80 transition-all"
              />
            </div>
            <div className="flex gap-3">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px] h-12 bg-white/50 border-white/30">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[200px] h-12 bg-white/50 border-white/30">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                  <SelectItem value="updatedAt">Last Updated</SelectItem>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                  <SelectItem value="stars">Stars</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="icon"
                onClick={toggleSortDirection}
                className="h-12 w-12 bg-white/50 border-white/30 hover:bg-white/80"
              >
                {sortDirection === "asc" ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Templates grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredTemplates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fade-in">
            {filteredTemplates.map((template, index) => (
              <div
                key={template.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <TemplateCard
                  template={{
                    id: template.id,
                    title: template.title,
                    category: template.category,
                    description: template.description,
                    updatedAt: template.updatedAt,
                    createdBy: template.createdBy,
                    version: template.version,
                    stars: template.stars,
                    bookmarks: template.bookmarks,
                  }}
                  userRole={userRole}
                  onView={() => onViewTemplate(template.id)}
                  onEdit={() => onEditTemplate(template.id)}
                  onDelete={() => onDeleteTemplate(template.id)}
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
                  categoryFilter !== "all" ||
                  activeTab !== "all"
                    ? "No templates match your search criteria."
                    : "No templates available. Create your first template!"}
                </p>
                {(userRole === "read-write" || userRole === "admin") &&
                  !searchQuery &&
                  categoryFilter === "all" &&
                  activeTab === "all" && (
                    <Button onClick={onCreateTemplate} className="shadow-glow">
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
