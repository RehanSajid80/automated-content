import React, { useState, useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Target, TrendingUp, Clock, Building2, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useN8nAgent } from "@/hooks/useN8nAgent";
import DashboardHeader from "./DashboardHeader";

interface ContentItem {
  id: string;
  title: string;
  content: string;
  content_type: string;
  topic_area: string;
  keywords: string[];
  created_at: string;
}

const ContentAdjustmentTab = () => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(null);
  const [adjustmentPrompt, setAdjustmentPrompt] = useState("");
  const [selectedTone, setSelectedTone] = useState("");
  const [selectedFormat, setSelectedFormat] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [activeContentType, setActiveContentType] = useState("pillar");

  const { sendToN8n, isLoading: n8nLoading } = useN8nAgent();

  const contentTypes = [
    { id: "pillar", label: "Pillar Content", icon: <Pencil className="h-4 w-4" /> },
    { id: "support", label: "Support Pages", icon: <Building2 className="h-4 w-4" /> },
    { id: "meta", label: "Meta Tags", icon: <TrendingUp className="h-4 w-4" /> },
    { id: "social", label: "Social Posts", icon: <Target className="h-4 w-4" /> },
    { id: "email", label: "Emails", icon: <Clock className="h-4 w-4" /> }
  ];

  const toneOptions = [
    { value: "facility-manager", label: "Facility Manager (Operational Focus)" },
    { value: "it-director", label: "IT Director (Technical Focus)" },
    { value: "workplace-strategist", label: "Workplace Strategist (Strategic Focus)" },
    { value: "ceo-executive", label: "CEO/Executive (Business Impact)" },
    { value: "hr-director", label: "HR Director (Employee Experience)" }
  ];

  const formatOptions = [
    { value: "email", label: "Email (Short & Direct)" },
    { value: "social", label: "Social Media (Engaging & Brief)" },
    { value: "landing-page", label: "Landing Page (Comprehensive)" },
    { value: "blog-post", label: "Blog Post (Educational)" },
    { value: "checklist", label: "Checklist (Actionable)" }
  ];

  const examplePrompts = [
    "Rewrite the introduction to speak directly to facilities managers in large enterprises.",
    "Add examples relevant to hybrid workplace management in healthcare or higher education.",
    "Turn this section into a 3-bullet checklist for optimizing space utilization.",
    "Improve SEO by adding keywords like 'workspace management software', 'employee wayfinding', and 'return to office strategy'.",
    "Make this section sound more consultative and data-backed for IT decision-makers.",
    "Add ROI metrics and cost-benefit analysis for C-level executives.",
    "Include employee satisfaction and wellness benefits for HR leaders."
  ];

  useEffect(() => {
    fetchContentItems();
  }, []);

  const fetchContentItems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('content_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContentItems(data || []);
      
      // Auto-select first item of the active content type
      const firstItemOfType = data?.find(item => item.content_type === activeContentType);
      if (firstItemOfType) {
        setSelectedContent(firstItemOfType);
      }
    } catch (error) {
      console.error("Error fetching content:", error);
      toast({
        title: "Error",
        description: "Failed to load content items",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentTypeChange = (contentType: string) => {
    setActiveContentType(contentType);
    const firstItemOfType = contentItems.find(item => item.content_type === contentType);
    setSelectedContent(firstItemOfType || null);
  };

  const handleAdjustContent = async () => {
    if (!selectedContent || !adjustmentPrompt.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select content and provide adjustment instructions",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create the payload that will be sent to the webhook
      const webhookPayload = {
        requestType: 'contentAdjustment',
        contentId: selectedContent.id,
        originalContent: {
          title: selectedContent.title,
          content: selectedContent.content,
          contentType: selectedContent.content_type,
          topicArea: selectedContent.topic_area,
          keywords: selectedContent.keywords
        },
        adjustmentInstructions: {
          prompt: adjustmentPrompt,
          targetPersona: selectedTone,
          targetFormat: selectedFormat
        },
        context: {
          source: "content-adjustment-panel",
          timestamp: new Date().toISOString(),
          userId: "user-123" // You might want to get this from auth context
        }
      };

      console.log("Content Adjustment Webhook Payload:", JSON.stringify(webhookPayload, null, 2));
      
      toast({
        title: "Adjusting Content",
        description: "Sending content to AI for adjustment..."
      });
      
      const result = await sendToN8n(webhookPayload, 'content-adjustment');
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Handle successful response
      if (result.content && result.content.length > 0) {
        toast({
          title: "Content Adjusted Successfully",
          description: "Your content has been enhanced based on your instructions"
        });
        
        // Optionally update the content in the database or state
        // You might want to save the adjusted content back to the database
      }
      
      setAdjustmentPrompt("");
      setSelectedTone("");
      setSelectedFormat("");
    } catch (error) {
      console.error("Error adjusting content:", error);
      toast({
        title: "Adjustment Failed",
        description: "Failed to adjust content. Please try again.",
        variant: "destructive"
      });
    }
  };

  const filteredContent = contentItems.filter(item => item.content_type === activeContentType);

  return (
    <TabsContent value="analytics" className="m-0">
      <div className="container py-8 px-4 md:px-6 lg:px-8">
        <DashboardHeader 
          title="📝 Content Adjustment Panel"
          description="Review and enhance your AI-generated content below. You can edit directly or give instructions to the AI to refine sections."
        />
        
        <div className="space-y-6">
          {/* Content Type Tabs */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5" />
                Select Content Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={activeContentType} onValueChange={handleContentTypeChange}>
                <TabsList className="grid grid-cols-5 w-full">
                  {contentTypes.map(type => (
                    <TabsTrigger key={type.id} value={type.id} className="flex items-center gap-2">
                      {type.icon}
                      <span className="hidden sm:inline">{type.label}</span>
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Content Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Available {contentTypes.find(t => t.id === activeContentType)?.label}</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded" />
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                  </div>
                ) : filteredContent.length > 0 ? (
                  <div className="space-y-3">
                    {filteredContent.map(item => (
                      <div
                        key={item.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedContent?.id === item.id 
                            ? "border-primary bg-primary/5" 
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedContent(item)}
                      >
                        <h4 className="font-medium text-sm">{item.title}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.content.substring(0, 100)}...
                        </p>
                        <div className="flex gap-1 mt-2">
                          {item.keywords.slice(0, 3).map((keyword, i) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {keyword}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No {contentTypes.find(t => t.id === activeContentType)?.label.toLowerCase()} available. 
                    Generate some content first.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Adjustment Panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Content Adjustment Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tone Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    🎯 Target Persona
                  </label>
                  <Select value={selectedTone} onValueChange={setSelectedTone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target persona..." />
                    </SelectTrigger>
                    <SelectContent>
                      {toneOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Format Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    ⏱ Content Format
                  </label>
                  <Select value={selectedFormat} onValueChange={setSelectedFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select format..." />
                    </SelectTrigger>
                    <SelectContent>
                      {formatOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Custom Instructions */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    ✍️ Adjustment Instructions
                  </label>
                  <Textarea
                    value={adjustmentPrompt}
                    onChange={(e) => setAdjustmentPrompt(e.target.value)}
                    placeholder="Describe how you want to adjust the content..."
                    className="min-h-[100px]"
                  />
                </div>

                <Button 
                  onClick={handleAdjustContent}
                  disabled={!selectedContent || !adjustmentPrompt.trim() || n8nLoading}
                  className="w-full"
                >
                  {n8nLoading ? "Adjusting Content..." : "✨ Adjust Content"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Example Prompts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                🧠 Example Prompts (OfficeSpace Focused)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {examplePrompts.map((prompt, index) => (
                  <div
                    key={index}
                    className="p-3 border border-dashed border-muted-foreground/30 rounded-lg cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-colors"
                    onClick={() => setAdjustmentPrompt(prompt)}
                  >
                    <p className="text-sm text-muted-foreground">"{prompt}"</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Selected Content Preview */}
          {selectedContent && (
            <Card>
              <CardHeader>
                <CardTitle>Content Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h4 className="font-medium">{selectedContent.title}</h4>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm whitespace-pre-wrap">
                      {selectedContent.content.substring(0, 500)}
                      {selectedContent.content.length > 500 && "..."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Webhook Payload Preview */}
          <Card className="bg-slate-50 border-dashed">
            <CardHeader>
              <CardTitle className="text-sm">🔧 Webhook Payload Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs font-mono bg-white p-3 rounded border">
                <pre>{JSON.stringify({
                  requestType: 'contentAdjustment',
                  contentId: selectedContent?.id || 'content-id-123',
                  originalContent: {
                    title: selectedContent?.title || 'Content Title',
                    content: '(full content text)',
                    contentType: selectedContent?.content_type || 'pillar',
                    topicArea: selectedContent?.topic_area || 'workspace-management',
                    keywords: selectedContent?.keywords || ['keyword1', 'keyword2']
                  },
                  adjustmentInstructions: {
                    prompt: adjustmentPrompt || 'Adjustment instructions...',
                    targetPersona: selectedTone || 'facility-manager',
                    targetFormat: selectedFormat || 'email'
                  },
                  context: {
                    source: 'content-adjustment-panel',
                    timestamp: new Date().toISOString(),
                    userId: 'user-123'
                  }
                }, null, 2)}</pre>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                This is the exact data structure that will be sent to your n8n webhook when you click "Adjust Content"
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </TabsContent>
  );
};

export default ContentAdjustmentTab;
