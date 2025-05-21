
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCcw } from "lucide-react";
import { Input } from "@/components/ui/input";

interface GeneratedContentCardProps {
  content: string;
  onContentChange: (content: string) => void;
  onRegenerateContent: () => void;
  onSaveContent: () => void;
  contentType: string;
  title?: string;
  onTitleChange?: (title: string) => void;
}

export const GeneratedContentCard: React.FC<GeneratedContentCardProps> = ({
  content,
  onContentChange,
  onRegenerateContent,
  onSaveContent,
  contentType,
  title,
  onTitleChange
}) => {
  // Calculate word count for pillar content
  const wordCount = contentType === 'pillar' 
    ? content.split(/\s+/).filter(word => word.length > 0).length 
    : 0;

  return (
    <Card className="mt-6 overflow-hidden border">
      <CardHeader className="bg-muted/50 pb-4">
        <div className="flex flex-wrap justify-between items-center">
          <div>
            <CardTitle className="text-base">Generated Content</CardTitle>
            {contentType === 'pillar' && (
              <p className="text-xs text-muted-foreground mt-1">
                {wordCount.toLocaleString()} words
              </p>
            )}
          </div>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onRegenerateContent}
              className="h-8 px-2"
            >
              <RefreshCcw className="h-3 w-3 mr-1" />
              Regenerate
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-5">
        {onTitleChange && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">
              Content Title
            </label>
            <Input
              value={title || ''}
              onChange={(e) => onTitleChange(e.target.value)}
              className="w-full mb-1"
              placeholder="Enter content title"
            />
            <p className="text-xs text-muted-foreground">
              This title will be used when saving to your content library
            </p>
          </div>
        )}

        <Textarea 
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="min-h-[200px] resize-y font-mono text-sm"
          placeholder="Generated content will appear here"
        />
      </CardContent>
      
      <CardFooter className="flex justify-end gap-2 p-4 pt-0">
        <Button onClick={onSaveContent}>
          Save to Library
        </Button>
      </CardFooter>
    </Card>
  );
};
