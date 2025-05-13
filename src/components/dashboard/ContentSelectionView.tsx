import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckSquare2Icon, ArrowRightIcon, EyeIcon, Loader2 } from "lucide-react";
import ContentRefreshManager from "./ContentViewRefreshManager";

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
  const [createdContentIds, setCreatedContentIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);

  // Memoized function to load content items to prevent unnecessary re-renders
  const loadContentItems = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('content_library')
        .select('*')
        .eq('topic_area', topicArea)
        .order('content_type');

      if (error) {
        console.error('Error loading content items:', error);
        toast.error("Error", {
          description: "Failed to load content items"
        });
        return;
      }

      setContentItems(data || []);
      setLastRefreshed(new Date().toISOString());
    } catch (error) {
      console.error('Error in loadContentItems:', error);
      toast.error("Error", {
          description: "An unexpected error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  }, [topicArea]);

  // Handle content refresh with loading state
  const refreshContent = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await loadContentItems();
    } finally {
      setIsRefreshing(false);
    }
  }, [loadContentItems, isRefreshing]);

  useEffect(() => {
    loadContentItems();
    
    // Add event listener for content updates
    const handleContentUpdated = () => {
      refreshContent();
    };
    
    window.addEventListener('content-updated', handleContentUpdated);
    
    return () => {
      window.removeEventListener('content-updated', handleContentUpdated);
    };
  }, [topicArea, loadContentItems, refreshContent]);

  const toggleItemSelection = (id: string) => {
    setSelectedItems(current => 
      current.includes(id)
        ? current.filter(itemId => itemId !== id)
        : [...current, id]
    );
  };

  const viewCreatedContent = () => {
    // Navigate to a detailed view of the created content
    window.dispatchEvent(new CustomEvent('navigate-to-content-details', { 
      detail: { contentIds: createdContentIds, topicArea } 
    }));
  };

  const createSelectedContent = async () => {
    if (selectedItems.length === 0) {
      toast.error("No Items Selected", {
        description: "Please select at least one content item to create"
      });
      return;
    }

    try {
      setIsCreating(true);
      
      // First, show a toast to indicate the process is starting
      toast.success("Creating Content", {
        description: `Starting to create ${selectedItems.length} content items...`
      });

      // Mark the items as selected in the database
      const { error } = await supabase
        .from('content_library')
        .update({ is_selected: true })
        .in('id', selectedItems);

      if (error) throw error;
      
      // Store the created content IDs
      setCreatedContentIds(selectedItems);
      
      // Fetch the selected content items for the confirmation
      const { data: selectedContentData, error: fetchError } = await supabase
        .from('content_library')
        .select('title, content_type')
        .in('id', selectedItems);
        
      if (fetchError) throw fetchError;
      
      // Group content by type for the toast message
      const contentSummary = selectedContentData.reduce((acc, item) => {
        const type = item.content_type;
        if (!acc[type]) acc[type] = 0;
        acc[type]++;
        return acc;
      }, {} as Record<string, number>);
      
      const summaryText = Object.entries(contentSummary)
        .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
        .join(', ');

      // Create a button element for viewing content
      const viewContentButton = (
        <Button 
          size="sm" 
          variant="secondary" 
          onClick={viewCreatedContent}
          className="ml-2"
        >
          View Content
        </Button>
      );

      // Show success toast with content details and action button
      toast.success("Content Created Successfully", {
        description: `Created ${summaryText} for "${topicArea}". Click 'View Content' to review.`,
        action: viewContentButton
      });

      // Refresh the content items
      await refreshContent();
      
      // Clear selection
      setSelectedItems([]);
      
      // Dispatch content creation event for other components
      window.dispatchEvent(new CustomEvent('content-created', { 
        detail: { selectedItems, topicArea, createdContentIds: selectedItems } 
      }));
      
      // Also dispatch content-selected event for compatibility
      window.dispatchEvent(new CustomEvent('content-selected', { 
        detail: { selectedItems, topicArea } 
      }));

    } catch (error) {
      console.error('Error creating content:', error);
      toast.error("Error saving content", {
        description: "Failed to create content items. Please try again."
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
      <div className="flex justify-between items-center">
        <div className="text-xl font-semibold">{topicArea}</div>
        <ContentRefreshManager 
          isRefreshing={isRefreshing}
          onRefresh={refreshContent}
          lastRefreshed={lastRefreshed || undefined}
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading content...</p>
          </div>
        </div>
      ) : (
        <>
          {createdContentIds.length > 0 && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 my-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare2Icon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-green-800 dark:text-green-400">
                    Content created successfully!
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={viewCreatedContent}
                  className="text-green-600 border-green-300 hover:border-green-500 hover:bg-green-50"
                >
                  <EyeIcon className="h-4 w-4 mr-1" />
                  View Created Content
                </Button>
              </div>
            </div>
          )}

          {Object.entries(contentTypes).map(([type, title]) => (
            <Card key={type} className={!groupedContent[type]?.length ? "opacity-60" : ""}>
              <CardHeader>
                <CardTitle className="text-lg">{title}</CardTitle>
              </CardHeader>
              <CardContent>
                {!groupedContent[type]?.length ? (
                  <p className="text-sm text-muted-foreground py-2">No {title.toLowerCase()} available</p>
                ) : (
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
                )}
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
        </>
      )}
    </div>
  );
};
