
import React from "react";
import { Card } from "@/components/ui/card";
import { ContentItem } from "../types/content-library";
import ContentItemHeader from "./content-card/ContentItemHeader";
import ContentTopicArea from "./content-card/ContentTopicArea";
import ContentKeywords from "./content-card/ContentKeywords";
import ContentActions from "./content-card/ContentActions";

interface ContentCardProps {
  item: ContentItem;
  onCopy: (id: string) => Promise<void>;
  onClick: (id: string, topicArea: string) => void;
}

const ContentCard: React.FC<ContentCardProps> = ({ item, onCopy, onClick }) => {
  return (
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
          onView={(e) => {
            e.stopPropagation();
            onClick(item.id, item.topic_area || '');
          }}
          onCopy={(e) => {
            e.stopPropagation();
            onCopy(item.id);
          }}
        />
      </div>
    </Card>
  );
};

export default ContentCard;
