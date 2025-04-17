
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
  const [isCreating, setIsCreating] = useState(false);
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
      setIsCreating(true);
      
      // First, mark the items as selected in the database
      const { error } = await supabase
        .from('content_library')
        .update({ is_selected: true })
        .in('id', selectedItems);

      if (error) throw error;
      
      // Fetch the selected content items to display in the confirmation toast
      const { data: selectedContentData, error: fetchError } = await supabase
        .from('content_library')
        .select('title, content_type')
        .in('id', selectedItems);
        
      if (fetchError) throw fetchError;
      
      // Group content by type for a better toast message
      const contentSummary = selectedContentData.reduce((acc, item) => {
        const type = item.content_type;
        if (!acc[type]) acc[type] = 0;
        acc[type]++;
        return acc;
      }, {} as Record<string, number>);
      
      const summaryText = Object.entries(contentSummary)
        .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
        .join(', ');

      toast({
        title: "Content Created",
        description: `Successfully created ${summaryText} for "${topicArea}"`,
      });

      // Refresh the content items to show updated state
      await loadContentItems();
      
      // Clear selection after successful creation
      setSelectedItems([]);
      
      // Dispatch event to notify other components about content creation
      window.dispatchEvent(new CustomEvent('content-created', { 
        detail: { selectedItems, topicArea } 
      }));
      
      // Also dispatch the standard content-selected event for compatibility
      window.dispatchEvent(new CustomEvent('content-selected', { 
        detail: { selectedItems, topicArea } 
      }));
      
      // Force a refresh of any components that show content from Supabase
      window.dispatchEvent(new CustomEvent('content-updated'));

      // Navigate back to the dashboard after content creation
      window.dispatchEvent(new CustomEvent('navigate-to-tab', { 
        detail: { tab: 'dashboard' } 
      }));

    } catch (error) {
      console.error('Error creating content:', error);
      toast({
        title: "Error",
        description: "Failed to create content items",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
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
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                Creating Content...
              </>
            ) : (
              <>
                <CheckSquare2Icon className="h-5 w-5" />
                Create {selectedItems.length} Selected Content Items
                <ArrowRightIcon className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
