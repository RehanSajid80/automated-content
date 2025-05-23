
import React from "react";
import { AlertCircle } from "lucide-react";

export const NoContentWarning: React.FC = () => {
  return (
    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-md">
      <div className="flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-amber-600" />
        <p className="text-sm text-amber-700 dark:text-amber-400">
          No processed content available
        </p>
      </div>
    </div>
  );
};
