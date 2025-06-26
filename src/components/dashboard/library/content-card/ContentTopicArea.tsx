
import React from "react";
import { topicAreas } from "@/data/topicAreas";

interface ContentTopicAreaProps {
  topicArea: string | null;
}

const ContentTopicArea: React.FC<ContentTopicAreaProps> = ({ topicArea }) => {
  if (!topicArea) return null;
  
  // Find the matching topic area from the data to get the display name
  const topicAreaData = topicAreas.find(area => area.id === topicArea);
  const displayName = topicAreaData ? topicAreaData.name : topicArea;
  
  return (
    <p className="text-xs text-muted-foreground mb-2">
      <span className="font-medium">Topic:</span> {displayName}
    </p>
  );
};

export default ContentTopicArea;
