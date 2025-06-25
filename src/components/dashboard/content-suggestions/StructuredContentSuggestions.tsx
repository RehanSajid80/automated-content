import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet, Tag, Share2, Mail, Download, Copy, Star, ChevronDown, AlertCircle, Info, BookOpen, Plus, Eye } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { personaTypes } from "@/data/personaTypes";
import { contentGoals } from "@/data/contentGoals";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ContentSuggestion {
  topicArea: string;
  pillarContent: string | string[] | any;
  supportContent: string | string[] | any;
  metaTags?: string[];
  socialMedia?: string[];
  socialMediaPosts?: string[];
  email?: string[];
  emailSeries?: Array<{subject: string; body: string}> | string[];
  reasoning?: any;
}

interface StructuredContentSuggestionsProps {
  suggestions: ContentSuggestion[];
  persona: string;
  goal: string;
  isLoading: boolean;
}

export const StructuredContentSuggestions: React.FC<StructuredContentSuggestionsProps> = ({
  suggestions,
  persona,
  goal,
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState("pillar");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [showReasoning, setShowReasoning] = useState(false);
  const [expandedPreviews, setExpandedPreviews] = useState<{[key: string]: boolean}>({});
  
  const personaName = personaTypes.find(p => p.id === persona)?.name || "All Personas";
  const goalName = contentGoals.find(g => g.id === goal)?.name || "General Content";
  
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };
  
  const handleCreateContent = (contentType: string, contentItem: string) => {
    toast.success(`Creating ${contentType} content...`, {
      description: `Opening content creator for: ${contentItem.substring(0, 50)}...`
    });
    // TODO: Navigate to content creator with pre-filled data
    console.log(`Creating ${contentType} content for:`, contentItem);
  };

  const togglePreview = (key: string) => {
    setExpandedPreviews(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const generateSampleContent = (type: string, title: string): string => {
    switch (type) {
      case 'pillar':
        return `# ${title}\n\n## Introduction\nThis comprehensive guide covers everything you need to know about ${title.toLowerCase()}...\n\n## Key Benefits\n- Improved efficiency\n- Cost reduction\n- Better organization\n\n## Implementation Steps\n1. Assessment phase\n2. Planning and strategy\n3. Execution and monitoring\n\n[Content continues for 1500+ words...]`;
      
      case 'support':
        return `# ${title}\n\n## Quick Overview\nThis guide helps you understand ${title.toLowerCase()} in practical terms...\n\n## Step-by-Step Process\n- Define your requirements\n- Evaluate options\n- Make informed decisions\n\n## Best Practices\n- Regular monitoring\n- Continuous improvement\n- Stakeholder communication\n\n[Additional 500-800 words of detailed guidance...]`;
      
      case 'meta':
        return `Title: ${title} | Office Space Software\nMeta Description: Learn how ${title.toLowerCase()} can transform your workplace efficiency. Get expert tips and implementation strategies.`;
      
      case 'social':
        return `🏢 Ready to transform your workplace with ${title.toLowerCase()}? Our latest guide breaks down everything you need to know! \n\n✅ Proven strategies\n✅ Real-world examples\n✅ Expert insights\n\nRead more: [link] #WorkplaceManagement #OfficeSpace`;
      
      case 'email':
        return `Subject: Transform Your Workplace with ${title}\n\nHi [First Name],\n\nAre you looking to improve your workplace efficiency? Our comprehensive guide on ${title.toLowerCase()} provides actionable strategies that leading companies use to optimize their operations.\n\nIn this guide, you'll discover:\n- Key implementation strategies\n- Common pitfalls to avoid\n- Real success stories\n\nDownload your free copy today!\n\nBest regards,\nThe Office Space Software Team`;
      
      default:
        return 'Sample content preview...';
    }
  };
  
  const handleExport = () => {
    let exportContent = `# Content Campaign Plan\n\n`;
    exportContent += `## Target Persona: ${personaName}\n`;
    exportContent += `## Content Goal: ${goalName}\n\n`;
    
    if (selectedItems.length > 0) {
      exportContent += `## Selected Content Items:\n`;
      selectedItems.forEach(item => {
        exportContent += `- ${item}\n`;
      });
    } else {
      if (suggestions.length > 0) {
        const suggestion = suggestions[0];
        
        if (suggestion.pillarContent) {
          exportContent += `## Pillar Content Ideas:\n`;
          if (Array.isArray(suggestion.pillarContent)) {
            suggestion.pillarContent.forEach((idea: any) => {
              exportContent += `- ${typeof idea === 'string' ? idea : JSON.stringify(idea)}\n`;
            });
          } else {
            exportContent += `- ${typeof suggestion.pillarContent === 'string' ? suggestion.pillarContent : JSON.stringify(suggestion.pillarContent)}\n`;
          }
        }
        
        if (suggestion.supportContent) {
          exportContent += `\n## Support Pages:\n`;
          if (Array.isArray(suggestion.supportContent)) {
            suggestion.supportContent.forEach((page: any) => {
              exportContent += `- ${typeof page === 'string' ? page : JSON.stringify(page)}\n`;
            });
          } else {
            exportContent += `- ${typeof suggestion.supportContent === 'string' ? suggestion.supportContent : JSON.stringify(suggestion.supportContent)}\n`;
          }
        }
        
        const socialPosts = suggestion.socialMediaPosts || suggestion.socialMedia;
        if (socialPosts && socialPosts.length > 0) {
          exportContent += `\n## Social Media Posts:\n`;
          socialPosts.forEach((post: any) => {
            exportContent += `- ${typeof post === 'string' ? post : JSON.stringify(post)}\n`;
          });
        }
        
        const emails = suggestion.emailSeries || suggestion.email;
        if (emails && emails.length > 0) {
          exportContent += `\n## Email Campaign Ideas:\n`;
          emails.forEach((email: any) => {
            if (typeof email === 'object' && email.subject && email.body) {
              exportContent += `- Subject: ${email.subject}\n  Body: ${email.body}\n\n`;
            } else {
              exportContent += `- ${typeof email === 'string' ? email : JSON.stringify(email)}\n`;
            }
          });
        }
        
        if (suggestion.reasoning) {
          exportContent += `\n## Content Strategy Reasoning:\n`;
          if (typeof suggestion.reasoning === 'object') {
            Object.entries(suggestion.reasoning).forEach(([key, value]) => {
              exportContent += `### ${key}:\n${value}\n\n`;
            });
          } else {
            exportContent += suggestion.reasoning;
          }
        }
      }
    }
    
    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `content-campaign-plan-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Campaign plan exported!");
  };
  
  const toggleSelectItem = (item: string) => {
    setSelectedItems(prev => 
      prev.includes(item) 
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };
  
  // Helper function to format content based on type
  const formatContent = (content: any): string[] => {
    if (!content) return [];
    
    if (Array.isArray(content)) {
      return content.map(item => typeof item === 'string' ? item : 
        (item.content || item.title || JSON.stringify(item)));
    }
    
    if (typeof content === 'object') {
      return [content.content || content.title || JSON.stringify(content)];
    }
    
    return [content.toString()];
  };
  
  // Helper function to safely render reasoning values
  const renderReasoningValue = (value: any): React.ReactNode => {
    if (typeof value === 'string') {
      return value;
    }
    
    if (typeof value === 'object' && value !== null) {
      // Handle objects with title/description structure
      if (value.title && value.description) {
        return (
          <div className="space-y-1">
            <div className="font-medium text-sm">{value.title}</div>
            <div className="text-sm text-muted-foreground">{value.description}</div>
          </div>
        );
      }
      
      // Handle other object structures
      return (
        <div className="space-y-1">
          {Object.entries(value).map(([key, val]) => (
            <div key={key} className="text-sm">
              <span className="font-medium capitalize">{key}: </span>
              <span>{String(val)}</span>
            </div>
          ))}
        </div>
      );
    }
    
    return String(value);
  };
  
  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
          <p className="text-muted-foreground">Generating content suggestions...</p>
        </div>
      </div>
    );
  }
  
  if (!suggestions || suggestions.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">No content suggestions available. Click "Get AI Content Suggestions" to generate some.</p>
      </div>
    );
  }
  
  // Process the suggestions data
  const processedSuggestions = suggestions.map(suggestion => {
    const pillarContent = formatContent(suggestion.pillarContent);
    const supportContent = formatContent(suggestion.supportContent);
    const socialPosts = suggestion.socialMediaPosts || suggestion.socialMedia || [];
    
    // Handle email series which might be objects with subject/body or plain strings
    let emailSeries = suggestion.emailSeries || suggestion.email || [];
    const processedEmails = Array.isArray(emailSeries) ? emailSeries.map(email => {
      if (typeof email === 'object' && email.subject && email.body) {
        return email;
      } else if (typeof email === 'string') {
        const parts = email.split('\n\n');
        const subject = parts[0].replace(/^Subject:\s*/i, '').trim();
        const body = parts.slice(1).join('\n\n');
        return { subject, body };
      }
      return { subject: 'No subject provided', body: typeof email === 'string' ? email : JSON.stringify(email) };
    }) : [];
    
    return {
      ...suggestion,
      pillarContent,
      supportContent,
      socialPosts,
      processedEmails
    };
  });
  
  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <CardTitle>Content Suggestions</CardTitle>
          <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
            <Badge variant="outline">{personaName}</Badge>
            <Badge variant="outline">{goalName}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            className={`flex items-center gap-1 ${showReasoning ? 'bg-muted' : ''}`}
            onClick={() => setShowReasoning(!showReasoning)}
          >
            <Info className="h-4 w-4 mr-1" />
            {showReasoning ? "Hide" : "Show"} Reasoning
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1"
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-1" />
            Export Plan
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showReasoning && processedSuggestions[0]?.reasoning && (
          <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Content Strategy Reasoning
            </h3>
            <div className="space-y-4">
              {typeof processedSuggestions[0].reasoning === 'object' ? (
                Object.entries(processedSuggestions[0].reasoning).map(([key, value]) => (
                  <div key={key} className="space-y-1">
                    <h4 className="text-xs font-medium text-muted-foreground capitalize">{key} Justification:</h4>
                    <div className="text-sm pl-4">
                      {renderReasoningValue(value)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {renderReasoningValue(processedSuggestions[0].reasoning)}
                </div>
              )}
            </div>
          </div>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="pillar" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Pillar Content</span>
              <span className="inline sm:hidden">Pillar</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span className="hidden sm:inline">Support Pages</span>
              <span className="inline sm:hidden">Support</span>
            </TabsTrigger>
            <TabsTrigger value="meta" className="flex items-center gap-1">
              <Tag className="h-4 w-4" />
              <span className="hidden sm:inline">Meta Tags</span>
              <span className="inline sm:hidden">Meta</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-1">
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">Social Media</span>
              <span className="inline sm:hidden">Social</span>
            </TabsTrigger>
            <TabsTrigger value="email" className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              <span className="hidden sm:inline">Email Campaign</span>
              <span className="inline sm:hidden">Email</span>
            </TabsTrigger>
          </TabsList>
          
          {processedSuggestions.map((suggestion, index) => (
            <div key={`suggestion-${index}`} className="mb-4">
              {index > 0 && <h3 className="text-lg font-semibold mb-2">{suggestion.topicArea}</h3>}
              
              <TabsContent value="pillar" className="space-y-4">
                {suggestion.pillarContent && suggestion.pillarContent.length > 0 ? (
                  <div className="border rounded-lg">
                    {suggestion.pillarContent.map((content: string, i: number) => (
                      <div 
                        key={`pillar-${i}`}
                        className="p-5 border-b last:border-b-0"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-semibold">{content}</h3>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleCopyToClipboard(content)}
                            className="ml-2"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Sample Content Preview */}
                        <Collapsible 
                          open={expandedPreviews[`pillar-${i}`]} 
                          onOpenChange={() => togglePreview(`pillar-${i}`)}
                        >
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="mb-3">
                              <Eye className="h-4 w-4 mr-2" />
                              {expandedPreviews[`pillar-${i}`] ? 'Hide' : 'Show'} Content Preview
                              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${expandedPreviews[`pillar-${i}`] ? 'rotate-180' : ''}`} />
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="bg-muted/20 p-4 rounded-md mb-4 text-sm">
                              <pre className="whitespace-pre-wrap font-mono text-xs">
                                {generateSampleContent('pillar', content)}
                              </pre>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                        
                        <div className="flex justify-between items-center">
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleCreateContent('Pillar Content', content)}
                            className="flex items-center gap-1"
                          >
                            <Plus className="h-4 w-4" />
                            Create Content
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => toggleSelectItem(content)}
                            className="flex items-center gap-1"
                          >
                            {selectedItems.includes(content) ? (
                              <>
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>Selected</span>
                              </>
                            ) : (
                              <>
                                <Star className="h-4 w-4" />
                                <span>Select</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    ⚠️ No pillar content suggestions available
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="support" className="space-y-4">
                {suggestion.supportContent && suggestion.supportContent.length > 0 ? (
                  <div className="border rounded-lg">
                    {suggestion.supportContent.map((content: string, i: number) => (
                      <div 
                        key={`support-${i}`}
                        className="p-5 border-b last:border-b-0"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-lg font-semibold">{content}</h3>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleCopyToClipboard(content)}
                            className="ml-2"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Sample Content Preview */}
                        <Collapsible 
                          open={expandedPreviews[`support-${i}`]} 
                          onOpenChange={() => togglePreview(`support-${i}`)}
                        >
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="mb-3">
                              <Eye className="h-4 w-4 mr-2" />
                              {expandedPreviews[`support-${i}`] ? 'Hide' : 'Show'} Content Preview
                              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${expandedPreviews[`support-${i}`] ? 'rotate-180' : ''}`} />
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="bg-muted/20 p-4 rounded-md mb-4 text-sm">
                              <pre className="whitespace-pre-wrap font-mono text-xs">
                                {generateSampleContent('support', content)}
                              </pre>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                        
                        <div className="flex justify-between items-center">
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleCreateContent('Support Page', content)}
                            className="flex items-center gap-1"
                          >
                            <Plus className="h-4 w-4" />
                            Create Content
                          </Button>
                          
                          <Button 
                            size="sm" 
                            variant="outline" 
                            onClick={() => toggleSelectItem(content)}
                            className="flex items-center gap-1"
                          >
                            {selectedItems.includes(content) ? (
                              <>
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span>Selected</span>
                              </>
                            ) : (
                              <>
                                <Star className="h-4 w-4" />
                                <span>Select</span>
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    ⚠️ No support content suggestions available
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="meta" className="space-y-4">
                {suggestion.metaTags && suggestion.metaTags.length > 0 ? (
                  <div className="border rounded-lg">
                    {suggestion.metaTags.map((content: string, i: number) => (
                      <div 
                        key={`meta-${i}`}
                        className="p-4 border-b last:border-b-0"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <p className="text-sm font-medium">{content}</p>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleCopyToClipboard(content)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        {/* Sample Content Preview */}
                        <Collapsible 
                          open={expandedPreviews[`meta-${i}`]} 
                          onOpenChange={() => togglePreview(`meta-${i}`)}
                        >
                          <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="mb-3">
                              <Eye className="h-4 w-4 mr-2" />
                              {expandedPreviews[`meta-${i}`] ? 'Hide' : 'Show'} Meta Tags Preview
                              <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${expandedPreviews[`meta-${i}`] ? 'rotate-180' : ''}`} />
                            </Button>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="bg-muted/20 p-4 rounded-md mb-4 text-sm">
                              <pre className="whitespace-pre-wrap font-mono text-xs">
                                {generateSampleContent('meta', content)}
                              </pre>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                        
                        <div className="flex justify-end">
                          <Button 
                            size="sm" 
                            variant="default"
                            onClick={() => handleCreateContent('Meta Tags', content)}
                            className="flex items-center gap-1"
                          >
                            <Plus className="h-4 w-4" />
                            Create Meta Tags
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    ⚠️ No meta tags suggestions available
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="social" className="space-y-4">
                {suggestion.socialPosts && suggestion.socialPosts.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                    {suggestion.socialPosts.map((content: any, i: number) => {
                      // Convert content to string safely before using toLowerCase
                      const contentString = typeof content === 'string' ? content : JSON.stringify(content);
                      const contentLower = contentString.toLowerCase();
                      
                      // Determine social media platform from content or index
                      let platform = "Social Post";
                      let icon = <Share2 className="h-4 w-4" />;
                      
                      if (i === 0 || contentLower.includes("linkedin")) {
                        platform = "LinkedIn";
                      } else if (i === 1 || contentLower.includes("twitter") || contentLower.includes("x style")) {
                        platform = "Twitter/X";
                      } else if (i === 2 || contentLower.includes("instagram") || contentLower.includes("facebook")) {
                        platform = "Instagram/Facebook";
                      }
                      
                      return (
                        <div 
                          key={`social-${i}`}
                          className="border rounded-lg p-4 bg-card relative"
                        >
                          <Badge variant="outline" className="mb-2">
                            {icon}
                            <span className="ml-1">{platform}</span>
                          </Badge>
                          
                          <p className="text-sm whitespace-pre-wrap mb-4">{contentString}</p>
                          
                          {/* Sample Content Preview */}
                          <Collapsible 
                            open={expandedPreviews[`social-${i}`]} 
                            onOpenChange={() => togglePreview(`social-${i}`)}
                          >
                            <CollapsibleTrigger asChild>
                              <Button variant="ghost" size="sm" className="mb-3 w-full">
                                <Eye className="h-4 w-4 mr-2" />
                                {expandedPreviews[`social-${i}`] ? 'Hide' : 'Show'} Enhanced Preview
                                <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${expandedPreviews[`social-${i}`] ? 'rotate-180' : ''}`} />
                              </Button>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <div className="bg-muted/20 p-4 rounded-md mb-4 text-sm">
                                <pre className="whitespace-pre-wrap font-mono text-xs">
                                  {generateSampleContent('social', contentString)}
                                </pre>
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                          
                          <div className="flex justify-between items-center mt-2">
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => handleCreateContent('Social Media Post', contentString)}
                              className="flex items-center gap-1"
                            >
                              <Plus className="h-4 w-4" />
                              Create Post
                            </Button>
                            
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => toggleSelectItem(contentString)}
                                className="flex items-center gap-1"
                              >
                                {selectedItems.includes(contentString) ? (
                                  <>
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    <span>Selected</span>
                                  </>
                                ) : (
                                  <>
                                    <Star className="h-4 w-4" />
                                    <span>Select</span>
                                  </>
                                )}
                              </Button>
                              
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => handleCopyToClipboard(contentString)}
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    ⚠️ No social media post suggestions available
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="email" className="space-y-4">
                {suggestion.processedEmails && suggestion.processedEmails.length > 0 ? (
                  <div className="space-y-4">
                    {suggestion.processedEmails.map((email: any, i: number) => {
                      const subject = email.subject || `Email Template ${i + 1}`;
                      const body = email.body || "No content provided";
                      
                      return (
                        <div 
                          key={`email-${i}`}
                          className="border rounded-lg overflow-hidden"
                        >
                          <div className="bg-muted/30 p-3 border-b flex justify-between items-center">
                            <h3 className="font-medium">{subject}</h3>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleCopyToClipboard(`Subject: ${subject}\n\n${body}`)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="p-4 bg-card">
                            <p className="text-sm whitespace-pre-wrap">{body}</p>
                          </div>
                          
                          {/* Sample Content Preview */}
                          <Collapsible 
                            open={expandedPreviews[`email-${i}`]} 
                            onOpenChange={() => togglePreview(`email-${i}`)}
                          >
                            <div className="p-3 border-t">
                              <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-full">
                                  <Eye className="h-4 w-4 mr-2" />
                                  {expandedPreviews[`email-${i}`] ? 'Hide' : 'Show'} Enhanced Email Preview
                                  <ChevronDown className={`h-4 w-4 ml-2 transition-transform ${expandedPreviews[`email-${i}`] ? 'rotate-180' : ''}`} />
                                </Button>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="bg-muted/20 p-4 rounded-md mt-3 text-sm">
                                  <pre className="whitespace-pre-wrap font-mono text-xs">
                                    {generateSampleContent('email', subject)}
                                  </pre>
                                </div>
                              </CollapsibleContent>
                            </div>
                          </Collapsible>
                          
                          <div className="p-3 border-t bg-background flex justify-between items-center">
                            <Button 
                              size="sm" 
                              variant="default"
                              onClick={() => handleCreateContent('Email Campaign', `Subject: ${subject}\n\n${body}`)}
                              className="flex items-center gap-1"
                            >
                              <Plus className="h-4 w-4" />
                              Create Email
                            </Button>
                            
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => toggleSelectItem(`Subject: ${subject}\n\n${body}`)}
                              className="flex items-center gap-1"
                            >
                              {selectedItems.includes(`Subject: ${subject}\n\n${body}`) ? (
                                <>
                                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                  <span>Selected</span>
                                </>
                              ) : (
                                <>
                                  <Star className="h-4 w-4" />
                                  <span>Select</span>
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    ⚠️ No email campaign suggestions available
                  </div>
                )}
              </TabsContent>
            </div>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
