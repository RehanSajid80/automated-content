
import React from "react";

interface ContentSelectorProps {
  generatedContent: any[];
  activeItem: number;
  setActiveItem: (index: number) => void;
}

export const ContentSelector: React.FC<ContentSelectorProps> = ({
  generatedContent,
  activeItem,
  setActiveItem
}) => {
  if (generatedContent.length <= 1) {
    return null;
  }

  return (
    <div className="flex space-x-2 overflow-x-auto pb-2">
      {generatedContent.map((_, idx) => (
        <button
          key={idx}
          className={`px-3 py-1 text-sm rounded-md ${
            activeItem === idx
              ? "bg-primary text-primary-foreground"
              : "bg-muted hover:bg-muted/80"
          }`}
          onClick={() => setActiveItem(idx)}
        >
          Item {idx + 1}
        </button>
      ))}
    </div>
  );
};
