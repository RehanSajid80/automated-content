
import React from "react";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GenericContentItemProps {
  item: any;
  index: number;
}

export const GenericContentItem: React.FC<GenericContentItemProps> = ({ item, index }) => {
  // Determine if the item represents an error
  const isError = item?.error || 
                 (typeof item === 'string' && item.toLowerCase().includes('error')) ||
                 (item?.message && item.message.toLowerCase().includes('error'));
  
  // Extract error message if present
  const errorMessage = isError 
    ? (item?.error || item?.message || (typeof item === 'string' ? item : JSON.stringify(item)))
    : null;
  
  return (
    <div className={`p-4 border rounded-md ${isError ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800' : ''}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium">{item.title || `Content Item ${index + 1}`}</h3>
        {isError && <Badge variant="destructive" className="ml-2">Error</Badge>}
      </div>
      
      {isError ? (
        <div className="flex items-center gap-2 mt-2 text-red-600 dark:text-red-400">
          <AlertCircle className="h-4 w-4" />
          <div className="text-sm">{errorMessage}</div>
        </div>
      ) : (
        <pre className="mt-2 text-sm whitespace-pre-wrap overflow-auto max-h-[400px] bg-muted/50 p-2 rounded">
          {typeof item === 'string' ? item : JSON.stringify(item, null, 2)}
        </pre>
      )}
      
      {/* Display item keys and their types for better debugging */}
      <div className="mt-4 pt-2 border-t border-dashed">
        <p className="text-xs text-muted-foreground">Content structure:</p>
        <div className="grid grid-cols-2 gap-1 mt-1">
          {Object.keys(item || {}).map(key => (
            <div key={key} className="text-xs">
              <span className="font-mono">{key}:</span> 
              <Badge variant="outline" className="ml-1 text-xs">
                {Array.isArray(item[key]) ? 'array' : typeof item[key]}
                {Array.isArray(item[key]) && ` (${item[key].length})`}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
