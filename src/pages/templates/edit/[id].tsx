import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Save, ArrowLeft, Eye, Image, Trash2, Clock, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TemplateAPI, CategoryAPI } from "@/lib/db";
import { AuthStorage } from "@/lib/auth";

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
  version: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface Category {
  id: string;
  name: string;
}

const TemplateEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isNewTemplate = id === "new";

  // State for template data
  const [template, setTemplate] = useState<Template>({
    id: "",
    title: "",
    category: "",
    description: "",
    designContext: "",
    systemImpacts: "",
    assumptions: "",
    outOfScope: "",
    otherAreasToConsider: "",
    appendix: "",
    version: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "Current User", // This would be replaced with actual user data
  });

  // State for categories
  const [categories, setCategories] = useState<Category[]>([
    { id: "1", name: "UI/UX" },
    { id: "2", name: "Architecture" },
    { id: "3", name: "System Design" },
    { id: "4", name: "Database" },
  ]);

  // State for editor
  const [activeTab, setActiveTab] = useState("basic");
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setTemplate((prev) => ({ ...prev, [name]: value }));
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setTemplate((prev) => ({ ...prev, [name]: value }));
  };

  // Handle rich text editor changes
  const handleEditorChange = (name: string, value: string) => {
    setTemplate((prev) => ({ ...prev, [name]: value }));
  };

  // Handle image upload
  const handleImageUpload = (field: string, file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      // Insert base64 image into the editor content
      const imageTag = `<img src="${reader.result}" alt="Uploaded image" />`;
      handleEditorChange(
        field,
        (template[field as keyof Template] as string) + imageTag,
      );
    };
    reader.readAsDataURL(file);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      // Validate required fields
      if (
        !template.title ||
        !template.category ||
        !template.description ||
        !template.designContext
      ) {
        throw new Error("Please fill in all required fields");
      }

      // Get current user
      const currentUser = AuthStorage.getUser();
      if (!currentUser) {
        throw new Error("You must be logged in to save templates");
      }

      if (isNewTemplate) {
        // Create new template
        const templateData = {
          title: template.title,
          description: template.description,
          content: template.designContext, // Map designContext to content
          category: template.category,
          tags: [], // You can add tags support later
          authorId: currentUser.id,
          authorName: currentUser.name,
          version: 1,
          isPublic: true, // Default to public, you can add a toggle for this
        };

        const newTemplate = await TemplateAPI.create(templateData);
        console.log("Template created successfully:", newTemplate);

        // Navigate to the new template's view page
        navigate(`/templates/${newTemplate._id}`);
      } else {
        // Update existing template
        const updates = {
          title: template.title,
          description: template.description,
          content: template.designContext,
          category: template.category,
        };

        const updatedTemplate = await TemplateAPI.updateById(id!, updates);
        console.log("Template updated successfully:", updatedTemplate);

        // Navigate to the template's view page
        navigate(`/templates/${id}`);
      }
    } catch (err) {
      console.error("Error saving template:", err);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while saving the template",
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Mock rich text editor component
  const RichTextEditor = ({
    value,
    onChange,
    field,
  }: {
    value: string;
    onChange: (value: string) => void;
    field: string;
  }) => {
    return (
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-lg border-b">
          <Button variant="ghost" size="sm" type="button" className="hover:bg-gray-200">
            <span className="font-bold text-gray-700">B</span>
          </Button>
          <Button variant="ghost" size="sm" type="button" className="hover:bg-gray-200">
            <span className="italic text-gray-700">I</span>
          </Button>
          <Button variant="ghost" size="sm" type="button" className="hover:bg-gray-200">
            <span className="underline text-gray-700">U</span>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button
            variant="ghost"
            size="sm"
            type="button"
            className="hover:bg-gray-200"
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) handleImageUpload(field, file);
              };
              input.click();
            }}
          >
            <Image className="h-4 w-4" />
            <span className="ml-1 text-gray-700">Image</span>
          </Button>
        </div>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[250px] font-mono text-sm border-0 focus:ring-0 resize-none"
          placeholder={`Enter ${field} content here...`}
        />
        <div className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">
          💡 HTML formatting is supported. Images will be encoded as base64.
        </div>
      </div>
    );
  };

  // Fetch template data if editing existing template
  useEffect(() => {
    const loadTemplate = async () => {
      if (id && id !== "new") {
        try {
          const templateData = await TemplateAPI.findById(id);
          if (templateData) {
            setTemplate({
              id: templateData._id || "",
              title: templateData.title,
              category: templateData.category,
              description: templateData.description,
              designContext: templateData.content,
              systemImpacts: "",
              assumptions: "",
              outOfScope: "",
              otherAreasToConsider: "",
              appendix: "",
              version: templateData.version,
              createdAt: templateData.createdAt.toString(),
              updatedAt: templateData.updatedAt.toString(),
              createdBy: templateData.authorName,
            });
          } else {
            setError("Template not found");
          }
        } catch (error) {
          console.error("Error loading template:", error);
          setError("Failed to load template");
        }
      }
    };

    const loadCategories = async () => {
      try {
        const categoriesData = await CategoryAPI.getAll();
        setCategories(categoriesData.map(cat => ({
          id: cat._id || "",
          name: cat.name,
        })));
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };

    loadTemplate();
    loadCategories();
  }, [id]);

  return (
    <div className="container mx-auto py-8 px-4 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/templates")}
              className="hover:bg-gray-100 border-gray-300"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              {isNewTemplate ? "Create New Template" : "Edit Template"}
            </h1>
            {!isNewTemplate && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full font-medium">
                  Version {template.version}
                </span>
                <Button variant="outline" size="sm" className="hover:bg-gray-100">
                  <Clock className="h-3 w-3 mr-1" />
                  History
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
              className="hover:bg-gray-100"
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? "Edit" : "Preview"}
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate(`/templates/${id}/clone`)}
              className="hover:bg-gray-100"
            >
              <Copy className="h-4 w-4 mr-2" />
              Clone
            </Button>

            <Button
              variant="destructive"
              onClick={() => {
                if (confirm("Are you sure you want to delete this template?")) {
                  navigate("/templates");
                }
              }}
              className="hover:bg-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>

            <Button 
              onClick={handleSubmit} 
              disabled={isSaving}
              className="bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6 border-red-300 bg-red-50">
            <AlertDescription className="text-red-700 font-medium">{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {showPreview ? (
            <Card className="bg-white shadow-lg border-0">
              <CardHeader className="bg-gradient-to-r from-violet-50 to-purple-50 border-b">
                <CardTitle className="text-2xl text-gray-800">{template.title || "Untitled Template"}</CardTitle>
                <div className="text-sm text-gray-600 font-medium">
                  Category:{" "}
                  {categories.find((c) => c.id === template.category)?.name ||
                    "Uncategorized"}
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium">Description</h3>
                    <p>{template.description}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Design Context</h3>
                    <div
                      dangerouslySetInnerHTML={{
                        __html: template.designContext,
                      }}
                    />
                  </div>

                  {template.systemImpacts && (
                    <div>
                      <h3 className="text-lg font-medium">System Impacts</h3>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: template.systemImpacts,
                        }}
                      />
                    </div>
                  )}

                  {template.assumptions && (
                    <div>
                      <h3 className="text-lg font-medium">Assumptions</h3>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: template.assumptions,
                        }}
                      />
                    </div>
                  )}

                  {template.outOfScope && (
                    <div>
                      <h3 className="text-lg font-medium">Out of Scope</h3>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: template.outOfScope,
                        }}
                      />
                    </div>
                  )}

                  {template.otherAreasToConsider && (
                    <div>
                      <h3 className="text-lg font-medium">
                        Other Areas to Consider
                      </h3>
                      <div
                        dangerouslySetInnerHTML={{
                          __html: template.otherAreasToConsider,
                        }}
                      />
                    </div>
                  )}

                  {template.appendix && (
                    <div>
                      <h3 className="text-lg font-medium">Appendix</h3>
                      <div
                        dangerouslySetInnerHTML={{ __html: template.appendix }}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="bg-white shadow-lg border-0">
              <CardContent className="pt-8">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-3 mb-8 bg-gray-100 p-1 rounded-lg">
                    <TabsTrigger value="basic" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Basic Information</TabsTrigger>
                    <TabsTrigger value="content" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Main Content</TabsTrigger>
                    <TabsTrigger value="additional" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">Additional Content</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-8">
                    <div className="grid grid-cols-1 gap-8">
                      <div className="space-y-3">
                        <Label htmlFor="title" className="text-lg font-semibold text-gray-700">Title *</Label>
                        <Input
                          id="title"
                          name="title"
                          value={template.title}
                          onChange={handleInputChange}
                          placeholder="Enter a descriptive title for your template"
                          required
                          className="text-lg p-4 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                        />
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="category" className="text-lg font-semibold text-gray-700">Category *</Label>
                        <Select
                          value={template.category}
                          onValueChange={(value) =>
                            handleSelectChange("category", value)
                          }
                        >
                          <SelectTrigger className="p-4 text-lg border-gray-300 focus:border-violet-500 focus:ring-violet-500">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category.id} value={category.name}>
                                {category.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-3">
                        <Label htmlFor="description" className="text-lg font-semibold text-gray-700">Description *</Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={template.description}
                          onChange={handleInputChange}
                          placeholder="Provide a detailed description of what this template is for and how it should be used"
                          required
                          className="min-h-[120px] text-lg p-4 border-gray-300 focus:border-violet-500 focus:ring-violet-500"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="content" className="space-y-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="designContext">Design Context *</Label>
                        <RichTextEditor
                          value={template.designContext}
                          onChange={(value) =>
                            handleEditorChange("designContext", value)
                          }
                          field="designContext"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="systemImpacts">System Impacts</Label>
                        <RichTextEditor
                          value={template.systemImpacts || ""}
                          onChange={(value) =>
                            handleEditorChange("systemImpacts", value)
                          }
                          field="systemImpacts"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="assumptions">Assumptions</Label>
                        <RichTextEditor
                          value={template.assumptions || ""}
                          onChange={(value) =>
                            handleEditorChange("assumptions", value)
                          }
                          field="assumptions"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="additional" className="space-y-6">
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="outOfScope">Out of Scope</Label>
                        <RichTextEditor
                          value={template.outOfScope || ""}
                          onChange={(value) =>
                            handleEditorChange("outOfScope", value)
                          }
                          field="outOfScope"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="otherAreasToConsider">
                          Other Areas to Consider
                        </Label>
                        <RichTextEditor
                          value={template.otherAreasToConsider || ""}
                          onChange={(value) =>
                            handleEditorChange("otherAreasToConsider", value)
                          }
                          field="otherAreasToConsider"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="appendix">Appendix</Label>
                        <RichTextEditor
                          value={template.appendix || ""}
                          onChange={(value) =>
                            handleEditorChange("appendix", value)
                          }
                          field="appendix"
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}

          <div className="mt-8 flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-8 py-4 text-lg font-semibold"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Template"}
            </Button>
          </div>
        </form>

        {!isNewTemplate && (
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="mt-6">
                <Clock className="h-4 w-4 mr-2" />
                View Version History
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Template Version History</DialogTitle>
              </DialogHeader>
              <ScrollArea className="h-[400px] mt-4">
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Card key={i} className="p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">
                            Version {template.version - i}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Updated on{" "}
                            {new Date(
                              new Date().setDate(new Date().getDate() - i * 5),
                            ).toLocaleDateString()}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Restore
                        </Button>
                      </div>
                      <div className="mt-2 text-sm">
                        {i === 0
                          ? "Current version"
                          : `Updated by John Doe - Added new section on ${i === 1 ? "system impacts" : "assumptions"}`}
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </motion.div>
    </div>
  );
};

export default TemplateEditor;
