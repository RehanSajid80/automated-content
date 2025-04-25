
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AIContentDisplayProps {
  content: {
    output: string;
  }[];
  onClose?: () => void;
}

const AIContentDisplay: React.FC<AIContentDisplayProps> = ({ content, onClose }) => {
  if (!content || content.length === 0) return null;

  const output = content[0].output;

  // Parse different sections
  const sections = {
    pillar: output.split("### Support Content")[0],
    support: output.split("### Support Content")[1]?.split("### Meta Tags")[0],
    meta: output.split("### Meta Tags")[1]?.split("### Social Media Posts")[0],
    social: output.split("### Social Media Posts")[1]
  };

  const handleSaveContent = async (type: string, content: string) => {
    try {
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
        .single();

      if (error) throw error;

      toast.success("Content saved successfully!", {
        description: `Your ${type} content has been saved to the library`
      });

    } catch (error) {
      console.error('Error saving content:', error);
      toast.error("Failed to save content", {
        description: "Please try again or contact support"
      });
    }
  };

  return (
    <Card className="mt-6 animate-fade-in">
      <CardHeader>
        <CardTitle>AI Generated Content</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pillar" className="w-full">
          <TabsList>
            <TabsTrigger value="pillar">Pillar Content</TabsTrigger>
            <TabsTrigger value="support">Support Content</TabsTrigger>
            <TabsTrigger value="meta">Meta Tags</TabsTrigger>
            <TabsTrigger value="social">Social Posts</TabsTrigger>
          </TabsList>

          <TabsContent value="pillar">
            <ScrollArea className="h-[500px] w-full rounded-md border p-4">
              <div dangerouslySetInnerHTML={{ __html: sections.pillar }} />
              <Button 
                onClick={() => handleSaveContent('pillar', sections.pillar)}
                className="mt-4"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Pillar Content
              </Button>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="support">
            <ScrollArea className="h-[500px] w-full rounded-md border p-4">
              <div dangerouslySetInnerHTML={{ __html: sections.support }} />
              <Button 
                onClick={() => handleSaveContent('support', sections.support)}
                className="mt-4"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Support Content
              </Button>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="meta">
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              <div dangerouslySetInnerHTML={{ __html: sections.meta }} />
              <Button 
                onClick={() => handleSaveContent('meta', sections.meta)}
                className="mt-4"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Meta Content
              </Button>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="social">
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              <div className="space-y-4">
                {sections.social?.split('\n\n').filter(post => post.trim()).map((post, index) => (
                  <Card key={index} className="p-4">
                    <p>{post}</p>
                  </Card>
                ))}
              </div>
              <Button 
                onClick={() => handleSaveContent('social', sections.social)}
                className="mt-4"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Social Posts
              </Button>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AIContentDisplay;
