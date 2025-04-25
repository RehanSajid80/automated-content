
import React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneratedContentCard } from "./GeneratedContentCard";
import { toast } from "sonner";

interface ContentEditorProps {
  editableContent: {[key: string]: string};
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
  console.log("ContentEditor rendering with content keys:", Object.keys(editableContent));
  console.log("Pillar content length:", editableContent.pillar?.length || 0);
  console.log("Support content length:", editableContent.support?.length || 0);
  console.log("Meta content length:", editableContent.meta?.length || 0);
  console.log("Social content length:", editableContent.social?.length || 0);
  
  // Filter out empty sections
  const availableSections = Object.entries(editableContent)
    .filter(([key, value]) => value && value.trim().length > 0)
    .map(([key]) => key);
  
  if (availableSections.length === 0) {
    console.log("No content sections available for display");
    
    if (editableContent.pillar) {
      console.log("Pillar content exists but was filtered out. First 100 chars:", 
        editableContent.pillar.substring(0, 100));
    }
    
    return (
      <div className="p-4 text-center border rounded-md bg-muted/20">
        <p className="text-muted-foreground">No content sections available.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Please try regenerating content or check console for errors.
        </p>
      </div>
    );
  }
  
  console.log("Available content sections for display:", availableSections);
  
  const handleCopyDebugInfo = () => {
    const debugInfo = {
      availableSections,
      contentSizes: {
        pillar: editableContent.pillar?.length || 0,
        support: editableContent.support?.length || 0,
        meta: editableContent.meta?.length || 0,
        social: editableContent.social?.length || 0,
      },
      contentSamples: {
        pillar: editableContent.pillar?.substring(0, 100) || "",
        support: editableContent.support?.substring(0, 100) || "",
        meta: editableContent.meta?.substring(0, 100) || "",
        social: editableContent.social?.substring(0, 100) || "",
      }
    };
    
    navigator.clipboard.writeText(JSON.stringify(debugInfo, null, 2));
    toast("Debug info copied to clipboard");
  }
  
  return (
    <Tabs defaultValue={availableSections[0] || "pillar"}>
      <div className="flex justify-between items-center">
        <TabsList>
          {availableSections.map(section => (
            <TabsTrigger key={section} value={section}>
              {section.charAt(0).toUpperCase() + section.slice(1)} Content
            </TabsTrigger>
          ))}
        </TabsList>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleCopyDebugInfo} 
          className="text-xs"
        >
          Debug
        </Button>
      </div>
      
      {availableSections.map((sectionKey) => (
        <TabsContent key={sectionKey} value={sectionKey}>
          <GeneratedContentCard
            content={editableContent[sectionKey] || ""}
            onContentChange={(content) => onContentChange(sectionKey, content)}
            onRegenerateContent={() => onRegenerateContent(sectionKey)}
            onSaveContent={() => onSaveContent(sectionKey)}
            contentType={sectionKey}
          />
        </TabsContent>
      ))}
    </Tabs>
  );
};
