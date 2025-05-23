
import React from "react";

interface GenericContentItemProps {
  item: any;
  index: number;
}

export const GenericContentItem: React.FC<GenericContentItemProps> = ({ item, index }) => {
  return (
    <div className="p-4 border rounded-md">
      <h3 className="font-medium">{item.title || `Content Item ${index + 1}`}</h3>
      <pre className="mt-2 text-sm whitespace-pre-wrap overflow-auto">
        {typeof item === 'string' ? item : JSON.stringify(item, null, 2)}
      </pre>
    </div>
  );
};
