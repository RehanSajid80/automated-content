
import React from "react";
import { cn } from "@/lib/utils";
import { ContentItem } from "../../types/content-library";
import { getIcon, getTypeLabel, getTypeClass } from "../../utils/content-type-utils";

interface ContentItemHeaderProps {
  item: ContentItem;
}

const ContentItemHeader: React.FC<ContentItemHeaderProps> = ({ item }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Extract job title from topic_area or target_persona for misc items
  const getJobTitle = () => {
    if (item.content_type === 'misc') {
      // For misc items, use target_persona if available, otherwise target_format
      return item.topic_area || 'Adjusted Content';
    }
    return item.topic_area;
  };

  const jobTitle = getJobTitle();

  return (
    <div className="flex items-start mb-4">
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3",
        getTypeClass(item.content_type)
      )}>
        {getIcon(item.content_type)}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm line-clamp-2">{item.title || "Untitled Content"}</h4>
        {jobTitle && (
          <p className="text-xs font-medium text-blue-600 mt-1">{jobTitle}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {getTypeLabel(item.content_type)} • {formatDate(item.created_at)}
        </p>
      </div>
    </div>
  );
};

export default ContentItemHeader;
