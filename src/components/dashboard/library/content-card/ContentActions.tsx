
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, Copy, Loader2 } from "lucide-react";

interface ContentActionsProps {
  onView: (e: React.MouseEvent) => void;
  onCopy: (e: React.MouseEvent) => void;
  isLoading?: boolean;
}

const ContentActions: React.FC<ContentActionsProps> = ({ onView, onCopy, isLoading = false }) => {
  return (
    <div className="flex justify-end space-x-1">
      <Button 
        variant="ghost" 
        size="sm"
        className="h-8 text-xs"
        onClick={onView}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        ) : (
          <Eye className="h-3 w-3 mr-1" />
        )}
        View
      </Button>
      <Button 
        variant="ghost" 
        size="sm"
        className="h-8 text-xs"
        onClick={onCopy}
      >
        <Copy className="h-3 w-3 mr-1" />
        Copy
      </Button>
    </div>
  );
};

export default ContentActions;
