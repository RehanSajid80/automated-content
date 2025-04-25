
import React from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneratedContentCard } from "./GeneratedContentCard";

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
  
  // Filter out empty sections
  const availableSections = Object.entries(editableContent)
    .filter(([key, value]) => key === 'pillar' || (value && value.trim().length > 0))
    .map(([key]) => key);
  
  if (availableSections.length === 0) {
    return (
      <div className="p-4 text-center border rounded-md bg-muted/20">
        <p className="text-muted-foreground">No content sections available.</p>
      </div>
    );
  }
  
  return (
    <Tabs defaultValue="pillar">
      <TabsList>
        <TabsTrigger value="pillar">Pillar Content</TabsTrigger>
        {availableSections.includes('support') && <TabsTrigger value="support">Support Content</TabsTrigger>}
        {availableSections.includes('meta') && <TabsTrigger value="meta">Meta Tags</TabsTrigger>}
        {availableSections.includes('social') && <TabsTrigger value="social">Social Posts</TabsTrigger>}
      </TabsList>
      
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
