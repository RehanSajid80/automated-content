
import React from "react";
import { Eye, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ContentItem } from "../types/recent-content";
import { getIcon, getTypeLabel, getTypeClass } from "../utils/content-type-utils";
import { formatDate } from "../utils/date-utils";

interface ContentListItemProps {
  content: ContentItem;
  onCopy: (id: string) => void;
  onClick: (id: string, type: string) => void;
}

export const ContentListItem = ({ content, onCopy, onClick }: ContentListItemProps) => {
  return (
    <div 
      className="flex items-start space-x-4 p-4 rounded-lg border border-border hover:bg-secondary/30 transition-colors cursor-pointer"
      onClick={() => onClick(content.id, content.content_type)}
    >
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
        getTypeClass(content.content_type)
      )}>
        {getIcon(content.content_type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium truncate">{content.title}</h4>
        <div className="mt-1 flex items-center text-xs text-muted-foreground">
          <span className="inline-flex items-center">
            {getTypeLabel(content.content_type)}
          </span>
          <span className="mx-2">•</span>
          <span>{formatDate(content.created_at)}</span>
          {content.views && (
            <>
              <span className="mx-2">•</span>
              <span className="inline-flex items-center">
                <Eye size={12} className="mr-1" />
                {content.views}
              </span>
            </>
          )}
        </div>
        
        <div className="mt-2 flex flex-wrap gap-1">
          {content.keywords && content.keywords.length > 0 ? (
            content.keywords.slice(0, 3).map((keyword, i) => (
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
          {content.keywords && content.keywords.length > 3 && (
            <span className="text-xs text-muted-foreground">+{content.keywords.length - 3} more</span>
          )}
        </div>
      </div>
      
      <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onCopy(content.id);
          }}
        >
          <Copy size={14} />
        </Button>
      </div>
    </div>
  );
};
