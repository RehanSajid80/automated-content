
import React from "react";
import { AlertCircle, Bug, RefreshCw, Code, FileCode } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoContentWarningProps {
  errorMessage?: string | null;
  onRefresh?: () => void;
}

export const NoContentWarning: React.FC<NoContentWarningProps> = ({ 
  errorMessage,
  onRefresh 
}) => {
  return (
    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md space-y-3">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <p className="text-sm text-amber-700 dark:text-amber-400">
          No processed content available
        </p>
      </div>
      
      {errorMessage && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm space-y-2">
          <div className="flex items-center gap-2">
            <Bug className="h-4 w-4 text-red-600" />
            <p className="font-medium text-red-600 dark:text-red-400">API Error Detected</p>
          </div>
          <p className="text-red-600 dark:text-red-400 pl-6">{errorMessage}</p>
        </div>
      )}
      
      <div className="text-sm text-amber-700 dark:text-amber-400 space-y-2 pt-2">
        <p>Try the following:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Check if the JSON response is correctly formatted</li>
          <li className="font-medium">Look for content wrapped in code blocks (```json...```) - this is the most common issue</li>
          <li>Click "Process Raw Response" to try to extract content from the raw API response</li>
          <li>Verify webhook URLs are correct</li>
          <li>Use the debug tools to view and process raw responses</li>
        </ul>
      </div>
      
      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded text-sm space-y-2">
        <div className="flex items-center gap-2">
          <Code className="h-4 w-4 text-blue-600" />
          <p className="font-medium text-blue-600 dark:text-blue-400">Debugging Tip</p>
        </div>
        <p className="text-blue-600 dark:text-blue-400 pl-6">
          If your content is wrapped in code blocks, manually process it using the "Process Raw Response" button in the debug tools.
        </p>
      </div>
      
      <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded text-sm">
        <div className="flex items-center gap-2">
          <FileCode className="h-4 w-4 text-green-600" />
          <p className="font-medium text-green-600 dark:text-green-400">Content Structure Example</p>
        </div>
        <pre className="text-xs text-green-600 dark:text-green-400 pl-6 mt-2 whitespace-pre-wrap">
{`{
  "pillarContent": "Your main article content...",
  "supportContent": "Supporting article content...",
  "socialMediaPosts": ["Post 1", "Post 2"],
  "emailSeries": [
    { "subject": "Email subject", "body": "Email body" }
  ]
}`}
        </pre>
      </div>
      
      {onRefresh && (
        <div className="pt-3">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={onRefresh}
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </div>
      )}
    </div>
  );
};
