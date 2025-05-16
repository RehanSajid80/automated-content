
import React from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedContentCardProps {
  content: string;
  onContentChange: (content: string) => void;
  onRegenerateContent: () => void;
  onSaveContent: () => void;
  contentType: string;
}

export const GeneratedContentCard: React.FC<GeneratedContentCardProps> = ({
  content,
  onContentChange,
  onRegenerateContent,
  onSaveContent,
  contentType
}) => {
  const handleCopyContent = () => {
    navigator.clipboard.writeText(content);
    toast("Content copied to clipboard", {
      description: "You can now paste it wherever you need it."
    });
  };

  // Custom save handler with proper table routing
  const handleSaveContent = async () => {
    try {
      if (contentType === 'social') {
        // Save to the dedicated social_posts table
        const { data, error } = await supabase
          .from('social_posts')
          .insert([
            {
              content: content,
              platform: 'linkedin', // Default platform
              title: 'Social Media Posts',
              topic_area: 'workspace-management',
              keywords: [] // Empty array for now
            }
          ])
          .select();

        if (error) throw error;
        
        toast.success("Social post saved successfully", {
          description: "Your post has been added to the social posts library"
        });
        
        // Trigger content refresh
        window.dispatchEvent(new Event('content-updated'));
      } else {
        // Use the default save handler for other content types
        onSaveContent();
      }
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Failed to save content");
    }
  };

  return (
    <Card className="mt-6 animate-fade-in w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Generated Content</CardTitle>
        <CardDescription>Based on your specified keywords and parameters</CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea 
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="min-h-[200px] font-mono text-sm w-full"
        />
      </CardContent>
      <CardFooter className="flex justify-end pt-3">
        <Button variant="outline" size="sm" className="mr-2" onClick={onRegenerateContent}>
          Regenerate
        </Button>
        <Button variant="outline" size="sm" className="mr-2" onClick={handleCopyContent}>
          Copy
        </Button>
        <Button size="sm" onClick={contentType === 'social' ? handleSaveContent : onSaveContent}>
          <Save size={14} className="mr-2" /> 
          {contentType === 'social' ? 'Save Social Post' : `Save ${contentType.charAt(0).toUpperCase() + contentType.slice(1)} Content`}
        </Button>
      </CardFooter>
    </Card>
  );
};
