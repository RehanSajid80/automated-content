import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckSquare2Icon, ArrowRightIcon } from "lucide-react";

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
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
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

  const toggleItemSelection = (id: string) => {
    setSelectedItems(current => 
      current.includes(id)
        ? current.filter(itemId => itemId !== id)
        : [...current, id]
    );
  };

  const createSelectedContent = async () => {
    if (selectedItems.length === 0) {
      toast({
        title: "No Items Selected",
        description: "Please select at least one content item to create",
        variant: "default",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('content_library')
        .update({ is_selected: true })
        .in('id', selectedItems);

      if (error) throw error;

      toast({
        title: "Content Selected",
        description: `${selectedItems.length} content item(s) marked for creation`,
      });

      window.dispatchEvent(new CustomEvent('content-selected', { 
        detail: { selectedItems, topicArea } 
      }));

    } catch (error) {
      console.error('Error selecting content:', error);
      toast({
        title: "Error",
        description: "Failed to select content items",
        variant: "destructive",
      });
    }
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
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={() => toggleItemSelection(item.id)}
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
      
      {selectedItems.length > 0 && (
        <div className="fixed bottom-4 left-0 right-0 flex justify-center z-50">
          <Button 
            onClick={createSelectedContent}
            className="flex items-center gap-2 shadow-lg"
          >
            <CheckSquare2Icon className="h-5 w-5" />
            Create {selectedItems.length} Selected Content Items
            <ArrowRightIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};
