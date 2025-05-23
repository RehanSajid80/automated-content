
import React from "react";
import { AIContentItem } from "./AIContentItem";
import { GenericContentItem } from "./GenericContentItem";
import { NoContentWarning } from "./NoContentWarning";

interface FormattedContentProps {
  processedContent: any[];
}

export const FormattedContent: React.FC<FormattedContentProps> = ({ processedContent }) => {
  if (!processedContent || processedContent.length === 0) {
    return <NoContentWarning />;
  }

  return (
    <div className="space-y-6">
      {processedContent.map((item, index) => {
        // Check if it's in AI Content Suggestions format
        const isAIContent = item.pillarContent !== undefined || 
                           item.supportContent !== undefined || 
                           item.socialMediaPosts !== undefined || 
                           item.emailSeries !== undefined;
        
        return isAIContent ? 
          <AIContentItem key={index} item={item} index={index} /> : 
          <GenericContentItem key={index} item={item} index={index} />;
      })}
    </div>
  );
};
