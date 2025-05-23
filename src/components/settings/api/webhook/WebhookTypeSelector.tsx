
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface WebhookTypeSelectorProps {
  activeWebhookType: 'keywords' | 'content' | 'custom-keywords';
  onWebhookTypeChange: (type: 'keywords' | 'content' | 'custom-keywords') => void;
}

export const WebhookTypeSelector: React.FC<WebhookTypeSelectorProps> = ({
  activeWebhookType,
  onWebhookTypeChange
}) => {
  return (
    <RadioGroup 
      value={activeWebhookType} 
      onValueChange={(value) => onWebhookTypeChange(value as 'keywords' | 'content' | 'custom-keywords')}
      className="flex flex-col space-y-1 mb-4"
    >
      <div className="flex items-center space-x-2 opacity-50">
        <RadioGroupItem value="keywords" id="keywords" disabled />
        <Label htmlFor="keywords">Keyword Sync Webhook (Disabled for Testing)</Label>
      </div>
      <div className="flex items-center space-x-2 opacity-50">
        <RadioGroupItem value="content" id="content" disabled />
        <Label htmlFor="content">Content Generation Webhook (Disabled for Testing)</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="custom-keywords" id="custom-keywords" />
        <Label htmlFor="custom-keywords" className="font-bold">Get AI Content Suggestions (ACTIVE)</Label>
      </div>
    </RadioGroup>
  );
};
