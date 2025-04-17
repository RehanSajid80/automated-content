
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Copy, CheckIcon, RefreshCw, Save } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentItem {
  id: string;
  title: string;
  content: string;
  content_type: string;
  topic_area: string;
  created_at: string;
  updated_at: string;
}

interface ContentDetailViewProps {
  contentIds: string[];
  topicArea: string;
  onBack: () => void;
}

const ContentDetailView: React.FC<ContentDetailViewProps> = ({ 
  contentIds, 
  topicArea,
  onBack
}) => {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState<{[key: string]: string}>({});
  const [editedTitle, setEditedTitle] = useState<{[key: string]: string}>({});
  const [isSaving, setIsSaving] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  useEffect(() => {
    if (contentIds.length > 0) {
      loadContentItems();
    }
  }, [contentIds]);

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

  const contentTypeLabels: Record<string, string> = {
    pillar: "Pillar Content",
    support: "Support Pages",
    meta: "Meta Tags",
    social: "Social Media Posts",
    all: "All Content"
  };

  const getTabContent = () => {
    if (activeTab === "all") {
      return Object.entries(groupedContent).map(([type, items]) => (
        <div key={type} className="mb-8">
          <h3 className="text-lg font-medium mb-4">{contentTypeLabels[type] || type}</h3>
          <div className="space-y-4">
            {items.map(item => renderContentItem(item))}
          </div>
        </div>
      ));
    }
    
    return (
      <div className="space-y-4">
        {(groupedContent[activeTab] || []).map(item => renderContentItem(item))}
      </div>
    );
  };

  const renderContentItem = (item: ContentItem) => {
    const isEditing = editingItem === item.id;
    const isContentSaving = isSaving[item.id] || false;
    
    return (
      <Card key={item.id} className={cn(
        "transition-all duration-200",
        isEditing ? "border-primary" : ""
      )}>
        <CardHeader className="pb-2">
          {isEditing ? (
            <Input
              value={editedTitle[item.id] || ''}
              onChange={(e) => handleTitleChange(item.id, e.target.value)}
              className="font-medium text-base"
              placeholder="Enter title"
            />
          ) : (
            <CardTitle className="text-base">{item.title || 'Untitled'}</CardTitle>
          )}
          <CardDescription className="text-xs flex justify-between items-center mt-1">
            <span>{new Date(item.created_at).toLocaleDateString()}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <Textarea
                value={editedContent[item.id] || ''}
                onChange={(e) => handleContentChange(item.id, e.target.value)}
                className="min-h-[150px] resize-y"
                placeholder="Enter content"
              />
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingItem(null)}
                  disabled={isContentSaving}
                >
                  Cancel
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => saveContent(item.id)}
                  disabled={isContentSaving}
                >
                  {isContentSaving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="whitespace-pre-wrap text-sm">
                {item.content || 'No content available.'}
              </div>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingItem(item.id)}
                >
                  Edit
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copyContent(item.id)}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBack}
            className="text-muted-foreground"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to selection
          </Button>
          <h2 className="text-xl font-semibold">{topicArea}</h2>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={loadContentItems}
          disabled={isLoading}
        >
          <RefreshCw className={cn("mr-2 h-4 w-4", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <RefreshCw className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : contentItems.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">No content items found.</p>
        </div>
      ) : (
        <div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="w-full border-b rounded-none justify-start">
              <TabsTrigger value="all">All</TabsTrigger>
              {Object.keys(groupedContent).map(type => (
                <TabsTrigger key={type} value={type}>
                  {contentTypeLabels[type] || type}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          
          {getTabContent()}
        </div>
      )}
    </div>
  );
};

export default ContentDetailView;
