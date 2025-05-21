
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { ContentItem } from "../types/content-library";
import ContentItemHeader from "./content-card/ContentItemHeader";
import ContentTopicArea from "./content-card/ContentTopicArea";
import ContentKeywords from "./content-card/ContentKeywords";
import ContentActions from "./content-card/ContentActions";
import ContentViewDialog from "./ContentViewDialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ContentCardProps {
  item: ContentItem;
  onCopy: (id: string) => Promise<void>;
  onClick: (id: string, topicArea: string) => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ item, onCopy, onClick }) => {
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [contentText, setContentText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleViewClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from('content_library')
        .select('content')
        .eq('id', item.id)
        .single();

      if (error) throw error;
      
      setContentText(data?.content || "No content found");
      setViewDialogOpen(true);
    } catch (error) {
      console.error("Error fetching content:", error);
      toast({
        title: "Error",
        description: "Failed to load content",
        variant: "destructive",
      });
      setContentText("Failed to load content");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card 
        key={item.id} 
        className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onClick(item.id, item.topic_area || '')}
      >
        <div className="p-4">
          <ContentItemHeader item={item} />
          
          <ContentTopicArea topicArea={item.topic_area} />
          
          <ContentKeywords keywords={item.keywords} />
          
          <ContentActions 
            onView={handleViewClick}
            onCopy={(e) => {
              e.stopPropagation();
              onCopy(item.id);
            }}
            isLoading={isLoading}
          />
        </div>
      </Card>
      
      <ContentViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        title={item.title}
        content={contentText}
      />
    </>
  );
};

export default ContentCard;
