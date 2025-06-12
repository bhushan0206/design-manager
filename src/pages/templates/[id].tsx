import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Download,
  Edit,
  Star,
  MessageSquare,
  Share2,
  Clock,
  Bookmark,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  MoreHorizontal,
  Heart,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Comment {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  content: string;
  createdAt: string;
}

interface Version {
  id: string;
  versionNumber: string;
  updatedAt: string;
  updatedBy: string;
}

interface Template {
  id: string;
  title: string;
  category: string;
  description: string;
  designContext: string;
  systemImpacts?: string;
  assumptions?: string;
  outOfScope?: string;
  otherAreasToConsider?: string;
  appendix?: string;
  author: {
    name: string;
    avatar: string;
  };
  createdAt: string;
  updatedAt: string;
  versions: Version[];
  bookmarks: number;
  stars: number;
  comments: Comment[];
  isStarred: boolean;
  isBookmarked: boolean;
}

const TemplateDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [template, setTemplate] = useState<Template>({
    id: id || "1",
    title: "User Authentication Flow Template",
    category: "Authentication",
    description:
      "A comprehensive design template for implementing secure user authentication flows in web applications.",
    designContext:
      '<div><h2>Design Context</h2><p>This authentication flow is designed for web applications requiring secure user access with multiple authentication options.</p><img src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&q=80" alt="Authentication Flow Diagram" /><p>The flow supports email/password, social logins, and two-factor authentication methods.</p></div>',
    systemImpacts:
      "<div><h2>System Impacts</h2><p>Implementation of this authentication system will impact:</p><ul><li>User database schema</li><li>API security layers</li><li>Session management</li><li>Frontend routing guards</li></ul></div>",
    assumptions:
      "<div><h2>Assumptions</h2><p>This design assumes:</p><ul><li>HTTPS is implemented across all endpoints</li><li>Database encryption for sensitive user data</li><li>Compliance with GDPR and other privacy regulations</li></ul></div>",
    outOfScope:
      "<div><h2>Out of Scope</h2><p>The following items are not covered in this design:</p><ul><li>Enterprise SSO integration</li><li>Biometric authentication</li><li>Hardware security keys</li></ul></div>",
    otherAreasToConsider:
      "<div><h2>Other Areas to Consider</h2><p>When implementing this design, also consider:</p><ul><li>Rate limiting for login attempts</li><li>Account recovery processes</li><li>Session timeout policies</li></ul></div>",
    appendix:
      "<div><h2>Appendix</h2><p>Additional resources:</p><ul><li>OWASP Authentication Best Practices</li><li>NIST Password Guidelines</li><li>Sample implementation code</li></ul></div>",
    author: {
      name: "Alex Johnson",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    },
    createdAt: "2023-09-15",
    updatedAt: "2023-10-22",
    versions: [
      {
        id: "v3",
        versionNumber: "1.2",
        updatedAt: "2023-10-22",
        updatedBy: "Alex Johnson",
      },
      {
        id: "v2",
        versionNumber: "1.1",
        updatedAt: "2023-10-05",
        updatedBy: "Alex Johnson",
      },
      {
        id: "v1",
        versionNumber: "1.0",
        updatedAt: "2023-09-15",
        updatedBy: "Alex Johnson",
      },
    ],
    bookmarks: 24,
    stars: 42,
    comments: [
      {
        id: "c1",
        author: {
          name: "Sarah Miller",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
        },
        content:
          "Great template! I especially like the consideration for different authentication methods.",
        createdAt: "2023-10-18",
      },
      {
        id: "c2",
        author: {
          name: "David Chen",
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
        },
        content: "Have you considered adding WebAuthn support to this flow?",
        createdAt: "2023-10-20",
      },
    ],
    isStarred: true,
    isBookmarked: false,
  });

  const [showVersions, setShowVersions] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [newComment, setNewComment] = useState("");
  const [userRole, setUserRole] = useState("read-write"); // Simulated user role: 'read', 'read-write', 'admin'

  const handleEditClick = () => {
    navigate(`/templates/edit/${id}`);
  };

  const handleBackClick = () => {
    navigate("/");
  };

  const handleExportPDF = () => {
    // Placeholder for PDF export functionality
    console.log("Exporting template as PDF");
  };

  const handleExportMarkdown = () => {
    // Placeholder for Markdown export functionality
    console.log("Exporting template as Markdown");
  };

  const handleToggleStar = () => {
    setTemplate((prev) => ({
      ...prev,
      isStarred: !prev.isStarred,
      stars: prev.isStarred ? prev.stars - 1 : prev.stars + 1,
    }));
  };

  const handleToggleBookmark = () => {
    setTemplate((prev) => ({
      ...prev,
      isBookmarked: !prev.isBookmarked,
      bookmarks: prev.isBookmarked ? prev.bookmarks - 1 : prev.bookmarks + 1,
    }));
  };

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const newCommentObj: Comment = {
      id: `c${template.comments.length + 1}`,
      author: {
        name: "Current User",
        avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser",
      },
      content: newComment,
      createdAt: new Date().toISOString().split("T")[0],
    };

    setTemplate((prev) => ({
      ...prev,
      comments: [...prev.comments, newCommentObj],
    }));

    setNewComment("");
  };

  const canEdit = userRole === "read-write" || userRole === "admin";

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto py-8 px-4 md:px-6">
        {/* Back button and actions row */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <Button
            variant="ghost"
            onClick={handleBackClick}
            className="flex items-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Templates
          </Button>

          <div className="flex flex-wrap gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={template.isStarred ? "default" : "outline"}
                    size="sm"
                    onClick={handleToggleStar}
                    className="flex items-center gap-1"
                  >
                    <Star
                      className={`h-4 w-4 ${template.isStarred ? "fill-primary-foreground" : ""}`}
                    />
                    <span>{template.stars}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {template.isStarred ? "Unstar" : "Star"} this template
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={template.isBookmarked ? "default" : "outline"}
                    size="sm"
                    onClick={handleToggleBookmark}
                    className="flex items-center gap-1"
                  >
                    <Bookmark
                      className={`h-4 w-4 ${template.isBookmarked ? "fill-primary-foreground" : ""}`}
                    />
                    <span>{template.bookmarks}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {template.isBookmarked ? "Remove bookmark" : "Bookmark"} this
                  template
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>Copy link</DropdownMenuItem>
                <DropdownMenuItem>Share via email</DropdownMenuItem>
                <DropdownMenuItem>Embed template</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleExportPDF}>
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportMarkdown}>
                  Export as Markdown
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {canEdit && (
              <Button onClick={handleEditClick} size="sm">
                <Edit className="h-4 w-4 mr-1" />
                Edit Template
              </Button>
            )}
          </div>
        </div>

        {/* Template header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold">{template.title}</h1>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary">{template.category}</Badge>
                <div className="text-sm text-muted-foreground flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Updated {template.updatedAt}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={template.author.avatar}
                  alt={template.author.name}
                />
                <AvatarFallback>
                  {template.author.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium">
                  {template.author.name}
                </div>
                <div className="text-xs text-muted-foreground">Author</div>
              </div>
            </div>
          </div>

          <p className="text-muted-foreground">{template.description}</p>

          {/* Version history toggle */}
          {(userRole === "read-write" || userRole === "admin") && (
            <div className="mt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVersions(!showVersions)}
                className="flex items-center gap-1 text-sm"
              >
                {showVersions ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
                Version History ({template.versions.length})
              </Button>

              {showVersions && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-2 border rounded-md p-2 bg-muted/30"
                >
                  <div className="text-sm font-medium mb-2">
                    Version History
                  </div>
                  {template.versions.map((version) => (
                    <div
                      key={version.id}
                      className="flex justify-between items-center py-1 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {version.versionNumber}
                        </Badge>
                        <span>by {version.updatedBy}</span>
                      </div>
                      <span className="text-muted-foreground text-xs">
                        {version.updatedAt}
                      </span>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Template content tabs */}
        <Tabs
          defaultValue="content"
          className="mb-8"
          onValueChange={setActiveTab}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="comments">
              Comments ({template.comments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-8">
            {/* Design Context */}
            <Card>
              <CardContent className="pt-6">
                <div
                  dangerouslySetInnerHTML={{ __html: template.designContext }}
                />
              </CardContent>
            </Card>

            {/* System Impacts */}
            {template.systemImpacts && (
              <Card>
                <CardContent className="pt-6">
                  <div
                    dangerouslySetInnerHTML={{ __html: template.systemImpacts }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Assumptions */}
            {template.assumptions && (
              <Card>
                <CardContent className="pt-6">
                  <div
                    dangerouslySetInnerHTML={{ __html: template.assumptions }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Out of Scope */}
            {template.outOfScope && (
              <Card>
                <CardContent className="pt-6">
                  <div
                    dangerouslySetInnerHTML={{ __html: template.outOfScope }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Other Areas to Consider */}
            {template.otherAreasToConsider && (
              <Card>
                <CardContent className="pt-6">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: template.otherAreasToConsider,
                    }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Appendix */}
            {template.appendix && (
              <Card>
                <CardContent className="pt-6">
                  <div
                    dangerouslySetInnerHTML={{ __html: template.appendix }}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="comments">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Comments</h3>

                {/* Comment list */}
                <div className="space-y-4 mb-6">
                  {template.comments.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={comment.author.avatar}
                          alt={comment.author.name}
                        />
                        <AvatarFallback>
                          {comment.author.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">
                            {comment.author.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {comment.createdAt}
                          </div>
                        </div>
                        <p className="text-sm mt-1">{comment.content}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                          >
                            <Heart className="h-3 w-3 mr-1" />
                            Like
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                          >
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comment form */}
                <form onSubmit={handleSubmitComment} className="mt-4">
                  <div className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=CurrentUser"
                        alt="Current User"
                      />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <textarea
                        className="w-full p-2 border rounded-md text-sm min-h-[80px] focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                      />
                      <div className="flex justify-end mt-2">
                        <Button
                          type="submit"
                          size="sm"
                          disabled={!newComment.trim()}
                        >
                          Post Comment
                        </Button>
                      </div>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Related templates section */}
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Related Templates</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card
                key={i}
                className="cursor-pointer hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4">
                  <h4 className="font-medium truncate">Related Template {i}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                    A brief description of a related template that users might
                    be interested in.
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="outline" className="text-xs">
                      Category
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Star className="h-3 w-3" />
                      <span>{Math.floor(Math.random() * 50)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateDetail;
