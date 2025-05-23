
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WebhookUrlInputProps {
  type: 'keywords' | 'content' | 'custom-keywords';
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
      <div className="space-y-2 opacity-50">
        <Label htmlFor="webhook-url" className="text-sm font-medium">
          Keyword Sync Webhook URL (Disabled for Testing)
        </Label>
        <Input
          id="webhook-url"
          placeholder="Enter your webhook URL"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-sm"
          disabled={true}
        />
        <p className="text-xs text-muted-foreground">
          This webhook will be used to sync data with external services
        </p>
      </div>
    );
  } else if (type === 'content') {
    return (
      <div className="space-y-2 opacity-50">
        <Label htmlFor="content-webhook-url" className="text-sm font-medium">
          Content Generation Webhook URL (Disabled for Testing)
        </Label>
        <Input
          id="content-webhook-url"
          placeholder="Enter your content generation webhook URL"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="font-mono text-sm"
          disabled={true}
        />
        <p className="text-xs text-muted-foreground">
          This webhook will be used for AI content generation
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
        <Alert variant="default" className="mt-4 bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
          <AlertDescription className="text-blue-800 dark:text-blue-400">
            For testing purposes, only the AI Content Suggestions webhook is active. Other webhooks are disabled.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
};
