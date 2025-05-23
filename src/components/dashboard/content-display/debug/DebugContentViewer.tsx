
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertCircle } from "lucide-react";

interface DebugContentViewerProps {
  rawResponse: any;
  processedContent: any[];
}

export const DebugContentViewer: React.FC<DebugContentViewerProps> = ({ 
  rawResponse, 
  processedContent 
}) => {
  if (!rawResponse) {
    return (
      <div className="text-center p-4 border rounded-md bg-muted/30">
        <p className="text-muted-foreground">No raw data available to view</p>
      </div>
    );
  }

  const renderFormattedContent = () => {
    if (!processedContent || processedContent.length === 0) {
      return (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <p className="text-sm text-amber-700 dark:text-amber-400">
              No processed content available
            </p>
          </div>
        </div>
      );
    }

    return processedContent.map((item, index) => {
      // Check if it's in AI Content Suggestions format
      const isAIContent = item.pillarContent !== undefined || 
                         item.supportContent !== undefined || 
                         item.socialMediaPosts !== undefined || 
                         item.emailSeries !== undefined;
      
      if (isAIContent) {
        return (
          <div key={index} className="space-y-6">
            {/* 1. Pillar Content Section */}
            {item.pillarContent && (
              <section className="p-4 border rounded-md">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Badge variant="outline">1</Badge>
                  Pillar Content Idea
                </h3>
                <p className="mt-2 whitespace-pre-wrap">
                  {typeof item.pillarContent === 'string' 
                    ? item.pillarContent 
                    : typeof item.pillarContent === 'object' 
                      ? JSON.stringify(item.pillarContent, null, 2) 
                      : '⚠️ Content not provided'}
                </p>
              </section>
            )}

            {/* 2. Support Content Section */}
            {item.supportContent && (
              <section className="p-4 border rounded-md">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Badge variant="outline">2</Badge>
                  Support Content Idea
                </h3>
                <p className="mt-2 whitespace-pre-wrap">
                  {typeof item.supportContent === 'string' 
                    ? item.supportContent 
                    : typeof item.supportContent === 'object' 
                      ? JSON.stringify(item.supportContent, null, 2) 
                      : '⚠️ Content not provided'}
                </p>
              </section>
            )}

            {/* 3. Social Media Posts Section */}
            {item.socialMediaPosts && (
              <section className="p-4 border rounded-md">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Badge variant="outline">3</Badge>
                  Social Media Posts
                </h3>
                <ul className="mt-2 space-y-3">
                  {Array.isArray(item.socialMediaPosts) && item.socialMediaPosts.length > 0 ? (
                    item.socialMediaPosts.map((post, idx) => (
                      <li key={idx} className="p-3 bg-muted/30 rounded-md">
                        <Badge className="mb-1">{
                          idx === 0 ? 'LinkedIn' : 
                          idx === 1 ? 'Twitter/X' : 
                          idx === 2 ? 'Instagram/Facebook' : 
                          `Social Post ${idx + 1}`
                        }</Badge>
                        <p className="whitespace-pre-wrap">{typeof post === 'string' ? post : JSON.stringify(post)}</p>
                      </li>
                    ))
                  ) : (
                    <li>⚠️ Social media posts not provided</li>
                  )}
                </ul>
              </section>
            )}

            {/* 4. Email Series Section */}
            {item.emailSeries && (
              <section className="p-4 border rounded-md">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Badge variant="outline">4</Badge>
                  Email Series
                </h3>
                <ul className="mt-2 space-y-3">
                  {Array.isArray(item.emailSeries) && item.emailSeries.length > 0 ? (
                    item.emailSeries.map((email, idx) => (
                      <li key={idx} className="p-3 bg-muted/30 rounded-md">
                        <p className="font-medium">Subject: {
                          typeof email === 'object' && email.subject 
                            ? email.subject 
                            : typeof email === 'string' 
                              ? `Email ${idx + 1}` 
                              : `Email ${idx + 1}`
                        }</p>
                        <p className="mt-1 whitespace-pre-wrap">{
                          typeof email === 'object' && email.body 
                            ? email.body 
                            : typeof email === 'string' 
                              ? email 
                              : JSON.stringify(email)
                        }</p>
                      </li>
                    ))
                  ) : (
                    <li>⚠️ Email content not provided</li>
                  )}
                </ul>
              </section>
            )}

            {/* 5. Reasoning Section */}
            {item.reasoning && (
              <section className="p-4 border rounded-md">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Badge variant="outline">5</Badge>
                  Content Reasoning & Strategy
                </h3>
                <div className="mt-2 space-y-2">
                  {typeof item.reasoning === 'object' ? (
                    <>
                      {item.reasoning.pillarContent && (
                        <div>
                          <h4 className="font-medium">Pillar Content Justification:</h4>
                          <p className="text-sm text-muted-foreground">{item.reasoning.pillarContent}</p>
                        </div>
                      )}
                      {item.reasoning.supportContent && (
                        <div>
                          <h4 className="font-medium">Support Content Justification:</h4>
                          <p className="text-sm text-muted-foreground">{item.reasoning.supportContent}</p>
                        </div>
                      )}
                      {item.reasoning.socialMediaPosts && (
                        <div>
                          <h4 className="font-medium">Social Media Strategy:</h4>
                          <p className="text-sm text-muted-foreground">{item.reasoning.socialMediaPosts}</p>
                        </div>
                      )}
                      {item.reasoning.emailSeries && (
                        <div>
                          <h4 className="font-medium">Email Strategy:</h4>
                          <p className="text-sm text-muted-foreground">{item.reasoning.emailSeries}</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="whitespace-pre-wrap">{JSON.stringify(item.reasoning, null, 2)}</p>
                  )}
                </div>
              </section>
            )}
          </div>
        );
      }

      // Default rendering for non-AI content
      return (
        <div key={index} className="p-4 border rounded-md">
          <h3 className="font-medium">{item.title || `Content Item ${index + 1}`}</h3>
          <pre className="mt-2 text-sm whitespace-pre-wrap overflow-auto">
            {typeof item === 'string' ? item : JSON.stringify(item, null, 2)}
          </pre>
        </div>
      );
    });
  };

  return (
    <Tabs defaultValue="formatted" className="w-full">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="formatted">Formatted Content</TabsTrigger>
        <TabsTrigger value="raw">Raw JSON</TabsTrigger>
      </TabsList>
      
      <TabsContent value="formatted" className="space-y-4">
        {renderFormattedContent()}
      </TabsContent>
      
      <TabsContent value="raw">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Raw Response Data</CardTitle>
            <Badge variant="outline">Debug View</Badge>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] rounded-md border p-4">
              <pre className="text-xs whitespace-pre-wrap">
                {typeof rawResponse === 'string' 
                  ? rawResponse 
                  : JSON.stringify(rawResponse, null, 2)
                }
              </pre>
            </ScrollArea>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
