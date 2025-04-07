
import React, { useState } from "react";
import { File, User, Edit, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";

// Updated author personas from OfficeSpaceSoftware.com
const authorPersonas = [
  { id: "erica", name: "Erica Brown", role: "Chief People Officer", style: "People-focused with emphasis on workplace culture and employee experience" },
  { id: "andres", name: "Andres Avalos", role: "Chief Product Officer", style: "Technical and solution-oriented with product innovation focus" },
  { id: "tommy", name: "Tommy Coleman", role: "Vice President of Sales", style: "Results-driven with ROI emphasis and business benefits" },
  { id: "jess", name: "Jess Torres", role: "VP, Chief of Staff", style: "Strategic and operational with focus on implementation and best practices" }
];

// Content type descriptions
const contentTypes = [
  { id: "pillar", name: "Pillar Content", description: "Comprehensive, authoritative content (2000+ words)" },
  { id: "support", name: "Support Pages", description: "Helpful guides and documentation (800-1500 words)" },
  { id: "meta", name: "Meta Tags", description: "SEO-optimized titles and descriptions" },
  { id: "social", name: "Social Posts", description: "Engaging platform-specific social content" },
];

interface ManualContentCreatorProps {
  className?: string;
}

const ManualContentCreator: React.FC<ManualContentCreatorProps> = ({ className }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  
  const form = useForm({
    defaultValues: {
      keywords: "",
      contentType: "pillar",
      context: "",
      author: "erica",
      tone: "professional"
    }
  });
  
  const onSubmit = (data: any) => {
    setIsGenerating(true);
    setGeneratedContent("");
    
    // Simulate AI generation with delay
    setTimeout(() => {
      const selectedAuthor = authorPersonas.find(a => a.id === data.author);
      const selectedType = contentTypes.find(t => t.id === data.contentType);
      
      // Create mock generated content based on inputs
      let content = "";
      if (data.contentType === "pillar") {
        content = `# The Complete Guide to ${data.keywords}\n\n## Introduction\nOptimizing office space is critical for modern businesses looking to maximize productivity...\n\n## Key Benefits\n1. Improved space utilization\n2. Enhanced employee satisfaction\n3. Reduced operational costs\n\n## Best Practices\nImplementing effective workspace management requires a strategic approach...`;
      } else if (data.contentType === "support") {
        content = `# How to Use Our ${data.keywords} Features\n\n## Getting Started\n1. Set up your floor plans\n2. Import employee data\n3. Configure booking rules\n\n## Troubleshooting\nIf you encounter issues with reservations...`;
      } else if (data.contentType === "meta") {
        content = `Title: Ultimate ${data.keywords} Guide: Optimize Your Workplace in 2024\n\nMeta Description: Discover how our ${data.keywords} solutions can transform your workplace management. Learn about key features, ROI, and implementation strategies.`;
      } else {
        content = `LinkedIn:\n🏢 Struggling with office space efficiency? Our ${data.keywords} just analyzed data from 1000+ companies. Here's what works:\n\n✅ Flexible seating arrangements\n✅ Data-driven space allocation\n✅ Integrated booking systems\n\nLearn more: [link]`;
      }
      
      setGeneratedContent(content);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className={cn("rounded-xl border border-border bg-card p-6 animate-slide-up animation-delay-500", className)}>
      <h3 className="text-lg font-semibold mb-6">Manual Content Creator</h3>
      
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="contentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select content type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {contentTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>
                          <div className="flex flex-col">
                            <span>{type.name}</span>
                            <span className="text-xs text-muted-foreground">{type.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
          </div>
          
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
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate Content <Edit size={16} className="ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
      
      {generatedContent && (
        <Card className="mt-6 animate-fade-in">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Generated Content</CardTitle>
            <CardDescription>
              Based on your specified keywords and parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea 
              value={generatedContent} 
              onChange={(e) => setGeneratedContent(e.target.value)}
              className="min-h-[200px] font-mono text-sm"
            />
          </CardContent>
          <CardFooter className="flex justify-end pt-3">
            <Button variant="outline" size="sm" className="mr-2">
              Regenerate
            </Button>
            <Button size="sm">
              <Save size={14} className="mr-2" /> Save Content
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default ManualContentCreator;
