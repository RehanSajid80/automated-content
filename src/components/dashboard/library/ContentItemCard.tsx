
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentItemProps {
  id: string;
  title: string;
  content_type: string;
  topic_area: string | null;
  created_at: string;
  updated_at: string;
  keywords: string[];
  is_saved: boolean;
}

interface ContentItemCardProps {
  item: ContentItemProps;
  copyContent: (contentId: string) => void;
  viewContent: (contentId: string, topicArea: string) => void;
  getIcon: (type: string) => JSX.Element;
  getTypeClass: (type: string) => string;
  getTypeLabel: (type: string) => string;
  formatDate: (dateString: string) => string;
}

const ContentItemCard: React.FC<ContentItemCardProps> = ({
  item,
  copyContent,
  viewContent,
  getIcon,
  getTypeClass,
  getTypeLabel,
  formatDate
}) => {
  return (
    <Card 
      key={item.id} 
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => viewContent(item.id, item.topic_area || '')}
    >
      <div className="p-4">
        <div className="flex items-start mb-4">
          <div className={cn(
            "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-3",
            getTypeClass(item.content_type)
          )}>
            {getIcon(item.content_type)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm line-clamp-2">{item.title || "Untitled Content"}</h4>
            <p className="text-xs text-muted-foreground mt-1">
              {getTypeLabel(item.content_type)} • {formatDate(item.created_at)}
            </p>
          </div>
        </div>
        
        {item.topic_area && (
          <p className="text-xs text-muted-foreground mb-2">
            <span className="font-medium">Topic:</span> {item.topic_area}
          </p>
        )}
        
        <div className="flex flex-wrap gap-1 mb-3">
          {item.keywords && item.keywords.length > 0 ? (
            item.keywords.slice(0, 3).map((keyword, i) => (
              <span 
                key={i}
                className="inline-flex text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
              >
                {keyword}
              </span>
            ))
          ) : (
            <span className="text-xs text-muted-foreground italic">No keywords</span>
          )}
          {item.keywords && item.keywords.length > 3 && (
            <span className="text-xs text-muted-foreground">+{item.keywords.length - 3} more</span>
          )}
        </div>
        
        <div className="flex justify-end space-x-1">
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              viewContent(item.id, item.topic_area || '');
            }}
          >
            <Eye className="h-3 w-3 mr-1" />
            View
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 text-xs"
            onClick={(e) => {
              e.stopPropagation();
              copyContent(item.id);
            }}
          >
            <Copy className="h-3 w-3 mr-1" />
            Copy
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ContentItemCard;
