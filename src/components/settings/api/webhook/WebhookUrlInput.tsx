
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface WebhookUrlInputProps {
  type: 'keywords' | 'content' | 'custom-keywords' | 'content-adjustment';
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const WebhookUrlInput: React.FC<WebhookUrlInputProps> = ({
  type,
  value,
  onChange,
  disabled = false
}) => {
  if (type === 'keywords') {
    return (
      <div className="space-y-2">
        <Label htmlFor="webhook-url" className="text-sm font-medium">
          Keyword Sync Webhook URL
        </Label>
        <Input
          id="webhook-url"
          placeholder="Enter your keyword sync webhook URL"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-sm"
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          This webhook will be used to sync keyword data with external services
        </p>
      </div>
    );
  } else if (type === 'content') {
    return (
      <div className="space-y-2">
        <Label htmlFor="content-webhook-url" className="text-sm font-medium">
          Content Generation Webhook URL
        </Label>
        <Input
          id="content-webhook-url"
          placeholder="Enter your content generation webhook URL"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-sm"
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          This webhook will be used for AI content generation
        </p>
      </div>
    );
  } else if (type === 'content-adjustment') {
    return (
      <div className="space-y-2">
        <Label htmlFor="content-adjustment-webhook-url" className="text-sm font-medium">
          Content Adjustment Webhook URL
        </Label>
        <Input
          id="content-adjustment-webhook-url"
          placeholder="Enter your content adjustment webhook URL"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-sm"
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          This webhook will receive content for AI-powered adjustments and return enhanced content
        </p>
      </div>
    );
  } else {
    return (
      <div className="space-y-2">
        <Label htmlFor="custom-keywords-webhook-url" className="text-sm font-medium">
          AI Content Suggestions Webhook URL
        </Label>
        <Input
          id="custom-keywords-webhook-url"
          placeholder="Enter your AI content suggestions webhook URL"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-sm"
          disabled={disabled}
        />
        <p className="text-xs text-muted-foreground">
          This webhook will be used to process user-entered custom keywords and generate content suggestions
        </p>
      </div>
    );
  }
};
