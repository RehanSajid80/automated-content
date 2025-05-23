
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

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

  const renderContentItem = (content: any) => {
    // Check if this is a structured content item with pillar content or other sections
    const hasPillarContent = content.pillarContent !== undefined;
    const hasOutput = content.output !== undefined;
    
    if (hasPillarContent) {
      // Render structured content with tabs
      return (
        <Tabs defaultValue="pillar" className="w-full">
          <TabsList className="mb-4">
            {content.pillarContent && <TabsTrigger value="pillar">Pillar Content</TabsTrigger>}
            {content.supportContent && <TabsTrigger value="support">Support Content</TabsTrigger>}
            {content.socialMediaPosts && content.socialMediaPosts.length > 0 && <TabsTrigger value="social">Social Posts</TabsTrigger>}
            {content.emailSeries && content.emailSeries.length > 0 && <TabsTrigger value="email">Emails</TabsTrigger>}
            {content.metaTags && <TabsTrigger value="meta">Meta Tags</TabsTrigger>}
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
                      {Array.isArray(content.pillarContent) 
                        ? content.pillarContent.map((item: string, i: number) => (
                            <div key={i} className="mb-6">
                              <p>{item}</p>
                              {i < content.pillarContent.length - 1 && <hr className="my-4" />}
                            </div>
                          ))
                        : <p>{content.pillarContent}</p>
                      }
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
                      {Array.isArray(content.supportContent) 
                        ? content.supportContent.map((item: string, i: number) => (
                            <div key={i} className="mb-6">
                              <p>{item}</p>
                              {i < content.supportContent.length - 1 && <hr className="my-4" />}
                            </div>
                          ))
                        : <p>{content.supportContent}</p>
                      }
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          {content.socialMediaPosts && content.socialMediaPosts.length > 0 && (
            <TabsContent value="social" className="mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Social Media Posts</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] rounded-md border p-4">
                    <div className="space-y-4">
                      {content.socialMediaPosts.map((post: any, i: number) => (
                        <div key={i} className="p-3 border rounded-md">
                          <p className="whitespace-pre-wrap">{typeof post === 'string' ? post : JSON.stringify(post)}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          {content.emailSeries && content.emailSeries.length > 0 && (
            <TabsContent value="email" className="mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Email Series</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] rounded-md border p-4">
                    <div className="space-y-4">
                      {content.emailSeries.map((email: any, i: number) => (
                        <div key={i} className="p-3 border rounded-md">
                          <p className="font-medium">Subject: {email.subject}</p>
                          <p className="whitespace-pre-wrap mt-2">{email.body}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          )}
          
          {content.metaTags && (
            <TabsContent value="meta" className="mt-0">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Meta Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 p-4 border rounded-md">
                    {typeof content.metaTags === 'object' ? (
                      <>
                        {content.metaTags.metaTitle && (
                          <div>
                            <p className="font-medium">Meta Title:</p>
                            <p>{content.metaTags.metaTitle}</p>
                          </div>
                        )}
                        {content.metaTags.metaDescription && (
                          <div className="mt-2">
                            <p className="font-medium">Meta Description:</p>
                            <p>{content.metaTags.metaDescription}</p>
                          </div>
                        )}
                      </>
                    ) : Array.isArray(content.metaTags) ? (
                      content.metaTags.map((tag: any, i: number) => (
                        <div key={i}>
                          <p className="whitespace-pre-wrap">{tag}</p>
                        </div>
                      ))
                    ) : (
                      <p>{content.metaTags.toString()}</p>
                    )}
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
          </CardHeader>
          <CardContent>
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
