
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ContentItem {
  id: string;
  title: string;
  content: string;
  content_type: string;
  topic_area: string;
  created_at: string;
  updated_at: string;
}

export const useContentDetailData = (contentIds: string[]) => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<{[key: string]: string}>({});
  const [editedTitle, setEditedTitle] = useState<{[key: string]: string}>({});
  const [isSaving, setIsSaving] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  const loadContentItems = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('content_library')
        .select('*')
        .in('id', contentIds);

      if (error) {
        throw error;
      }

      setContentItems(data || []);
      
      // Initialize editing state
      const initialContent: {[key: string]: string} = {};
      const initialTitle: {[key: string]: string} = {};
      data?.forEach(item => {
        initialContent[item.id] = item.content || '';
        initialTitle[item.id] = item.title || '';
      });
      
      setEditedContent(initialContent);
      setEditedTitle(initialTitle);
      
      // Set the first content type as the active tab
      if (data && data.length > 0) {
        const types = Array.from(new Set(data.map(item => item.content_type)));
        if (types.length > 0) {
          setActiveTab(types[0]);
        }
      }
    } catch (error) {
      console.error("Error loading content items:", error);
      toast({
        title: "Error",
        description: "Failed to load content items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleContentChange = (id: string, value: string) => {
    setEditedContent(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleTitleChange = (id: string, value: string) => {
    setEditedTitle(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const saveContent = async (id: string) => {
    setIsSaving(prev => ({ ...prev, [id]: true }));
    
    try {
      const { error } = await supabase
        .from('content_library')
        .update({
          content: editedContent[id],
          title: editedTitle[id],
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        throw error;
      }

      toast({
        title: "Content saved",
        description: "Your changes have been saved successfully",
      });
      
      // Update the local state
      setContentItems(prev => 
        prev.map(item => 
          item.id === id 
            ? { ...item, content: editedContent[id], title: editedTitle[id] } 
            : item
        )
      );
      
      setEditingItem(null);
    } catch (error) {
      console.error("Error saving content:", error);
      toast({
        title: "Error",
        description: "Failed to save content changes",
        variant: "destructive",
      });
    } finally {
      setIsSaving(prev => ({ ...prev, [id]: false }));
    }
  };

  const copyContent = async (id: string) => {
    try {
      const content = contentItems.find(item => item.id === id)?.content;
      if (content) {
        await navigator.clipboard.writeText(content);
        toast({
          title: "Copied to clipboard",
          description: "Content copied successfully",
        });
      }
    } catch (error) {
      console.error("Error copying content:", error);
      toast({
        title: "Error",
        description: "Failed to copy content",
        variant: "destructive",
      });
    }
  };

  // Group content items by type
  const groupedContent = contentItems.reduce((acc, item) => {
    if (!acc[item.content_type]) {
      acc[item.content_type] = [];
    }
    acc[item.content_type].push(item);
    return acc;
  }, {} as Record<string, ContentItem[]>);

  useEffect(() => {
    if (contentIds.length > 0) {
      loadContentItems();
    }
  }, [contentIds]);

  return {
    contentItems,
    groupedContent,
    activeTab,
    setActiveTab,
    isLoading,
    editingItem,
    setEditingItem,
    editedContent,
    editedTitle,
    isSaving,
    handleContentChange,
    handleTitleChange,
    saveContent,
    copyContent,
    loadContentItems
  };
};
