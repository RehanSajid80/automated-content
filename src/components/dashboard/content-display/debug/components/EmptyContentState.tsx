
import React from "react";

export const EmptyContentState: React.FC = () => {
  return (
    <div className="text-center p-4 border rounded-md bg-muted/30">
      <p className="text-muted-foreground">No content available to preview</p>
    </div>
  );
};
