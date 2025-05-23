
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet, Tag, Share2, Mail, Download, Copy, Star, ChevronDown, AlertCircle, Info, BookOpen } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { personaTypes } from "@/data/personaTypes";
import { contentGoals } from "@/data/contentGoals";
import { toast } from "sonner";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ContentSuggestion {
  topicArea: string;
  pillarContent: string[];
  supportPages: string[];
  metaTags: string[];
  socialMedia: string[];
  email?: string[];
  reasoning?: string;
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
  
  const personaName = personaTypes.find(p => p.id === persona)?.name || "All Personas";
  const goalName = contentGoals.find(g => g.id === goal)?.name || "General Content";
  
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
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
        
        if (suggestion.pillarContent && suggestion.pillarContent.length > 0) {
          exportContent += `## Pillar Content Ideas:\n`;
          suggestion.pillarContent.forEach(idea => {
            exportContent += `- ${idea}\n`;
          });
        }
        
        if (suggestion.supportPages && suggestion.supportPages.length > 0) {
          exportContent += `\n## Support Pages:\n`;
          suggestion.supportPages.forEach(page => {
            exportContent += `- ${page}\n`;
          });
        }
        
        if (suggestion.metaTags && suggestion.metaTags.length > 0) {
          exportContent += `\n## Meta Tags:\n`;
          suggestion.metaTags.forEach(tag => {
            exportContent += `- ${tag}\n`;
          });
        }
        
        if (suggestion.socialMedia && suggestion.socialMedia.length > 0) {
          exportContent += `\n## Social Media Posts:\n`;
          suggestion.socialMedia.forEach(post => {
            exportContent += `- ${post}\n`;
          });
        }
        
        if (suggestion.email && suggestion.email.length > 0) {
          exportContent += `\n## Email Campaign Ideas:\n`;
          suggestion.email.forEach(email => {
            exportContent += `- ${email}\n`;
          });
        }
        
        if (suggestion.reasoning) {
          exportContent += `\n## Content Strategy Reasoning:\n`;
          exportContent += suggestion.reasoning;
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
    return null;
  }
  
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
        {showReasoning && suggestions[0]?.reasoning && (
          <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              Content Strategy Reasoning
            </h3>
            <div className="text-sm text-muted-foreground whitespace-pre-wrap">
              {typeof suggestions[0].reasoning === 'string' 
                ? suggestions[0].reasoning 
                : JSON.stringify(suggestions[0].reasoning, null, 2)}
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
          
          {suggestions.map((suggestion, index) => (
            <div key={`suggestion-${index}`} className="mb-4">
              {index > 0 && <h3 className="text-lg font-semibold mb-2">{suggestion.topicArea}</h3>}
              
              <TabsContent value="pillar" className="space-y-4">
                {suggestion.pillarContent && suggestion.pillarContent.length > 0 ? (
                  <div className="border rounded-lg">
                    {suggestion.pillarContent.map((content, i) => (
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
                        <div className="flex justify-end">
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
                    No pillar content suggestions available
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="support" className="space-y-4">
                {suggestion.supportPages && suggestion.supportPages.length > 0 ? (
                  <div className="border rounded-lg">
                    {suggestion.supportPages.map((content, i) => (
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
                        <div className="flex justify-end">
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
                    No support content suggestions available
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="meta" className="space-y-4">
                {suggestion.metaTags && suggestion.metaTags.length > 0 ? (
                  <div className="border rounded-lg">
                    {suggestion.metaTags.map((content, i) => (
                      <div 
                        key={`meta-${i}`}
                        className="p-4 border-b last:border-b-0"
                      >
                        <div className="flex justify-between items-start">
                          <p className="text-sm">{content}</p>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => handleCopyToClipboard(content)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No meta tags suggestions available
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="social" className="space-y-4">
                {suggestion.socialMedia && suggestion.socialMedia.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
                    {suggestion.socialMedia.map((content, i) => {
                      // Determine social media platform from content
                      let platform = "Social Post";
                      let icon = <Share2 className="h-4 w-4" />;
                      
                      if (content.toLowerCase().includes("linkedin")) {
                        platform = "LinkedIn";
                      } else if (content.toLowerCase().includes("twitter") || content.toLowerCase().includes("x style")) {
                        platform = "Twitter/X";
                      } else if (content.toLowerCase().includes("instagram") || content.toLowerCase().includes("facebook")) {
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
                          
                          <p className="text-sm whitespace-pre-wrap mb-4">{content}</p>
                          
                          <div className="flex justify-between items-center mt-2">
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
                            
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleCopyToClipboard(content)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No social media post suggestions available
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="email" className="space-y-4">
                {suggestion.email && suggestion.email.length > 0 ? (
                  <div className="space-y-4">
                    {suggestion.email.map((content, i) => {
                      // Parse email content
                      let subject = "";
                      let body = content;
                      
                      if (content.startsWith("Subject:")) {
                        const parts = content.split("\n\n");
                        if (parts.length >= 2) {
                          subject = parts[0].replace("Subject:", "").trim();
                          body = parts.slice(1).join("\n\n");
                        }
                      }
                      
                      return (
                        <div 
                          key={`email-${i}`}
                          className="border rounded-lg overflow-hidden"
                        >
                          <div className="bg-muted/30 p-3 border-b flex justify-between items-center">
                            <h3 className="font-medium">{subject || `Email Template ${i + 1}`}</h3>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              onClick={() => handleCopyToClipboard(content)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="p-4 bg-card">
                            <p className="text-sm whitespace-pre-wrap">{body}</p>
                          </div>
                          <div className="p-3 border-t bg-background flex justify-end">
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
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 text-center text-muted-foreground">
                    No email campaign suggestions available
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
