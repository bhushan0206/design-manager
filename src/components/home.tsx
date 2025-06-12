import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  SlidersHorizontal,
  Plus,
  LogIn,
  UserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

import TemplateGrid from "./templates/TemplateGrid";
import { AuthStorage, AuthUser } from "@/lib/auth";

const Home = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  // Check authentication status on component mount
  useEffect(() => {
    const checkAuth = () => {
      const authenticated = AuthStorage.isAuthenticated();
      const user = AuthStorage.getUser();
      setIsAuthenticated(authenticated);
      setCurrentUser(user);
    };

    checkAuth();

    // Listen for storage changes (for logout from other tabs)
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Mock categories - in a real app, these would be fetched from the API
  const categories = [
    { id: "all", name: "All Categories" },
    { id: "ui", name: "UI Design" },
    { id: "ux", name: "UX Design" },
    { id: "system", name: "System Design" },
    { id: "architecture", name: "Architecture" },
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleSortChange = (value: string) => {
    setSortBy(value);
  };

  const handleCreateTemplate = () => {
    navigate("/templates/edit/new");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  const handleSignUp = () => {
    navigate("/register");
  };

  const handleLogout = () => {
    AuthStorage.clearAuth();
    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen gradient-bg">
      {/* Header */}
      <header className="sticky top-0 z-10 glass-effect border-b border-white/20">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DT</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Design Template Manager
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Button variant="outline" onClick={handleLogin}>
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
                <Button onClick={handleSignUp}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Button>
              </>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={currentUser?.avatarUrl}
                        alt={currentUser?.name}
                      />
                      <AvatarFallback>
                        {currentUser?.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p>{currentUser?.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {currentUser?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Badge variant="outline" className="mr-2">
                      {currentUser?.role}
                    </Badge>
                    Role
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    Profile
                  </DropdownMenuItem>
                  {currentUser?.role === "admin" && (
                    <DropdownMenuItem onClick={() => navigate("/admin")}>
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-8">
        <div className="flex flex-col space-y-8">
          {/* Hero Section */}
          <div className="text-center py-12">
            <h2 className="text-4xl font-bold tracking-tight mb-4 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent animate-fade-in">
              Design Templates
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
              Discover, create, and manage beautiful design templates for your
              projects
            </p>
            {isAuthenticated && currentUser?.role !== "read" && (
              <Button
                onClick={handleCreateTemplate}
                size="lg"
                className="shadow-glow animate-bounce-in"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create New Template
              </Button>
            )}
          </div>

          {/* Filters and Search */}
          <div className="glass-effect rounded-2xl p-6 border border-white/20">
            <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0">
              <div className="flex flex-1 items-center space-x-3">
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search templates..."
                    className="w-full pl-10 h-12 bg-white/50 border-white/30 focus:bg-white/80 transition-all"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
                <Select
                  value={selectedCategory}
                  onValueChange={handleCategoryChange}
                >
                  <SelectTrigger className="w-[200px] h-12 bg-white/50 border-white/30">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-3">
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[200px] h-12 bg-white/50 border-white/30">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="popular">Most Popular</SelectItem>
                    <SelectItem value="alphabetical">Alphabetical</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-12 w-12 bg-white/50 border-white/30 hover:bg-white/80"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* View Tabs */}
          <Tabs defaultValue="all">
            <TabsList className="glass-effect p-1 h-12">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-white data-[state=active]:shadow-md"
              >
                All Templates
              </TabsTrigger>
              <TabsTrigger
                value="my"
                className="data-[state=active]:bg-white data-[state=active]:shadow-md"
              >
                My Templates
              </TabsTrigger>
              <TabsTrigger
                value="starred"
                className="data-[state=active]:bg-white data-[state=active]:shadow-md"
              >
                Starred
              </TabsTrigger>
              <TabsTrigger
                value="recent"
                className="data-[state=active]:bg-white data-[state=active]:shadow-md"
              >
                Recently Viewed
              </TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
              <TemplateGrid
                category={selectedCategory}
                searchQuery={searchQuery}
                sortBy={sortBy}
                userRole={currentUser?.role || "read"}
              />
            </TabsContent>
            <TabsContent value="my" className="mt-6">
              <TemplateGrid
                category={selectedCategory}
                searchQuery={searchQuery}
                sortBy={sortBy}
                userRole={currentUser?.role || "read"}
                filterByUser={currentUser?.id}
              />
            </TabsContent>
            <TabsContent value="starred" className="mt-6">
              <TemplateGrid
                category={selectedCategory}
                searchQuery={searchQuery}
                sortBy={sortBy}
                userRole={currentUser?.role || "read"}
                filterByStarred={true}
              />
            </TabsContent>
            <TabsContent value="recent" className="mt-6">
              <TemplateGrid
                category={selectedCategory}
                searchQuery={searchQuery}
                sortBy={sortBy}
                userRole={currentUser?.role || "read"}
                filterByRecent={true}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-background">
        <div className="container flex h-16 items-center justify-between">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Design Template Manager. All rights
            reserved.
          </p>
          <div className="flex items-center space-x-4">
            <a
              href="#"
              className="text-sm text-muted-foreground hover:underline"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:underline"
            >
              Privacy
            </a>
            <a
              href="#"
              className="text-sm text-muted-foreground hover:underline"
            >
              Help
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
