
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from "lucide-react";

interface ContentPreviewProps {
  generatedContent: any[];
}

export const ContentPreview: React.FC<ContentPreviewProps> = ({ generatedContent }) => {
  const [activeItem, setActiveItem] = React.useState(0);

  if (!generatedContent || generatedContent.length === 0) {
    return (
      <div className="text-center p-4 border rounded-md bg-muted/30">
        <p className="text-muted-foreground">No content available to preview</p>
      </div>
    );
  }

  console.log("ContentPreview rendering with content:", generatedContent);

  const renderContentItem = (content: any) => {
    console.log("Rendering content item:", content);
    
    // Check if this is a structured AI content suggestion
    const isAIContentSuggestion = content.pillarContent !== undefined || 
                                 content.supportContent !== undefined || 
                                 content.socialMediaPosts !== undefined ||
                                 content.emailSeries !== undefined;
    
    const hasPillarContent = content.pillarContent !== undefined;
    const hasOutput = content.output !== undefined;
    
    console.log("Is AI Content Suggestion:", isAIContentSuggestion);
    console.log("Has Pillar Content:", hasPillarContent);
    console.log("Has Output:", hasOutput);
    
    // Format specifically for AI content suggestions
    if (isAIContentSuggestion) {
      // Create display-friendly format for reasoning
      const reasoning = content.reasoning;
      let reasoningContent;
      
      if (reasoning) {
        if (typeof reasoning === 'object') {
          reasoningContent = (
            <div className="space-y-3">
              {Object.entries(reasoning).map(([key, value]) => (
                <div key={key} className="pb-2">
                  <h4 className="font-medium text-sm capitalize">{key} Strategy:</h4>
                  <p className="text-sm text-muted-foreground">{String(value)}</p>
                </div>
              ))}
            </div>
          );
        } else {
          reasoningContent = <p className="text-sm">{String(reasoning)}</p>;
        }
      }
      
      // Format social media posts
      const socialPosts = Array.isArray(content.socialMediaPosts) ? content.socialMediaPosts : [];
      
      // Format email series with subject/body structure
      const emailSeries = Array.isArray(content.emailSeries) ? content.emailSeries : [];
      
      return (
        <Tabs defaultValue="pillar" className="w-full">
          <TabsList className="mb-4">
            {content.pillarContent && <TabsTrigger value="pillar">Pillar Content</TabsTrigger>}
            {content.supportContent && <TabsTrigger value="support">Support Content</TabsTrigger>}
            {socialPosts && socialPosts.length > 0 && <TabsTrigger value="social">Social Posts</TabsTrigger>}
            {emailSeries && emailSeries.length > 0 && <TabsTrigger value="email">Emails</TabsTrigger>}
            {reasoning && <TabsTrigger value="reasoning">Reasoning</TabsTrigger>}
          </TabsList>
          
          {content.pillarContent && (
            <TabsContent value="pillar" className="mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Pillar Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] rounded-md border p-4">
                    <div className="prose max-w-none dark:prose-invert">
                      {typeof content.pillarContent === 'object' && content.pillarContent.content ? (
                        <div className="mb-6">
                          <h3 className="text-xl font-bold mb-2">{content.pillarContent.title || "Pillar Content"}</h3>
                          <p>{content.pillarContent.content}</p>
                        </div>
                      ) : typeof content.pillarContent === 'object' && content.pillarContent.title ? (
                        <div className="mb-6">
                          <h3 className="text-xl font-bold mb-2">{content.pillarContent.title}</h3>
                          <p>{content.pillarContent.outline || JSON.stringify(content.pillarContent)}</p>
                        </div>
                      ) : Array.isArray(content.pillarContent) ? (
                        content.pillarContent.map((item: string, i: number) => (
                          <div key={i} className="mb-6">
                            <p className="whitespace-pre-wrap">{item}</p>
                            {i < content.pillarContent.length - 1 && <hr className="my-4" />}
                          </div>
                        ))
                      ) : (
                        <p className="whitespace-pre-wrap">{String(content.pillarContent)}</p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          {content.supportContent && (
            <TabsContent value="support" className="mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Support Content</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] rounded-md border p-4">
                    <div className="prose max-w-none dark:prose-invert">
                      {typeof content.supportContent === 'object' && content.supportContent.content ? (
                        <div className="mb-6">
                          <h3 className="text-xl font-bold mb-2">{content.supportContent.title || "Support Content"}</h3>
                          <p className="whitespace-pre-wrap">{content.supportContent.content}</p>
                        </div>
                      ) : Array.isArray(content.supportContent) ? (
                        content.supportContent.map((item: string, i: number) => (
                          <div key={i} className="mb-6">
                            <p className="whitespace-pre-wrap">{item}</p>
                            {i < content.supportContent.length - 1 && <hr className="my-4" />}
                          </div>
                        ))
                      ) : (
                        <p className="whitespace-pre-wrap">{String(content.supportContent)}</p>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          {socialPosts && socialPosts.length > 0 && (
            <TabsContent value="social" className="mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Social Media Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] rounded-md border p-4">
                    <div className="space-y-4">
                      {socialPosts.map((post: any, i: number) => {
                        let platform = "Social Post";
                        
                        if (i === 0 || (typeof post === 'string' && post.toLowerCase().includes("linkedin"))) {
                          platform = "LinkedIn";
                        } else if (i === 1 || (typeof post === 'string' && (post.toLowerCase().includes("twitter") || post.toLowerCase().includes("x style")))) {
                          platform = "Twitter/X";
                        } else if (i === 2 || (typeof post === 'string' && (post.toLowerCase().includes("instagram") || post.toLowerCase().includes("facebook")))) {
                          platform = "Instagram/Facebook";
                        }
                        
                        return (
                          <div key={i} className="p-3 border rounded-md">
                            <Badge variant="outline" className="mb-2">{platform}</Badge>
                            <p className="whitespace-pre-wrap">{typeof post === 'string' ? post : JSON.stringify(post)}</p>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          {emailSeries && emailSeries.length > 0 && (
            <TabsContent value="email" className="mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Email Series</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] rounded-md border p-4">
                    <div className="space-y-4">
                      {emailSeries.map((email: any, i: number) => {
                        // Handle various email formats
                        let subject = "";
                        let body = "";
                        
                        if (typeof email === 'object' && email.subject && email.body) {
                          subject = email.subject;
                          body = email.body;
                        } else if (typeof email === 'string') {
                          // Try to parse subject from string format
                          const subjectMatch = email.match(/^Subject:\s*(.*?)(?:\n|$)/i);
                          subject = subjectMatch ? subjectMatch[1] : `Email ${i + 1}`;
                          
                          // Get body by removing subject line
                          body = email.replace(/^Subject:\s*.*?(?:\n|$)/i, '').trim();
                        } else {
                          subject = `Email ${i + 1}`;
                          body = typeof email === 'string' ? email : JSON.stringify(email);
                        }
                        
                        return (
                          <div key={i} className="p-3 border rounded-md">
                            <p className="font-medium">Subject: {subject}</p>
                            <p className="whitespace-pre-wrap mt-2">{body}</p>
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          {reasoning && (
            <TabsContent value="reasoning" className="mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Content Strategy Reasoning</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="p-4 border rounded-md">
                    {reasoningContent}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      );
    } else if (hasOutput) {
      // Render simple output
      return (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">
              {content.title ? content.title : "Generated Content"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] rounded-md border p-4">
              <pre className="whitespace-pre-wrap text-sm">{content.output}</pre>
            </ScrollArea>
          </CardContent>
        </Card>
      );
    } else {
      // Render raw content as JSON
      return (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Raw Content</CardTitle>
            <Badge variant="outline" className="ml-2 text-xs">Debug View</Badge>
          </CardHeader>
          <CardContent>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md p-3 mb-4 flex gap-2">
              <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-400">
                Raw response displayed. Format not recognized as standard content.
              </p>
            </div>
            <ScrollArea className="h-[400px] rounded-md border p-4">
              <pre className="text-xs whitespace-pre-wrap">
                {typeof content === 'string' ? content : JSON.stringify(content, null, 2)}
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      );
    }
  };

  return (
    <div className="space-y-4">
      {generatedContent.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {generatedContent.map((_, idx) => (
            <button
              key={idx}
              className={`px-3 py-1 text-sm rounded-md ${
                activeItem === idx
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted hover:bg-muted/80"
              }`}
              onClick={() => setActiveItem(idx)}
            >
              Item {idx + 1}
            </button>
          ))}
        </div>
      )}

      {renderContentItem(generatedContent[activeItem])}
    </div>
  );
};
