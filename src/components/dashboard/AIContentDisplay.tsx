
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Save, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface AIContentDisplayProps {
  content: {
    output: string;
    content?: string; // Make content optional to handle different response formats
  }[];
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
  const rawContent = content[0].output || (content[0] as any).content || "";
  if (!rawContent) {
    console.error("Content item has no output property:", content[0]);
    return null;
  }

  // Parse different sections
  const fullContent = rawContent.trim();
  
  // More robust section parsing
  const sections = {
    pillar: fullContent.split("### Support Content")[0]?.trim() || fullContent,
    support: "",
    meta: "",
    social: ""
  };
  
  if (fullContent.includes("### Support Content")) {
    const afterSupport = fullContent.split("### Support Content")[1] || "";
    sections.support = afterSupport.split("### Meta Tags")[0]?.trim() || 
                        afterSupport.split("### Social Media Posts")[0]?.trim() || 
                        afterSupport.trim();
  }
  
  if (fullContent.includes("### Meta Tags")) {
    const afterMeta = fullContent.split("### Meta Tags")[1] || "";
    sections.meta = afterMeta.split("### Social Media Posts")[0]?.trim() || 
                    afterMeta.trim();
  }
  
  if (fullContent.includes("### Social Media Posts")) {
    sections.social = fullContent.split("### Social Media Posts")[1]?.trim() || "";
  }

  console.log("Parsed sections for display:", sections);
  
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
        .single();

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

  return (
    <Card className="animate-fade-in">
      <CardContent className="pt-6">
        <Tabs defaultValue="pillar" className="w-full">
          <TabsList>
            <TabsTrigger value="pillar">Pillar Content</TabsTrigger>
            {sections.support && <TabsTrigger value="support">Support Content</TabsTrigger>}
            {sections.meta && <TabsTrigger value="meta">Meta Tags</TabsTrigger>}
            {sections.social && <TabsTrigger value="social">Social Posts</TabsTrigger>}
          </TabsList>

          {/* Pillar Content Tab */}
          <TabsContent value="pillar">
            <ScrollArea className="h-[400px] w-full rounded-md border p-4 mt-4">
              <div className="prose dark:prose-invert max-w-none">
                {sections.pillar ? (
                  <div className="whitespace-pre-line">{sections.pillar}</div>
                ) : (
                  <p className="text-muted-foreground">No pillar content available</p>
                )}
              </div>
              {sections.pillar && (
                <Button 
                  onClick={() => handleSaveContent('pillar', sections.pillar)}
                  className="mt-4"
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
                      Save Pillar Content
                    </>
                  )}
                </Button>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Support Content Tab */}
          {sections.support && (
            <TabsContent value="support">
              <ScrollArea className="h-[400px] w-full rounded-md border p-4 mt-4">
                <div className="prose dark:prose-invert max-w-none">
                  <div className="whitespace-pre-line">{sections.support}</div>
                </div>
                <Button 
                  onClick={() => handleSaveContent('support', sections.support)}
                  className="mt-4"
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
                      Save Support Content
                    </>
                  )}
                </Button>
              </ScrollArea>
            </TabsContent>
          )}

          {/* Meta Tags Tab */}
          {sections.meta && (
            <TabsContent value="meta">
              <ScrollArea className="h-[300px] w-full rounded-md border p-4 mt-4">
                <div className="prose dark:prose-invert max-w-none">
                  <div className="whitespace-pre-line">{sections.meta}</div>
                </div>
                <Button 
                  onClick={() => handleSaveContent('meta', sections.meta)}
                  className="mt-4"
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
                      Save Meta Content
                    </>
                  )}
                </Button>
              </ScrollArea>
            </TabsContent>
          )}

          {/* Social Posts Tab */}
          {sections.social && (
            <TabsContent value="social">
              <ScrollArea className="h-[300px] w-full rounded-md border p-4 mt-4">
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
                      Save Social Posts
                    </>
                  )}
                </Button>
              </ScrollArea>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AIContentDisplay;
