
import React from "react";
import { RefreshCw, FileText } from "lucide-react";
import ContentCard from "./ContentCard";
import { ContentGridProps } from "../types/content-library";

const ContentGrid: React.FC<ContentGridProps> = ({ 
  items, 
  isLoading, 
  copyContent, 
  viewContent 
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 w-full">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (items.length === 0) {
    return (
      <div className="text-center py-20 border rounded-lg border-dashed w-full">
        <FileText className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-medium">No content found</h3>
        <p className="text-muted-foreground mt-2">
          Create some content to see it here
        </p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
      {items.map((item) => (
        <ContentCard 
          key={item.id} 
          item={item} 
          onCopy={copyContent} 
          onClick={viewContent} 
        />
      ))}
    </div>
  );
};

export default ContentGrid;
