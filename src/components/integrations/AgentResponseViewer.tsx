
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Clock, FileText, Tag, CheckCircle, AlertTriangle } from "lucide-react";

interface Section {
  heading: string;
  content: string;
  keywords: string[];
}

interface ContentMetaData {
  wordCount: number;
  readingTime: string;
  seoScore: number;
}

interface GeneratedContent {
  title: string;
  sections: Section[];
  metaData: ContentMetaData;
  callToAction: string;
}

interface AgentResponse {
  status: "success" | "error" | "processing";
  generatedContent?: GeneratedContent;
  errorMessage?: string;
  timestamp: string;
  processingTime: string;
  agentVersion: string;
}

interface AgentResponseViewerProps {
  response: AgentResponse | null;
  isLoading: boolean;
}

const AgentResponseViewer: React.FC<AgentResponseViewerProps> = ({ response, isLoading }) => {
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">AI Agent Response</CardTitle>
          <CardDescription>Processing your request...</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-12">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-sm text-muted-foreground">Generating content through n8n AI agent...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!response) {
    return null;
  }

  const formattedDate = new Date(response.timestamp).toLocaleString();

  return (
    <Card className="w-full animate-fade-in">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">AI Agent Response</CardTitle>
          <Badge variant={response.status === "success" ? "success" : "destructive"}>
            {response.status === "success" ? (
              <><CheckCircle size={14} className="mr-1" /> Success</>
            ) : (
              <><AlertTriangle size={14} className="mr-1" /> Error</>
            )}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Clock size={14} /> {formattedDate}
          </span>
          <span className="flex items-center gap-1">
            Processing time: {response.processingTime}
          </span>
        </CardDescription>
      </CardHeader>

      {response.status === "success" && response.generatedContent && (
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold mb-2">{response.generatedContent.title}</h3>
            <div className="flex gap-2 mb-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <FileText size={12} />
                {response.generatedContent.metaData.wordCount} words
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Clock size={12} />
                {response.generatedContent.metaData.readingTime}
              </Badge>
              <Badge 
                variant={
                  response.generatedContent.metaData.seoScore > 80 ? "success" : 
                  response.generatedContent.metaData.seoScore > 60 ? "warning" : "destructive"
                }
              >
                SEO: {response.generatedContent.metaData.seoScore}/100
              </Badge>
            </div>
          </div>

          <ScrollArea className="h-64 rounded-md border p-4">
            {response.generatedContent.sections.map((section, index) => (
              <div key={index} className="mb-4">
                <h4 className="font-medium mb-2">{section.heading}</h4>
                <p className="text-sm text-muted-foreground mb-2">{section.content}</p>
                <div className="flex flex-wrap gap-1">
                  {section.keywords.map((keyword, kidx) => (
                    <Badge key={kidx} variant="outline" className="text-xs">
                      <Tag size={10} className="mr-1" /> {keyword}
                    </Badge>
                  ))}
                </div>
                {index < response.generatedContent.sections.length - 1 && (
                  <Separator className="my-3" />
                )}
              </div>
            ))}
          </ScrollArea>

          <div className="p-3 bg-primary/10 rounded-md">
            <p className="text-sm font-medium">{response.generatedContent.callToAction}</p>
          </div>
        </CardContent>
      )}

      {response.status === "error" && (
        <CardContent>
          <div className="p-4 bg-destructive/10 rounded-md text-destructive">
            <p>{response.errorMessage || "An unknown error occurred while processing your request."}</p>
          </div>
        </CardContent>
      )}

      <CardFooter className="pt-3 text-xs text-muted-foreground">
        <div className="flex justify-between w-full">
          <span>Agent Version: {response.agentVersion}</span>
          <span>Powered by n8n AI Agent</span>
        </div>
      </CardFooter>
    </Card>
  );
};

export default AgentResponseViewer;
