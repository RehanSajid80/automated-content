
import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw, Copy, Code, FileText, Mail, Share2, Tag, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ContentDebuggerProps {
  generatedContent: any[];
  forceRender: () => void;
  rawResponse?: any;
}

export const ContentDebugger: React.FC<ContentDebuggerProps> = ({ 
  generatedContent,
  forceRender,
  rawResponse
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("preview");

  const handleCopyRawContent = () => {
    try {
      const contentString = JSON.stringify(generatedContent, null, 2);
      navigator.clipboard.writeText(contentString);
      toast.success("Raw content copied to clipboard");
    } catch (e) {
      toast.error("Failed to copy raw content");
    }
  };

  // Function to format email content
  const formatEmail = (email: any) => {
    if (!email) return null;
    return (
      <div className="border rounded-md p-3 mb-2 bg-card">
        <h4 className="font-medium text-sm mb-1">Subject: {email.subject}</h4>
        <p className="whitespace-pre-line text-sm">{email.body}</p>
      </div>
    );
  };

  // Function to render structured content preview
  const renderStructuredContent = () => {
    if (!generatedContent || generatedContent.length === 0) {
      return (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded">
          <p className="text-sm text-amber-700 dark:text-amber-400">No content available to display</p>
        </div>
      );
    }

    const content = generatedContent[0];
    
    return (
      <Card className="border-0 shadow-none">
        <CardContent className="p-0">
          <Tabs defaultValue="pillar" className="w-full">
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="pillar" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                <span>Pillar</span>
              </TabsTrigger>
              <TabsTrigger value="support" className="flex items-center gap-1">
                <Building2 className="h-4 w-4" />
                <span>Support</span>
              </TabsTrigger>
              <TabsTrigger value="social" className="flex items-center gap-1">
                <Share2 className="h-4 w-4" />
                <span>Social</span>
              </TabsTrigger>
              <TabsTrigger value="email" className="flex items-center gap-1">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </TabsTrigger>
              <TabsTrigger value="reasoning" className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                <span>Why?</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pillar">
              <div className="bg-card border rounded-md p-3">
                <h3 className="font-medium mb-2">{content.pillarContent || "No pillar content"}</h3>
              </div>
            </TabsContent>
            
            <TabsContent value="support">
              <div className="bg-card border rounded-md p-3">
                <h3 className="font-medium mb-2">{content.supportContent || "No support content"}</h3>
              </div>
            </TabsContent>
            
            <TabsContent value="social">
              <div className="space-y-3">
                {content.socialMediaPosts && content.socialMediaPosts.length > 0 ? (
                  content.socialMediaPosts.map((post: string, index: number) => {
                    // Determine social media platform from content
                    let platform = "";
                    let badgeVariant = "default";
                    
                    if (post.toLowerCase().includes("linkedin")) {
                      platform = "LinkedIn";
                      badgeVariant = "outline";
                    } else if (post.toLowerCase().includes("twitter") || post.toLowerCase().includes("x style")) {
                      platform = "Twitter/X";
                      badgeVariant = "secondary";
                    } else if (post.toLowerCase().includes("instagram") || post.toLowerCase().includes("facebook")) {
                      platform = "Instagram/Facebook";
                      badgeVariant = "default";
                    }
                    
                    return (
                      <div key={index} className="bg-card border rounded-md p-3">
                        <div className="flex justify-between items-center mb-2">
                          <Badge variant={badgeVariant as any}>{platform}</Badge>
                          <Button size="sm" variant="ghost" onClick={() => {
                            navigator.clipboard.writeText(post);
                            toast.success("Post copied to clipboard");
                          }}>
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                        <p className="text-sm whitespace-pre-line">{post}</p>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-muted-foreground">No social posts available</div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="email">
              <div className="space-y-3">
                {content.emailSeries && content.emailSeries.length > 0 ? (
                  content.emailSeries.map((email: any, index: number) => (
                    <div key={index} className="relative">
                      {formatEmail(email)}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-2 right-2"
                        onClick={() => {
                          const emailText = `Subject: ${email.subject}\n\n${email.body}`;
                          navigator.clipboard.writeText(emailText);
                          toast.success("Email copied to clipboard");
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground">No email content available</div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="reasoning">
              <div className="space-y-3">
                {content.reasoning ? (
                  Object.entries(content.reasoning).map(([key, value]: [string, any]) => (
                    <div key={key} className="bg-card border rounded-md p-3">
                      <h4 className="font-medium text-sm capitalize mb-1">{key.replace(/([A-Z])/g, ' $1').trim()}</h4>
                      <p className="text-sm text-muted-foreground">{value}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground">No reasoning available</div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    );
  };

  const displayContent = () => {
    try {
      if (!generatedContent || generatedContent.length === 0) {
        return (
          <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded">
            <p className="text-sm text-amber-700 dark:text-amber-400">No content available to display</p>
          </div>
        );
      }
      
      const contentItem = generatedContent[0];
      let displayText = "";
      
      if (contentItem.pillarContent) {
        const pillar = Array.isArray(contentItem.pillarContent) 
          ? contentItem.pillarContent[0] 
          : contentItem.pillarContent;
        displayText = pillar;
      } else if (contentItem.output) {
        displayText = contentItem.output;
      } else if (contentItem.content) {
        displayText = contentItem.content;
      } else {
        displayText = JSON.stringify(contentItem);
      }
      
      return (
        <div className="p-4 mb-4 bg-slate-50 dark:bg-slate-900 border rounded overflow-auto">
          <h4 className="text-sm font-medium mb-2">Content Preview:</h4>
          <p className="text-xs font-mono whitespace-pre-line">
            {displayText.substring(0, 300)}...
          </p>
        </div>
      );
    } catch (e) {
      return (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
          <p className="text-sm text-red-700 dark:text-red-400">Error displaying content: {String(e)}</p>
        </div>
      );
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full mb-4">
      <div className="flex items-center justify-between">
        <CollapsibleTrigger asChild>
          <Button variant="outline" size="sm" className="mb-2 flex items-center gap-2">
            <Code className="h-4 w-4" />
            {isOpen ? "Hide Content Preview" : "Show Content Preview"}
          </Button>
        </CollapsibleTrigger>
        <Button 
          variant="outline" 
          size="sm" 
          className="mb-2 flex items-center gap-2"
          onClick={forceRender}
        >
          <RefreshCw className="h-4 w-4" />
          Force Refresh
        </Button>
      </div>
      
      <CollapsibleContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="preview" className="flex-1">Visual Preview</TabsTrigger>
            <TabsTrigger value="raw" className="flex-1">Raw Content</TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="pt-4">
            {renderStructuredContent()}
          </TabsContent>
          
          <TabsContent value="raw" className="pt-4">
            {displayContent()}
            
            <Card className="overflow-hidden">
              <CardContent className="p-4">
                <h3 className="text-sm font-medium mb-2">Content Structure Analysis</h3>
                <p className="text-xs mb-4">This shows the structure of the generated content for debugging purposes.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-xs font-semibold mb-1">Content Keys</h4>
                    {generatedContent && generatedContent.length > 0 ? (
                      <div className="text-xs bg-muted p-2 rounded overflow-auto max-h-20">
                        {Object.keys(generatedContent[0]).map(key => (
                          <div key={key} className="flex items-center justify-between mb-1">
                            <span className="font-mono text-blue-600 dark:text-blue-400">{key}</span>
                            <span className="text-gray-600 dark:text-gray-400">
                              {typeof generatedContent[0][key] === 'object' 
                                ? (Array.isArray(generatedContent[0][key]) 
                                  ? `Array(${generatedContent[0][key].length})` 
                                  : 'Object') 
                                : typeof generatedContent[0][key]}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground">No content available</p>
                    )}
                  </div>
                  
                  <div>
                    <h4 className="text-xs font-semibold mb-1">Actions</h4>
                    <div className="flex flex-col gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs w-full justify-start" 
                        onClick={handleCopyRawContent}
                      >
                        <Copy className="h-3 w-3 mr-2" />
                        Copy Raw Content
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs w-full justify-start"
                        onClick={() => {
                          forceRender();
                          toast.success("Display refreshed");
                        }}
                      >
                        <RefreshCw className="h-3 w-3 mr-2" />
                        Force Refresh Display
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CollapsibleContent>
    </Collapsible>
  );
};
