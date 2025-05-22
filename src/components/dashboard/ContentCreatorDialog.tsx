import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel 
} from "@/components/ui/form";
import { FileText, Building2, Tag, Share2, Check, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useN8nAgent } from "@/hooks/useN8nAgent";
import { createContentPayload } from "@/utils/payloadUtils";
import { useN8nConfig } from "@/hooks/useN8nConfig";
import { supabase } from "@/integrations/supabase/client";

interface ContentCreatorDialogProps {
  onClose: () => void;
}

// Updated author personas from OfficeSpaceSoftware.com
const authorPersonas = [
  { id: "erica", name: "Erica Brown", role: "Chief People Officer", style: "People-focused with emphasis on workplace culture and employee experience" },
  { id: "andres", name: "Andres Avalos", role: "Chief Product Officer", style: "Technical and solution-oriented with product innovation focus" },
  { id: "tommy", name: "Tommy Coleman", role: "Vice President of Sales", style: "Results-driven with ROI emphasis and business benefits" },
  { id: "jess", name: "Jess Torres", role: "VP, Chief of Staff", style: "Strategic and operational with focus on implementation and best practices" }
];

// Content type descriptions with icons
const contentTypes = [
  { id: "pillar", name: "Pillar Content", icon: <FileText size={16} />, description: "Comprehensive guides on workplace management and space optimization" },
  { id: "support", name: "Support Pages", icon: <Building2 size={16} />, description: "Helpful documentation for software features and implementation guides" },
  { id: "meta", name: "Meta Tags", icon: <Tag size={16} />, description: "SEO-optimized titles and descriptions for office space software" },
  { id: "social", name: "Social Posts", icon: <Share2 size={16} />, description: "LinkedIn and Twitter content for office space software" },
];

