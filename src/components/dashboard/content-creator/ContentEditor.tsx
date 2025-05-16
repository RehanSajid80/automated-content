
import React from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RefreshCcw, Save } from "lucide-react";

interface ContentEditorProps {
  editableContent: Record<string, string>;
  onContentChange: (sectionKey: string, newContent: string) => void;
  onRegenerateContent: (sectionKey: string) => void;
  onSaveContent: (sectionKey: string) => void;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({
  editableContent,
  onContentChange,
  onRegenerateContent,
  onSaveContent,
}) => {
  // Helper function to get proper button text based on content type
  const getSaveButtonText = (sectionKey: string) => {
    switch(sectionKey) {
      case 'social':
        return 'Save Social Post';
      case 'pillar':
        return 'Save Pillar Content';
      case 'support':
        return 'Save Support Content';
      case 'meta':
        return 'Save Meta Tags';
      default:
        return `Save ${sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1)} Content`;
    }
  };
  
  return (
    <div className="space-y-6">
      {Object.entries(editableContent).map(([sectionKey, content]) => (
        <Card key={sectionKey} className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex justify-between items-center">
              <span>
                {sectionKey.charAt(0).toUpperCase() + sectionKey.slice(1).replace(/_/g, ' ')}
              </span>
              <div className="flex items-center gap-2 text-sm">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => onRegenerateContent(sectionKey)}
                >
                  <RefreshCcw className="h-3 w-3 mr-1" />
                  Regenerate
                </Button>
                <Button
                  size="sm"
                  className="text-xs"
                  onClick={() => onSaveContent(sectionKey)}
                >
                  <Save className="h-3 w-3 mr-1" />
                  {getSaveButtonText(sectionKey)}
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={content || ""}
              onChange={(e) => onContentChange(sectionKey, e.target.value)}
              className="min-h-[150px] font-mono text-sm"
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
