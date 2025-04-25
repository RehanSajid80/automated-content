
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Save, AlertTriangle, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface ContentItem {
  output?: string;
  content?: string; // Make content optional to handle different response formats
  [key: string]: any; // Add index signature for other properties
}

interface AIContentDisplayProps {
  content: ContentItem[];
  onClose?: () => void;
}

const AIContentDisplay: React.FC<AIContentDisplayProps> = ({ content, onClose }) => {
  const [isSaving, setIsSaving] = React.useState(false);
  
  if (!content || content.length === 0) {
    console.error("No content provided to AIContentDisplay");
    return (
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <AlertTriangle size={16} />
          <span>No content available to display</span>
        </div>
      </div>
    );
  }

  console.log("Rendering AIContentDisplay with content:", content[0]);
  
  // Get the content from either output or content property
  const rawContent = content[0]?.output || content[0]?.content || "";
  if (!rawContent) {
    console.error("Content item has no output or content property:", content[0]);
    return (
      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <AlertTriangle size={16} />
          <span>Content format is not recognized</span>
        </div>
        <pre className="mt-2 text-xs overflow-auto max-h-40 bg-amber-50/50 dark:bg-amber-900/10 p-2 rounded">
          {JSON.stringify(content[0], null, 2)}
        </pre>
      </div>
    );
  }

  // Parse different sections with multiple possible delimiters
  const fullContent = rawContent.trim();
  
  const sections = {
    pillar: "",
    support: "",
    meta: "",
    social: ""
  };
  
  // Extract pillar content (everything before any support content marker)
  const supportMarkers = ["### Support Content", "# Support Content", "<h1>Common Questions"];
  let pillarContent = fullContent;
  
  for (const marker of supportMarkers) {
    if (fullContent.includes(marker)) {
      pillarContent = fullContent.split(marker)[0];
      break;
    }
  }
  sections.pillar = pillarContent.trim();
  
  // Extract support content
  const supportStartRegex = /(### Support Content|# Support Content|<h1>Common Questions)/i;
  const metaStartRegex = /(### Meta Tags|# Meta Tags)/i;
  const socialStartRegex = /(### Social Media Posts|# Social Media Posts)/i;
  
  if (supportStartRegex.test(fullContent)) {
    const afterSupportMatch = fullContent.split(supportStartRegex)[1] || "";
    if (metaStartRegex.test(afterSupportMatch)) {
      sections.support = afterSupportMatch.split(metaStartRegex)[0].trim();
    } else if (socialStartRegex.test(afterSupportMatch)) {
      sections.support = afterSupportMatch.split(socialStartRegex)[0].trim();
    } else {
      sections.support = afterSupportMatch.trim();
    }
  }
  
  // Extract meta content
  if (metaStartRegex.test(fullContent)) {
    const afterMetaMatch = fullContent.split(metaStartRegex)[1] || "";
    if (socialStartRegex.test(afterMetaMatch)) {
      sections.meta = afterMetaMatch.split(socialStartRegex)[0].trim();
    } else {
      sections.meta = afterMetaMatch.trim();
    }
  }
  
  // Extract social content
  if (socialStartRegex.test(fullContent)) {
    sections.social = fullContent.split(socialStartRegex)[1].trim();
  }

  console.log("Parsed sections for display:", Object.keys(sections).filter(key => sections[key]));
  
  // If no sections were properly parsed, use raw content as pillar content
  if (!sections.pillar && !sections.support && !sections.meta && !sections.social) {
    console.log("No sections identified, using raw content as pillar content");
    sections.pillar = rawContent;
  }
  
  // Filter out empty sections
  const availableSections = Object.keys(sections).filter(key => sections[key].trim().length > 0);
  
  if (availableSections.length === 0) {
    console.error("No valid sections found in content");
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
  
  const handleSaveContent = async (type: string, content: string) => {
    try {
      setIsSaving(true);
      const { data, error } = await supabase
        .from('content_library')
        .insert([
          {
            content_type: type,
            content: content,
            title: `Generated ${type} content`,
            topic_area: 'asset-management',
            is_saved: true
          }
        ])
        .select();

      if (error) throw error;

      toast.success("Content saved successfully!", {
        description: `Your ${type} content has been saved to the library`
      });
      
      // Dispatch event to notify other components about content update
      window.dispatchEvent(new CustomEvent('content-updated'));

    } catch (error) {
      console.error('Error saving content:', error);
      toast.error("Failed to save content", {
        description: "Please try again or contact support"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success("Content copied to clipboard");
  };

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
              <ScrollArea className="h-[400px] w-full rounded-md border p-4 mt-4">
                <div className="prose dark:prose-invert max-w-none">
                  <div className="whitespace-pre-line">{sections[section]}</div>
                </div>
                <div className="flex space-x-2 mt-4">
                  <Button 
                    variant="outline"
                    onClick={() => handleCopyContent(sections[section])}
                  >
                    <Copy className="w-4 h-4 mr-2" /> Copy
                  </Button>
                  <Button 
                    onClick={() => handleSaveContent(section, sections[section])}
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save {section.charAt(0).toUpperCase() + section.slice(1)} Content
                      </>
                    )}
                  </Button>
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AIContentDisplay;
