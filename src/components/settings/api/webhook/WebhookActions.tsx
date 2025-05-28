
import React from "react";
import { Button } from "@/components/ui/button";
import { Globe, RefreshCw } from "lucide-react";

interface WebhookActionsProps {
  onSave: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  activeWebhookType: 'keywords' | 'content' | 'custom-keywords' | 'content-adjustment';
}

export const WebhookActions: React.FC<WebhookActionsProps> = ({
  onSave,
  onRefresh,
  isLoading,
  activeWebhookType
}) => {
  return (
    <div className="flex gap-2">
      <Button 
        onClick={onSave} 
        className="w-full sm:w-auto" 
        disabled={isLoading}
      >
        <Globe className="mr-2 h-4 w-4" />
        Save Webhook URL
      </Button>
      <Button 
        onClick={onRefresh} 
        variant="outline" 
        className="w-full sm:w-auto" 
        disabled={isLoading}
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Refresh
      </Button>
    </div>
  );
};
