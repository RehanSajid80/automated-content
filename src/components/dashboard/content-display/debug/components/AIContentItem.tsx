
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Sparkles, Mail, MessageSquare, Copy, Check, Code } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AIContentItemProps {
  item: any;
  index: number;
}

export const AIContentItem: React.FC<AIContentItemProps> = ({ item, index }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [isReasoningOpen, setIsReasoningOpen] = useState(false);
  
  // Function to safely handle potentially circular references
  const safeStringify = (obj: any, indent = 2) => {
    const seen = new WeakSet();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return "[Circular Reference]";
        }
        seen.add(value);
      }
      return value;
    }, indent);
  };

  // Extract and normalize content
  const pillarContent = item.pillarContent || "";
  const supportContent = item.supportContent || "";
  
  // Ensure socialMediaPosts is an array of strings
  let socialMediaPosts = [];
  if (item.socialMediaPosts) {
    if (Array.isArray(item.socialMediaPosts)) {
      socialMediaPosts = item.socialMediaPosts;
    } else if (typeof item.socialMediaPosts === 'string') {
      socialMediaPosts = [item.socialMediaPosts];
    }
  }
  
  // Normalize email series
  let emailSeries = [];
  if (item.emailSeries) {
    if (Array.isArray(item.emailSeries)) {
      emailSeries = item.emailSeries;
    } else if (typeof item.emailSeries === 'object') {
      emailSeries = [item.emailSeries];
    } else if (typeof item.emailSeries === 'string') {
      emailSeries = [{ subject: "Email", body: item.emailSeries }];
    }
  }

  // Handle reasoning - could be an object or string
  let reasoning = item.reasoning || {};
  
  // Copy content to clipboard
  const copyToClipboard = (content: string, section: string) => {
    navigator.clipboard.writeText(content);
    setCopied(section);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <Card className="animated fade-in">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base">
          {item.topicArea || item.title || `AI Content ${index + 1}`}
        </CardTitle>
        <Badge variant="outline" className="flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          AI Generated
        </Badge>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pillar" className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="pillar" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Pillar Content
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Support Content
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Social Media
            </TabsTrigger>
          </TabsList>
          
          {/* Pillar Content Tab */}
          <TabsContent value="pillar" className="space-y-4">
            <div className="relative">
              <Button 
                size="sm"
                variant="ghost"
                className="absolute top-0 right-0"
                onClick={() => copyToClipboard(typeof pillarContent === 'string' ? pillarContent : safeStringify(pillarContent), 'pillar')}
              >
                {copied === 'pillar' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                <pre className="text-sm whitespace-pre-wrap">
                  {typeof pillarContent === 'string' ? pillarContent : safeStringify(pillarContent)}
                </pre>
              </ScrollArea>
            </div>
          </TabsContent>
          
          {/* Support Content Tab */}
          <TabsContent value="support" className="space-y-4">
            <div className="relative">
              <Button 
                size="sm"
                variant="ghost"
                className="absolute top-0 right-0"
                onClick={() => copyToClipboard(typeof supportContent === 'string' ? supportContent : safeStringify(supportContent), 'support')}
              >
                {copied === 'support' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                <pre className="text-sm whitespace-pre-wrap">
                  {typeof supportContent === 'string' ? supportContent : safeStringify(supportContent)}
                </pre>
              </ScrollArea>
            </div>
          </TabsContent>
          
          {/* Social Media Tab */}
          <TabsContent value="social" className="space-y-4">
            <div className="relative">
              <Button 
                size="sm"
                variant="ghost"
                className="absolute top-0 right-0"
                onClick={() => copyToClipboard(socialMediaPosts.join('\n\n'), 'social')}
              >
                {copied === 'social' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                <div className="space-y-4">
                  {socialMediaPosts.map((post, i) => (
                    <div key={i} className="p-3 bg-muted/30 rounded-md">
                      <p className="text-sm whitespace-pre-wrap">{post}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Email Series Section */}
        {emailSeries && emailSeries.length > 0 && (
          <div className="mt-6">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Series
            </h4>
            <ScrollArea className="h-[200px] w-full rounded-md border p-4">
              <div className="space-y-4">
                {emailSeries.map((email, i) => (
                  <div key={i} className="p-3 bg-muted/30 rounded-md">
                    <p className="text-sm font-medium mb-1">
                      Subject: {email.subject || `Email ${i + 1}`}
                    </p>
                    <p className="text-sm whitespace-pre-wrap">{email.body}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
        
        {/* Reasoning Section */}
        {reasoning && Object.keys(reasoning).length > 0 && (
          <Collapsible
            open={isReasoningOpen}
            onOpenChange={setIsReasoningOpen}
            className="mt-6"
          >
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2 w-full justify-between">
                <span className="flex items-center gap-2">
                  <Code className="h-4 w-4" />
                  AI Reasoning
                </span>
                <span className="text-xs text-muted-foreground">
                  {isReasoningOpen ? "Hide Details" : "Show Details"}
                </span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-3">
              <Card className="bg-muted/30">
                <CardContent className="pt-3 text-sm">
                  {typeof reasoning === 'string' ? (
                    <p className="whitespace-pre-wrap">{reasoning}</p>
                  ) : (
                    <div className="space-y-3">
                      {Object.entries(reasoning).map(([key, value]) => (
                        <div key={key}>
                          <h5 className="text-sm font-medium">{key.charAt(0).toUpperCase() + key.slice(1)}</h5>
                          <p className="text-sm whitespace-pre-wrap">{value as string}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>
        )}
        
        {/* Raw JSON Button */}
        <div className="mt-4">
          <Button 
            variant="outline" 
            size="sm"
            className="w-full flex items-center gap-2"
            onClick={() => copyToClipboard(safeStringify(item), 'raw')}
          >
            <Code className="h-4 w-4" />
            {copied === 'raw' ? 'Copied Raw JSON' : 'Copy Raw JSON'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
