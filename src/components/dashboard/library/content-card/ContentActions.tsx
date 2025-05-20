
import React from "react";
import { Button } from "@/components/ui/button";
import { Eye, Copy } from "lucide-react";

interface ContentActionsProps {
  onView: (e: React.MouseEvent) => void;
  onCopy: (e: React.MouseEvent) => void;
}

const ContentActions: React.FC<ContentActionsProps> = ({ onView, onCopy }) => {
  return (
    <div className="flex justify-end space-x-1">
      <Button 
        variant="ghost" 
        size="sm"
        className="h-8 text-xs"
        onClick={onView}
      >
        <Eye className="h-3 w-3 mr-1" />
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