const ContentCreatorDialog: React.FC<ContentCreatorDialogProps> = ({ onClose }) => {
  const [contentType, setContentType] = useState("pillar");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [contentWebhookUrl, setContentWebhookUrl] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { getContentWebhookUrl } = useN8nConfig();
  const { sendToN8n, isLoading: isN8nLoading } = useN8nAgent();
  
  // Effect to get content webhook URL on component mount
  useEffect(() => {
    const webhookUrl = getContentWebhookUrl();
    console.log("Dialog: Content webhook URL from config:", webhookUrl);
    setContentWebhookUrl(webhookUrl);
  }, []);
  
  const form = useForm({
    defaultValues: {
      keywords: "",
      author: "erica",
      context: "",
    }
  });
  
  const onSubmit = async (data: any) => {
    setIsGenerating(true);
    setGeneratedContent("");
    
    try {
      // Get the most current webhook URL
      const currentWebhookUrl = getContentWebhookUrl();
      
      // Create content payload
      const payload = createContentPayload({
        content_type: contentType,
        topic: data.keywords,
        primary_keyword: data.keywords,
        related_keywords: data.keywords,
        tone: "Professional",
        goal: data.context,
        brand_voice: "Professional and helpful"
      });
      
      const selectedAuthor = authorPersonas.find(a => a.id === data.author);
      const selectedType = contentTypes.find(t => t.id === contentType);
      
      toast({
        title: "Generating Content",
        description: `Creating ${selectedType?.name} content via n8n AI agent...`,
      });
      
      console.log("Using webhook URL:", currentWebhookUrl);
      
      const result = await sendToN8n({
        customPayload: payload
      }, true); // Changed from currentWebhookUrl to true to use content webhook
      
      // Check if we got a response with content
      if (result && result.content && result.content.length > 0) {
        setGeneratedContent(result.content[0].output || "");
      } else if (result && result.rawResponse) {
        setGeneratedContent(result.rawResponse);
      } else {
        // Fall back to mock content generation if webhook fails
        generateMockContent(data);
      }
      
      toast({
        title: "Content Generated",
        description: `${selectedType?.name} content has been created successfully.`,
      });
    } catch (error) {
      console.error("Error generating content via webhook:", error);
      
      // Fall back to mock content generation
      generateMockContent(data);
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Fallback mock content generator
  const generateMockContent = (data: any) => {
    const selectedType = contentTypes.find(t => t.id === contentType);
    
    // Create mock generated content based on inputs
    let content = "";
    if (contentType === "pillar") {
      content = `# The Complete Guide to ${data.keywords}\n\n## Introduction\nOptimizing office space is critical for modern businesses looking to maximize productivity...\n\n## Key Benefits\n1. Improved space utilization\n2. Enhanced employee satisfaction\n3. Reduced operational costs\n\n## Best Practices\nImplementing effective workspace management requires a strategic approach...`;
    } else if (contentType === "support") {
      content = `# How to Use Our ${data.keywords} Features\n\n## Getting Started\n1. Set up your floor plans\n2. Import employee data\n3. Configure booking rules\n\n## Troubleshooting\nIf you encounter issues with reservations...`;
    } else if (contentType === "meta") {
      content = `Title: Ultimate ${data.keywords} Guide: Optimize Your Workplace in 2024\n\nMeta Description: Discover how our ${data.keywords} solutions can transform your workplace management. Learn about key features, ROI, and implementation strategies.`;
    } else {
      content = `LinkedIn:\n🏢 Struggling with office space efficiency? Our ${data.keywords} just analyzed data from 1000+ companies. Here's what works:\n\n✅ Flexible seating arrangements\n✅ Data-driven space allocation\n✅ Integrated booking systems\n\nLearn more: [link]`;
    }
    
    setGeneratedContent(content);
  };
  
  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      if (!generatedContent || generatedContent.trim().length === 0) {
        toast({
          title: "No Content to Save",
          description: "Please generate content first",
          variant: "destructive"
        });
        return;
      }
      
      console.log(`ContentCreatorDialog: Saving content with type: ${contentType}`);
      
      const selectedType = contentTypes.find(t => t.id === contentType);
      
      const { data, error } = await supabase
        .from('content_library')
        .insert([
          {
            content: generatedContent,
            content_type: contentType, // Use the current tab as content type
            is_saved: true,
            title: `${selectedType?.name || contentType} content`,
            topic_area: 'workspace-management',
            keywords: []
          }
        ])
        .select()
        .single();
      
      if (error) throw error;
      
      // Dispatch event to notify other components about content update
      window.dispatchEvent(new CustomEvent('content-updated'));
      
      toast({
        title: "Content Saved",
        description: `Your ${selectedType?.name || contentType} has been saved to your library.`,
      });
      
      onClose();
    } catch (error) {
      console.error("Error saving content:", error);
      toast({
        title: "Error Saving Content",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="py-4">
      <Tabs value={contentType} onValueChange={setContentType} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          {contentTypes.map(type => (
            <TabsTrigger 
              key={type.id} 
              value={type.id}
              className="flex items-center gap-1.5"
            >
              {type.icon}
              <span>{type.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            {contentTypes.find(t => t.id === contentType)?.description}
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="keywords"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Keywords</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., desk booking system, workplace management" {...field} />
                  </FormControl>
                  <FormDescription>Enter primary keywords separated by commas</FormDescription>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Author Persona</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select author" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {authorPersonas.map(author => (
                        <SelectItem key={author.id} value={author.id}>
                          <div className="flex flex-col">
                            <span>{author.name}</span>
                            <span className="text-xs text-muted-foreground">{author.style}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    The author persona will influence content style and tone
                  </FormDescription>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content Context</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Provide context about your target audience, purpose of the content, and any specific points to include..." 
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <div className="flex justify-end pt-2">
              <Button type="submit" disabled={isGenerating || isN8nLoading}>
                {isGenerating || isN8nLoading ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Generating via n8n AI agent...
                  </>
                ) : (
                  <>
                    Generate {contentTypes.find(t => t.id === contentType)?.name}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
        
        {generatedContent && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium">Generated Content</h3>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  Regenerate
                </Button>
                <Button variant="outline" size="sm" onClick={() => {
                  navigator.clipboard.writeText(generatedContent);
                  toast({
                    title: "Copied",
                    description: "Content copied to clipboard",
                  });
                }}>
                  Copy
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Save <Check size={14} className="ml-1.5" />
                </Button>
              </div>
            </div>
            <Textarea 
              value={generatedContent}
              onChange={(e) => setGeneratedContent(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
          </div>
        )}
      </Tabs>
    </div>
  );
};

export default ContentCreatorDialog;
