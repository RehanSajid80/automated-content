
import React from "react";

interface ContentGenerationHeaderProps {
  isLoading: boolean;
}

export const ContentGenerationHeader: React.FC<ContentGenerationHeaderProps> = ({ isLoading }) => {
  return (
    <h3 className="text-base font-medium mb-3">
      {isLoading ? "Generating AI Content..." : "AI Content Suggestions"}
    </h3>
  );
};
