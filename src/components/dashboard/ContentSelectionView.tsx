
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ContentItem {
  id: string;
  title: string;
  content: string;
  content_type: string;
  is_selected: boolean;
}

interface ContentSelectionViewProps {
  topicArea: string;
}

export const ContentSelectionView = ({ topicArea }: ContentSelectionViewProps) => {
  const [contentItems, setContentItems] = React.useState<ContentItem[]>([]);
  const { toast } = useToast();

  React.useEffect(() => {
    loadContentItems();
  }, [topicArea]);

  const loadContentItems = async () => {
    const { data, error } = await supabase
      .from('content_library')
      .select('*')
      .eq('topic_area', topicArea)
      .order('content_type');

    if (error) {
      console.error('Error loading content items:', error);
      toast({
        title: "Error",
        description: "Failed to load content items",
        variant: "destructive",
      });
      return;
    }

    setContentItems(data || []);
  };

  const toggleItemSelection = async (id: string, currentValue: boolean) => {
    const { error } = await supabase
      .from('content_library')
      .update({ is_selected: !currentValue })
      .eq('id', id);

    if (error) {
      console.error('Error updating selection:', error);
      toast({
        title: "Error",
        description: "Failed to update selection",
        variant: "destructive",
      });
      return;
    }

    setContentItems(items =>
      items.map(item =>
        item.id === id ? { ...item, is_selected: !currentValue } : item
      )
    );
  };

  const groupedContent = contentItems.reduce((acc, item) => {
    if (!acc[item.content_type]) {
      acc[item.content_type] = [];
    }
    acc[item.content_type].push(item);
    return acc;
  }, {} as Record<string, ContentItem[]>);

  const contentTypes = {
    pillar: "Pillar Content",
    support: "Support Pages",
    meta: "Meta Tags",
    social: "Social Media Posts"
  };

  return (
    <div className="space-y-6">
      <div className="text-xl font-semibold">{topicArea}</div>
      {Object.entries(contentTypes).map(([type, title]) => (
        <Card key={type}>
          <CardHeader>
            <CardTitle className="text-lg">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {groupedContent[type]?.map((item) => (
                <div key={item.id} className="flex items-start space-x-3">
                  <Checkbox
                    checked={item.is_selected}
                    onCheckedChange={(checked) => 
                      toggleItemSelection(item.id, item.is_selected)
                    }
                    id={item.id}
                  />
                  <label
                    htmlFor={item.id}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {item.title || item.content}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
