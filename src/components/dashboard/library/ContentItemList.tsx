
import React from "react";
import { RefreshCw, FileText } from "lucide-react";
import ContentItemCard from "./ContentItemCard";

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

interface ContentItemListProps {
  isLoading: boolean;
  filteredItems: ContentItemProps[];
  copyContent: (contentId: string) => void;
  viewContent: (contentId: string, topicArea: string) => void;
  getIcon: (type: string) => JSX.Element;
  getTypeClass: (type: string) => string;
  getTypeLabel: (type: string) => string;
  formatDate: (dateString: string) => string;
  searchTerm: string;
}

const ContentItemList: React.FC<ContentItemListProps> = ({
  isLoading,
  filteredItems,
  copyContent,
  viewContent,
  getIcon,
  getTypeClass,
  getTypeLabel,
  formatDate,
  searchTerm
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (filteredItems.length === 0) {
    return (
      <div className="text-center py-20 border rounded-lg border-dashed">
        <FileText className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-medium">No content found</h3>
        <p className="text-muted-foreground mt-2">
          {searchTerm ? "Try adjusting your search terms" : "Create some content to see it here"}
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredItems.map((item) => (
        <ContentItemCard
          key={item.id}
          item={item}
          copyContent={copyContent}
          viewContent={viewContent}
          getIcon={getIcon}
          getTypeClass={getTypeClass}
          getTypeLabel={getTypeLabel}
          formatDate={formatDate}
        />
      ))}
    </div>
  );
};

export default ContentItemList;
