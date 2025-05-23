
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import AIContentDisplay from "../AIContentDisplay";
import { ContentEditor } from "../content-creator/ContentEditor";
import { ContentDebugger } from "./ContentDebugger";

interface ContentDisplayProps {
  generatedContent: any[];
  editableContent: Record<string, string>;
  isEditing: boolean;
  setIsEditing: (value: boolean) => void;
  forceRefresh: number;
  handleContentChange: (sectionKey: string, newContent: string) => void;
  handleRegenerateContent: (sectionKey: string) => void;
  handleSaveContent: (sectionKey: string) => void;
  forceRender: () => void;
  rawResponse?: any; // Add this prop
}

export const ContentDisplay: React.FC<ContentDisplayProps> = ({
  generatedContent,
  editableContent,
  isEditing,
  setIsEditing,
  forceRefresh,
  handleContentChange,
  handleRegenerateContent,
  handleSaveContent,
  forceRender,
  rawResponse // Use this prop
}) => {
  return (
    <Card className="mt-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Generated Content</CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center gap-1"
          onClick={() => setIsEditing(!isEditing)}
        >
          <Pencil className="h-4 w-4" />
          {isEditing ? "View Overview" : "Edit Content"}
        </Button>
      </CardHeader>
      <CardContent>
        {/* Debug display content */}
        <ContentDebugger 
          generatedContent={generatedContent} 
          forceRender={forceRender} 
          rawResponse={rawResponse} // Pass this prop
        />
        
        {isEditing ? (
          <ContentEditor
            editableContent={editableContent}
            onContentChange={handleContentChange}
            onRegenerateContent={handleRegenerateContent}
            onSaveContent={handleSaveContent}
          />
        ) : (
          <React.Fragment key={`content-display-${forceRefresh}`}>
            <AIContentDisplay content={generatedContent} onClose={() => {}} />
          </React.Fragment>
        )}
      </CardContent>
    </Card>
  );
};
