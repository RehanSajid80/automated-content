
import React from "react";
import { AlertCircle, Bug } from "lucide-react";

interface NoContentWarningProps {
  errorMessage?: string | null;
}

export const NoContentWarning: React.FC<NoContentWarningProps> = ({ errorMessage }) => {
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
          <li>Check console logs for API errors</li>
          <li>Verify webhook URLs are correct</li>
          <li>Try a different persona or goal</li>
          <li>Use the debug tools to view raw responses</li>
        </ul>
      </div>
    </div>
  );
};
