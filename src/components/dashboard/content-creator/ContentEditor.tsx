
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
  return (
    <Tabs defaultValue="pillar">
      <TabsList>
        <TabsTrigger value="pillar">Pillar Content</TabsTrigger>
        <TabsTrigger value="support">Support Content</TabsTrigger>
        <TabsTrigger value="meta">Meta Tags</TabsTrigger>
        <TabsTrigger value="social">Social Posts</TabsTrigger>
      </TabsList>
      
      {["pillar", "support", "meta", "social"].map((sectionKey) => (
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
