
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, FileText, Mail, Share2, Tag, Building2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface ContentPreviewProps {
  generatedContent: any[];
}

export const ContentPreview: React.FC<ContentPreviewProps> = ({ generatedContent }) => {
  if (!generatedContent || generatedContent.length === 0) {
    return (
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded">
        <p className="text-sm text-amber-700 dark:text-amber-400">No content available to display</p>
      </div>
    );
  }

  const content = generatedContent[0];
  
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
          
          <SocialPostsTab content={content} />
          
          <EmailSeriesTab content={content} />
          
          <ReasoningTab content={content} />
        </Tabs>
      </CardContent>
    </Card>
  );
};

const SocialPostsTab: React.FC<{ content: any }> = ({ content }) => {
  return (
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
  );
};

const EmailSeriesTab: React.FC<{ content: any }> = ({ content }) => {
  return (
    <TabsContent value="email">
      <div className="space-y-3">
        {content.emailSeries && content.emailSeries.length > 0 ? (
          content.emailSeries.map((email: any, index: number) => (
            <div key={index} className="relative">
              <div className="border rounded-md p-3 mb-2 bg-card">
                <h4 className="font-medium text-sm mb-1">Subject: {email.subject}</h4>
                <p className="whitespace-pre-line text-sm">{email.body}</p>
              </div>
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
  );
};

const ReasoningTab: React.FC<{ content: any }> = ({ content }) => {
  return (
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
  );
};
