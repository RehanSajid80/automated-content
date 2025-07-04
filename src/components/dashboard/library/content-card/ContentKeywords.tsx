
import React from "react";

interface ContentKeywordsProps {
  keywords: string[];
}

const ContentKeywords: React.FC<ContentKeywordsProps> = ({ keywords }) => {
  console.log("ContentKeywords: Received keywords:", keywords);
  
  if (!keywords || keywords.length === 0) {
    return null; // Don't show anything instead of "No keywords"
  }

  return (
    <div className="flex flex-wrap gap-1 mb-3">
      {keywords.slice(0, 3).map((keyword, i) => (
        <span 
          key={i}
          className="inline-flex text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
        >
          {keyword}
        </span>
      ))}
      {keywords.length > 3 && (
        <span className="text-xs text-muted-foreground">+{keywords.length - 3} more</span>
      )}
    </div>
  );
};

export default ContentKeywords;
