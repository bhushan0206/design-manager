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

  // Fetch template data if editing existing template
  useEffect(() => {
    if (id && id !== "new") {
      // This would be replaced with an actual API call
      // fetchTemplate(id).then(data => setTemplate(data));
      console.log(`Fetching template with ID: ${id}`);
      // Simulating API call with timeout
      setTimeout(() => {
        setTemplate({
          id,
          title: "Example Template",
          category: "1",
          description:
            "This is an example template for demonstration purposes.",
          designContext:
            "<p>Design context goes here with <strong>formatting</strong>.</p>",
          systemImpacts: "<p>System impacts details...</p>",
          assumptions: "<p>Assumptions about the design...</p>",
          outOfScope: "<p>Features that are out of scope...</p>",
          otherAreasToConsider: "<p>Other considerations...</p>",
          appendix: "<p>Additional information...</p>",
          version: 2,
          createdAt: "2023-06-15T10:30:00Z",
          updatedAt: "2023-07-20T14:45:00Z",
          createdBy: "John Doe",
        });
      }, 500);
    }
  }, [id]);

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

      // This would be replaced with an actual API call
      // const response = await saveTemplate(template);
      console.log("Saving template:", template);

      // Simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Navigate back to template view
      navigate(`/templates/${isNewTemplate ? "new-id-from-server" : id}`);
    } catch (err) {
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
    // This would be replaced with an actual rich text editor component
    return (
      <div className="border rounded-md p-2 bg-background">
        <div className="flex items-center gap-2 mb-2 p-1 border-b">
          <Button variant="ghost" size="sm" type="button">
            <span className="font-bold">B</span>
          </Button>
          <Button variant="ghost" size="sm" type="button">
            <span className="italic">I</span>
          </Button>
          <Button variant="ghost" size="sm" type="button">
            <span className="underline">U</span>
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <Button
            variant="ghost"
            size="sm"
            type="button"
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
            <span className="ml-1">Image</span>
          </Button>
        </div>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[200px] font-mono text-sm"
          placeholder={`Enter ${field} content here...`}
        />
        <div className="text-xs text-muted-foreground mt-1">
          HTML formatting is supported. Images will be encoded as base64.
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4 bg-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => navigate("/templates")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold">
              {isNewTemplate ? "Create New Template" : "Edit Template"}
            </h1>
            {!isNewTemplate && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Version {template.version}
                </span>
                <Button variant="outline" size="sm">
                  <Clock className="h-3 w-3 mr-1" />
                  History
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="h-4 w-4 mr-2" />
              {showPreview ? "Edit" : "Preview"}
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate(`/templates/${id}/clone`)}
            >
              <Copy className="h-4 w-4 mr-2" />
              Clone
            </Button>

            <Button
              variant="destructive"
              onClick={() => {
                if (confirm("Are you sure you want to delete this template?")) {
                  // Delete logic would go here
                  navigate("/templates");
                }
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>

            <Button onClick={handleSubmit} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {showPreview ? (
            <Card>
              <CardHeader>
                <CardTitle>{template.title || "Untitled Template"}</CardTitle>
                <div className="text-sm text-muted-foreground">
                  Category:{" "}
                  {categories.find((c) => c.id === template.category)?.name ||
                    "Uncategorized"}
                </div>
              </CardHeader>
              <CardContent>
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
            <Card>
              <CardContent className="pt-6">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-3 mb-6">
                    <TabsTrigger value="basic">Basic Information</TabsTrigger>
                    <TabsTrigger value="content">Main Content</TabsTrigger>
                    <TabsTrigger value="additional">
                      Additional Content
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title *</Label>
                        <Input
                          id="title"
                          name="title"
                          value={template.title}
                          onChange={handleInputChange}
                          placeholder="Enter template title"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select
                          value={template.category}
                          onValueChange={(value) =>
                            handleSelectChange("category", value)
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
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

                      <div className="space-y-2">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                          id="description"
                          name="description"
                          value={template.description}
                          onChange={handleInputChange}
                          placeholder="Enter a brief description of the template"
                          required
                          className="min-h-[100px]"
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

          <div className="mt-6 flex justify-end">
            <Button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto"
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
