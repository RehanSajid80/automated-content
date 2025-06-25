import React, { useState, useEffect } from "react";
import { TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pencil, Target, TrendingUp, Clock, Building2, Lightbulb, CheckCircle, Copy, AlertCircle } from "lucide-react";
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
  const [adjustedContent, setAdjustedContent] = useState<string>("");
  const [showAdjustedContent, setShowAdjustedContent] = useState(false);

  const { sendToN8n, isLoading: n8nLoading, generatedContent, rawResponse } = useN8nAgent();

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
    { value: "email-series", label: "Email Series (5-part promotional sequence)" },
    { value: "webinar-promo", label: "Webinar Promotional Content" },
    { value: "email", label: "Email (Short & Direct)" },
    { value: "social", label: "Social Media (Engaging & Brief)" },
    { value: "landing-page", label: "Landing Page (Comprehensive)" },
    { value: "blog-post", label: "Blog Post (Educational)" },
    { value: "checklist", label: "Checklist (Actionable)" }
  ];

  const contentPrompts = [
    "Transform this content into a 5-part email series with compelling subject lines and clear calls-to-action.",
    "Rewrite this content for social media with engaging and brief messaging.",
    "Convert this into a comprehensive landing page with persuasive copy.",
    "Create a blog post version that's educational and informative.",
    "Turn this into an actionable checklist format.",
  ];

  useEffect(() => {
    fetchContentItems();
  }, []);

  // Enhanced response processing with better logging and format handling
  useEffect(() => {
    console.log("ContentAdjustmentTab: Checking for response updates");
    console.log("Generated content:", generatedContent);
    console.log("Raw response:", rawResponse);
    
    // Handle the specific format we're receiving: array with single object containing "output" property
    if (rawResponse && Array.isArray(rawResponse) && rawResponse.length > 0) {
      const firstItem = rawResponse[0];
      console.log("Processing first item from raw response array:", firstItem);
      
      if (firstItem && firstItem.output && typeof firstItem.output === 'string') {
        console.log("Found output property, setting adjusted content");
        setAdjustedContent(firstItem.output);
        setShowAdjustedContent(true);
        
        toast({
          title: "✨ Content Ready!",
          description: "Your adjusted content has been generated successfully"
        });
        return;
      }
    }
    
    // Handle generated content from useN8nAgent
    if (generatedContent && generatedContent.length > 0) {
      const content = generatedContent[0];
      console.log("Processing generated content:", content);
      
      if (content.output && typeof content.output === 'string') {
        setAdjustedContent(content.output);
        setShowAdjustedContent(true);
        console.log("Content adjustment successful from generatedContent");
      } else if (typeof content === 'string') {
        setAdjustedContent(content);
        setShowAdjustedContent(true);
      }
    }
    
    // Handle direct rawResponse object format
    if (rawResponse && typeof rawResponse === 'object' && !Array.isArray(rawResponse)) {
      console.log("Processing raw response object:", typeof rawResponse);
      
      if (rawResponse.output && typeof rawResponse.output === 'string') {
        setAdjustedContent(rawResponse.output);
        setShowAdjustedContent(true);
      } else if (typeof rawResponse === 'string') {
        setAdjustedContent(rawResponse);
        setShowAdjustedContent(true);
      }
    }
  }, [generatedContent, rawResponse]);

  const fetchContentItems = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('content_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContentItems(data || []);
      
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

  const handleQuickWebinarSetup = () => {
    setAdjustmentPrompt("Create a 5-part email series to promote a webinar series based on this content. Each email should build excitement and drive registrations with compelling subject lines and clear calls-to-action.");
    setSelectedFormat("email-series");
    setSelectedTone("ceo-executive");
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

    // Clear previous results
    setAdjustedContent("");
    setShowAdjustedContent(false);

    try {
      const webhookPayload = {
        requestType: 'contentAdjustment' as const,
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
          userId: "user-123"
        }
      };

      console.log("Content Adjustment Webhook Payload:", JSON.stringify(webhookPayload, null, 2));
      
      toast({
        title: "Adjusting Content",
        description: "Sending content to AI for processing..."
      });
      
      const result = await sendToN8n(webhookPayload, 'content-adjustment');
      
      console.log("Content adjustment result:", result);
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // Enhanced immediate response handling
      if (result.content && result.content.length > 0) {
        const content = result.content[0];
        if (content.output) {
          setAdjustedContent(content.output);
          setShowAdjustedContent(true);
          toast({
            title: "✨ Success!",
            description: "Your webinar email series is ready!"
          });
          return;
        }
      }
      
      // Handle raw response directly
      if (result.rawResponse) {
        console.log("Processing raw response from result:", result.rawResponse);
        
        if (Array.isArray(result.rawResponse) && result.rawResponse.length > 0) {
          const firstItem = result.rawResponse[0];
          if (firstItem && firstItem.output) {
            setAdjustedContent(firstItem.output);
            setShowAdjustedContent(true);
            toast({
              title: "✨ Success!",
              description: "Your webinar email series is ready!"
            });
            return;
          }
        }
      }
      
      toast({
        title: "Request Sent Successfully",
        description: "Your content is being processed. Please wait for the response..."
      });
      
    } catch (error) {
      console.error("Error adjusting content:", error);
      toast({
        title: "Adjustment Failed",
        description: "Failed to adjust content. Please try again.",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: "Content copied to clipboard"
      });
    } catch (error) {
      console.error("Failed to copy:", error);
      toast({
        title: "Copy Failed",
        description: "Failed to copy content to clipboard",
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
          {/* Response Status */}
          {n8nLoading && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-yellow-800">
                  <Clock className="h-4 w-4 animate-spin" />
                  <span>Processing your content adjustment... Please wait.</span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Enhanced Adjusted Content Results */}
          {showAdjustedContent && adjustedContent && (
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  ✨ Your Adjusted Content is Ready!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-green-700 font-medium">
                      Your content has been successfully adjusted
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(adjustedContent)}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy Content
                    </Button>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-green-200 max-h-[500px] overflow-y-auto">
                    <div className="text-sm whitespace-pre-wrap text-gray-800">
                      {adjustedContent}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => {
                        // Save adjusted content logic here
                        toast({
                          title: "Save Feature",
                          description: "Save functionality will be implemented soon"
                        });
                      }}
                    >
                      Save Content
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setShowAdjustedContent(false);
                        setAdjustedContent("");
                      }}
                    >
                      Clear Results
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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
                  Content Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Tone Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    🎯 Target Audience
                  </label>
                  <Select value={selectedTone} onValueChange={setSelectedTone}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select target audience..." />
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
                    📄 Content Format
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
                    placeholder="Describe how you want to adjust this content..."
                    className="min-h-[100px]"
                  />
                </div>

                <Button 
                  onClick={handleAdjustContent}
                  disabled={!selectedContent || !adjustmentPrompt.trim() || n8nLoading}
                  className="w-full"
                >
                  {n8nLoading ? "Adjusting Content..." : "🎯 Adjust Content"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Content Adjustment Examples */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                💡 Content Adjustment Examples
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {contentPrompts.map((prompt, index) => (
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
        </div>
      </div>
    </TabsContent>
  );
};

export default ContentAdjustmentTab;
