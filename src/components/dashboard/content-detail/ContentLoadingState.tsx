
import React from "react";
import { RefreshCw } from "lucide-react";

export const ContentLoadingState: React.FC = () => (
  <div className="flex justify-center items-center h-32">
    <RefreshCw className="h-6 w-6 animate-spin text-primary" />
  </div>
);
