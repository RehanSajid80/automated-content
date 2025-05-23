
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface AIContentTabsProps {
  content: any;
}

export const AIContentTabs: React.FC<AIContentTabsProps> = ({ content }) => {
  // Check if all necessary keys are present for tabs
  const hasPillarContent = content.pillarContent !== undefined;
  const hasSupportContent = content.supportContent !== undefined;
  const hasSocialPosts = Array.isArray(content.socialMediaPosts) && content.socialMediaPosts.length > 0;
  const hasEmailSeries = Array.isArray(content.emailSeries) && content.emailSeries.length > 0;
  const hasReasoning = content.reasoning !== undefined;

  return (
    <Tabs defaultValue={hasPillarContent ? "pillar" : hasSupportContent ? "support" : "social"} className="w-full">
      <TabsList className="mb-4">
        {hasPillarContent && <TabsTrigger value="pillar">Pillar Content</TabsTrigger>}
        {hasSupportContent && <TabsTrigger value="support">Support Content</TabsTrigger>}
        {hasSocialPosts && <TabsTrigger value="social">Social Posts</TabsTrigger>}
        {hasEmailSeries && <TabsTrigger value="email">Emails</TabsTrigger>}
        {hasReasoning && <TabsTrigger value="reasoning">Reasoning</TabsTrigger>}
      </TabsList>
      
      {hasPillarContent && (
        <TabsContent value="pillar" className="mt-0">
          <PillarContentTab content={content.pillarContent} />
        </TabsContent>
      )}
      
      {hasSupportContent && (
        <TabsContent value="support" className="mt-0">
          <SupportContentTab content={content.supportContent} />
        </TabsContent>
      )}
      
      {hasSocialPosts && (
        <TabsContent value="social" className="mt-0">
          <SocialPostsTab posts={content.socialMediaPosts} />
        </TabsContent>
      )}
      
      {hasEmailSeries && (
        <TabsContent value="email" className="mt-0">
          <EmailSeriesTab emails={content.emailSeries} />
        </TabsContent>
      )}
      
      {hasReasoning && (
        <TabsContent value="reasoning" className="mt-0">
          <ReasoningTab reasoning={content.reasoning} />
        </TabsContent>
      )}
    </Tabs>
  );
};

const PillarContentTab: React.FC<{ content: any }> = ({ content }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Pillar Content</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] rounded-md border p-4">
          <div className="prose max-w-none dark:prose-invert">
            {typeof content === 'object' && content.content ? (
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">{content.title || "Pillar Content"}</h3>
                <p>{content.content}</p>
              </div>
            ) : typeof content === 'object' && content.title ? (
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">{content.title}</h3>
                <p>{content.outline || JSON.stringify(content)}</p>
              </div>
            ) : Array.isArray(content) ? (
              content.map((item: string, i: number) => (
                <div key={i} className="mb-6">
                  <p className="whitespace-pre-wrap">{item}</p>
                  {i < content.length - 1 && <hr className="my-4" />}
                </div>
              ))
            ) : (
              <p className="whitespace-pre-wrap">{String(content)}</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

const SupportContentTab: React.FC<{ content: any }> = ({ content }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Support Content</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] rounded-md border p-4">
          <div className="prose max-w-none dark:prose-invert">
            {typeof content === 'object' && content.content ? (
              <div className="mb-6">
                <h3 className="text-xl font-bold mb-2">{content.title || "Support Content"}</h3>
                <p className="whitespace-pre-wrap">{content.content}</p>
              </div>
            ) : Array.isArray(content) ? (
              content.map((item: string, i: number) => (
                <div key={i} className="mb-6">
                  <p className="whitespace-pre-wrap">{item}</p>
                  {i < content.length - 1 && <hr className="my-4" />}
                </div>
              ))
            ) : (
              <p className="whitespace-pre-wrap">{String(content)}</p>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

const SocialPostsTab: React.FC<{ posts: any[] }> = ({ posts }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Social Media Posts</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] rounded-md border p-4">
          <div className="space-y-4">
            {posts.map((post: any, i: number) => {
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
  );
};

const EmailSeriesTab: React.FC<{ emails: any[] }> = ({ emails }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Email Series</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] rounded-md border p-4">
          <div className="space-y-4">
            {emails.map((email: any, i: number) => {
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
  );
};

const ReasoningTab: React.FC<{ reasoning: any }> = ({ reasoning }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Content Strategy Reasoning</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 border rounded-md">
          {typeof reasoning === 'object' ? (
            <div className="space-y-3">
              {Object.entries(reasoning).map(([key, value]) => (
                <div key={key} className="pb-2">
                  <h4 className="font-medium text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()} Strategy:</h4>
                  <p className="text-sm text-muted-foreground">{String(value)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{JSON.stringify(reasoning, null, 2)}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
