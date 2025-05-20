
import React from "react";

interface ContentTopicAreaProps {
  topicArea: string | null;
}

const ContentTopicArea: React.FC<ContentTopicAreaProps> = ({ topicArea }) => {
  if (!topicArea) return null;
  
  return (
    <p className="text-xs text-muted-foreground mb-2">
      <span className="font-medium">Topic:</span> {topicArea}
    </p>
  );
};

export default ContentTopicArea;
