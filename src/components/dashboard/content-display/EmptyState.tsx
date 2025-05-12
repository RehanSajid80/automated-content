
import React from "react";

interface EmptyStateProps {
  suggestions: any[];
  n8nError: string | null;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ suggestions, n8nError }) => {
  if (n8nError || suggestions.length > 0) return null;

  return (
    <div className="p-4 text-center border rounded-md bg-muted/20">
      <p className="text-muted-foreground">No content generated yet.</p>
      <p className="text-sm text-muted-foreground mt-1">
        Try adjusting your keywords or topic area and generate content again.
      </p>
    </div>
  );
};
