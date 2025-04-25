
import React from "react";

interface LoadingStateProps {
  message?: string;
  submessage?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = "Processing your content...",
  submessage
}) => {
  return (
    <div className="p-8 flex flex-col justify-center items-center">
      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mb-3" />
      <span>{message}</span>
      {submessage && (
        <span className="text-sm text-muted-foreground mt-1">
          {submessage}
        </span>
      )}
    </div>
  );
};
