
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ContentSection } from "./content-display/ContentSection";
import { useContentSections } from "@/hooks/useContentSections";

interface ContentItem {
  output?: string;
  content?: string;
  [key: string]: any;
}

interface AIContentDisplayProps {
  content: ContentItem[];
  onClose?: () => void;
}

const AIContentDisplay: React.FC<AIContentDisplayProps> = ({ content }) => {
  console.log("AIContentDisplay rendering with content:", content);
  const sections = useContentSections(content);
  console.log("Processed sections:", sections);
  
  if (!content || content.length === 0) {
    console.log("No content available to display");
    return (
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <AlertTriangle size={16} />
          <span>No content available to display</span>
        </div>
      </div>
    );
  }

  const rawContent = content[0]?.output || content[0]?.content || "";
  console.log("Raw content length:", rawContent.length);
  
  if (!rawContent) {
    console.log("Content format is not recognized");
    return (
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <AlertTriangle size={16} />
          <span>Content format is not recognized</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2" 
          onClick={() => {
            navigator.clipboard.writeText(JSON.stringify(content));
            toast.success("Raw content copied to clipboard");
          }}
        >
          <Copy className="w-4 h-4 mr-2" /> Copy Raw Content
        </Button>
      </div>
    );
  }

  const availableSections = Object.entries(sections)
    .filter(([_, content]) => content && content.trim().length > 0)
    .map(([key]) => key);
  
  console.log("Available sections for display:", availableSections);

  if (availableSections.length === 0) {
    console.log("No available sections to display");
    return (
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <AlertTriangle size={16} />
          <span>Unable to parse content sections</span>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2" 
          onClick={() => {
            navigator.clipboard.writeText(rawContent);
            toast.success("Raw content copied to clipboard");
          }}
        >
          <Copy className="w-4 h-4 mr-2" /> Copy Raw Content
        </Button>
      </div>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardContent className="pt-6">
        <Tabs defaultValue={availableSections[0]} className="w-full">
          <TabsList>
            {availableSections.map(section => (
              <TabsTrigger key={section} value={section}>
                {section.charAt(0).toUpperCase() + section.slice(1)} Content
              </TabsTrigger>
            ))}
          </TabsList>

          {availableSections.map(section => (
            <TabsContent key={section} value={section}>
              <ContentSection 
                content={sections[section]} 
                section={section}
              />
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AIContentDisplay;
