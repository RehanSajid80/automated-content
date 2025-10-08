
import React from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface WebhookTypeSelectorProps {
  activeWebhookType: 'keywords' | 'content' | 'custom-keywords' | 'content-adjustment';
  onWebhookTypeChange: (type: 'keywords' | 'content' | 'custom-keywords' | 'content-adjustment') => void;
}

export const WebhookTypeSelector: React.FC<WebhookTypeSelectorProps> = ({
  activeWebhookType,
  onWebhookTypeChange
}) => {
  return (
    <RadioGroup 
      value={activeWebhookType} 
      onValueChange={(value) => onWebhookTypeChange(value as 'keywords' | 'content' | 'custom-keywords' | 'content-adjustment')}
      className="flex flex-col space-y-1 mb-4"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="content" id="content" />
        <Label htmlFor="content">Content Generation Webhook</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="custom-keywords" id="custom-keywords" />
        <Label htmlFor="custom-keywords">AI Content Suggestions Webhook</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="content-adjustment" id="content-adjustment" />
        <Label htmlFor="content-adjustment">Content Adjustment Webhook</Label>
      </div>
    </RadioGroup>
  );
};
