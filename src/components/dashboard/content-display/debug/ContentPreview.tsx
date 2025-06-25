
import React from "react";
import { AIContentTabs } from "./components/AIContentTabs";
import { StandardContentView } from "./components/StandardContentView";
import { ContentSelector } from "./components/ContentSelector";
import { EmptyContentState } from "./components/EmptyContentState";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ContentPreviewProps {
  generatedContent: any[];
}

export const ContentPreview: React.FC<ContentPreviewProps> = ({ generatedContent }) => {
  const [activeItem, setActiveItem] = React.useState(0);

  console.log("ContentPreview received content:", generatedContent);

  if (!generatedContent || generatedContent.length === 0) {
    return <EmptyContentState />;
  }

  const renderContentItem = (content: any) => {
    console.log("Rendering content item:", content);
    
    // Handle direct content response from n8n
    if (content.output && typeof content.output === 'string') {
      return (
        <Card>
          <CardHeader>
            <CardTitle>Generated Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap text-sm bg-gray-50 p-4 rounded border">
                {content.output}
              </pre>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    // Check if this is a structured AI content suggestion
    const isAIContentSuggestion = content.pillarContent !== undefined || 
                                content.supportContent !== undefined || 
                                content.socialMediaPosts !== undefined ||
                                content.emailSeries !== undefined;
    
    if (isAIContentSuggestion) {
      return <AIContentTabs content={content} />;
    } else {
      return <StandardContentView content={content} />;
    }
  };

  return (
    <div className="space-y-4">
      {generatedContent.length > 1 && (
        <ContentSelector 
          generatedContent={generatedContent}
          activeItem={activeItem}
          setActiveItem={setActiveItem}
        />
      )}

      {renderContentItem(generatedContent[activeItem])}
    </div>
  );
};
