import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { TemplateService, CommentService } from "@/lib/api";
import { AuthStorage } from "@/lib/auth";
import type { Template, Comment } from "@/lib/db";
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
  const [template, setTemplate] = useState<Template | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStarred, setIsStarred] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const [showVersions, setShowVersions] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  const [newComment, setNewComment] = useState("");
  const [userRole, setUserRole] = useState("read");
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Load template data
  useEffect(() => {
    const loadTemplate = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);

        const user = AuthStorage.getUser();
        setCurrentUser(user);
        setUserRole(user?.role || "read");

        const templateData = await TemplateService.getTemplateById(
          id,
          user?.id,
        );
        if (!templateData) {
          setError("Template not found");
          return;
        }

        setTemplate(templateData);
        setIsStarred((templateData as any).isStarred || false);
        setIsBookmarked((templateData as any).isBookmarked || false);

        // Load comments
        const commentsData = await CommentService.getCommentsByTemplate(id);
        setComments(commentsData);
      } catch (err) {
        console.error("Error loading template:", err);
        setError("Failed to load template");
      } finally {
        setLoading(false);
      }
    };

    loadTemplate();
  }, [id]);

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

  const handleToggleStar = async () => {
    if (!template || !currentUser) return;

    try {
      const result = await TemplateService.toggleStar(
        template._id!,
        currentUser.id,
      );
      setIsStarred(result.isStarred);
      setTemplate((prev) =>
        prev ? { ...prev, starCount: result.starCount } : null,
      );
    } catch (err) {
      console.error("Error toggling star:", err);
    }
  };

  const handleToggleBookmark = async () => {
    if (!template || !currentUser) return;

    try {
      const result = await TemplateService.toggleBookmark(
        template._id!,
        currentUser.id,
      );
      setIsBookmarked(result.isBookmarked);
      setTemplate((prev) =>
        prev ? { ...prev, bookmarkCount: result.bookmarkCount } : null,
      );
    } catch (err) {
      console.error("Error toggling bookmark:", err);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !template || !currentUser) return;

    try {
      const comment = await CommentService.createComment({
        templateId: template._id!,
        authorId: currentUser.id,
        authorName: currentUser.name,
        content: newComment.trim(),
      });

      setComments((prev) => [...prev, comment]);
      setNewComment("");
    } catch (err) {
      console.error("Error creating comment:", err);
    }
  };

  const canEdit = userRole === "read-write" || userRole === "admin";

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading template...</p>
        </div>
      </div>
    );
  }

  if (error || !template) {
    return (
      <div className="bg-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Template Not Found</h1>
          <p className="text-muted-foreground mb-4">
            {error || "The template you are looking for does not exist."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="text-primary hover:underline"
          >
            Go back to templates
          </button>
        </div>
      </div>
    );
  }

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
                    variant={isStarred ? "default" : "outline"}
                    size="sm"
                    onClick={handleToggleStar}
                    className="flex items-center gap-1"
                    disabled={!currentUser}
                  >
                    <Star
                      className={`h-4 w-4 ${isStarred ? "fill-primary-foreground" : ""}`}
                    />
                    <span>{template.starCount}</span>
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
                    variant={isBookmarked ? "default" : "outline"}
                    size="sm"
                    onClick={handleToggleBookmark}
                    className="flex items-center gap-1"
                    disabled={!currentUser}
                  >
                    <Bookmark
                      className={`h-4 w-4 ${isBookmarked ? "fill-primary-foreground" : ""}`}
                    />
                    <span>{template.bookmarkCount}</span>
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
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${template.authorName}`}
                  alt={template.authorName}
                />
                <AvatarFallback>{template.authorName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium">{template.authorName}</div>
                <div className="text-xs text-muted-foreground">Author</div>
              </div>
            </div>
          </div>

          <p className="text-muted-foreground">{template.description}</p>

          {/* Version info */}
          <div className="mt-4">
            <div className="text-sm text-muted-foreground">
              Version {template.version} • Created{" "}
              {new Date(template.createdAt).toLocaleDateString()}
            </div>
          </div>
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
              Comments ({comments.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-8">
            {/* Template Content */}
            <Card>
              <CardContent className="pt-6">
                <div dangerouslySetInnerHTML={{ __html: template.content }} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments">
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-medium mb-4">Comments</h3>

                {/* Comment list */}
                <div className="space-y-4 mb-6">
                  {comments.map((comment) => (
                    <div key={comment._id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.authorName}`}
                          alt={comment.authorName}
                        />
                        <AvatarFallback>
                          {comment.authorName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">
                            {comment.authorName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleDateString()}
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
