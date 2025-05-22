
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, FileSpreadsheet, Tag, Share2, Mail, Download, Copy, Star } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { personaTypes } from "@/data/personaTypes";
import { contentGoals } from "@/data/contentGoals";
import { toast } from "sonner";

interface ContentSuggestion {
  topicArea: string;
  pillarContent: string[];
  supportPages: string[];
  metaTags: string[];
  socialMedia: string[];
  email?: string[];
  reasoning: string;
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
        
        exportContent += `## Pillar Content Ideas:\n`;
        suggestion.pillarContent.forEach(idea => {
          exportContent += `- ${idea}\n`;
        });
        
        exportContent += `\n## Support Pages:\n`;
        suggestion.supportPages.forEach(page => {
          exportContent += `- ${page}\n`;
        });
        
        exportContent += `\n## Meta Tags:\n`;
        suggestion.metaTags.forEach(tag => {
          exportContent += `- ${tag}\n`;
        });
        
        exportContent += `\n## Social Media Posts:\n`;
        suggestion.socialMedia.forEach(post => {
          exportContent += `- ${post}\n`;
        });
        
        if (suggestion.email && suggestion.email.length > 0) {
          exportContent += `\n## Email Campaign Ideas:\n`;
          suggestion.email.forEach(email => {
            exportContent += `- ${email}\n`;
          });
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
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-1"
          onClick={handleExport}
        >
          <Download className="h-4 w-4 mr-1" />
          Export Plan
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="pillar" className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Pillar Content</span>
              <span className="inline sm:hidden">Pillar</span>
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-1">
              <FileSpreadsheet className="h-4 w-4" />
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
                <Accordion type="multiple" className="w-full">
                  {suggestion.pillarContent.map((content, i) => (
                    <AccordionItem key={`pillar-${i}`} value={`pillar-${i}`}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-start gap-2 pr-4">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelectItem(content);
                            }}
                          >
                            {selectedItems.includes(content) ? (
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ) : (
                              <Star className="h-4 w-4" />
                            )}
                          </Button>
                          <span className="text-sm font-medium">
                            {content.split(':')[0] || content.substring(0, 60) + '...'}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="p-4 bg-muted/50 rounded-md relative">
                          <p className="text-sm">{content}</p>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="absolute top-2 right-2"
                            onClick={() => handleCopyToClipboard(content)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
              
              <TabsContent value="support" className="space-y-4">
                <Accordion type="multiple" className="w-full">
                  {suggestion.supportPages.map((content, i) => (
                    <AccordionItem key={`support-${i}`} value={`support-${i}`}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-start gap-2 pr-4">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelectItem(content);
                            }}
                          >
                            {selectedItems.includes(content) ? (
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ) : (
                              <Star className="h-4 w-4" />
                            )}
                          </Button>
                          <span className="text-sm font-medium">
                            {content.split(':')[0] || content.substring(0, 60) + '...'}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="p-4 bg-muted/50 rounded-md relative">
                          <p className="text-sm">{content}</p>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="absolute top-2 right-2"
                            onClick={() => handleCopyToClipboard(content)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
              
              <TabsContent value="meta" className="space-y-4">
                <Accordion type="multiple" className="w-full">
                  {suggestion.metaTags.map((content, i) => (
                    <AccordionItem key={`meta-${i}`} value={`meta-${i}`}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-start gap-2 pr-4">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelectItem(content);
                            }}
                          >
                            {selectedItems.includes(content) ? (
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ) : (
                              <Star className="h-4 w-4" />
                            )}
                          </Button>
                          <span className="text-sm font-medium">
                            {content.split(':')[0] || content.substring(0, 60) + '...'}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="p-4 bg-muted/50 rounded-md relative">
                          <p className="text-sm">{content}</p>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="absolute top-2 right-2"
                            onClick={() => handleCopyToClipboard(content)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
              
              <TabsContent value="social" className="space-y-4">
                <Accordion type="multiple" className="w-full">
                  {suggestion.socialMedia.map((content, i) => (
                    <AccordionItem key={`social-${i}`} value={`social-${i}`}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-start gap-2 pr-4">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6 rounded-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleSelectItem(content);
                            }}
                          >
                            {selectedItems.includes(content) ? (
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            ) : (
                              <Star className="h-4 w-4" />
                            )}
                          </Button>
                          <span className="text-sm font-medium">
                            {content.split(/[\n:]/)[0] || content.substring(0, 60) + '...'}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="p-4 bg-muted/50 rounded-md relative">
                          <p className="text-sm whitespace-pre-wrap">{content}</p>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="absolute top-2 right-2"
                            onClick={() => handleCopyToClipboard(content)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>
              
              <TabsContent value="email" className="space-y-4">
                <Accordion type="multiple" className="w-full">
                  {suggestion.email ? 
                    suggestion.email.map((content, i) => (
                      <AccordionItem key={`email-${i}`} value={`email-${i}`}>
                        <AccordionTrigger className="text-left">
                          <div className="flex items-start gap-2 pr-4">
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-6 w-6 rounded-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelectItem(content);
                              }}
                            >
                              {selectedItems.includes(content) ? (
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              ) : (
                                <Star className="h-4 w-4" />
                              )}
                            </Button>
                            <span className="text-sm font-medium">
                              {content.split(':')[0] || content.substring(0, 60) + '...'}
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="p-4 bg-muted/50 rounded-md relative">
                            <p className="text-sm whitespace-pre-wrap">{content}</p>
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="absolute top-2 right-2"
                              onClick={() => handleCopyToClipboard(content)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )) : 
                    <div className="p-4 text-center text-muted-foreground">
                      No email campaign suggestions generated.
                    </div>
                  }
                </Accordion>
              </TabsContent>
            </div>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
