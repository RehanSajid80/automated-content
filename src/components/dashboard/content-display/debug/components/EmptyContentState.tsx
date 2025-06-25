
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileX } from "lucide-react";

export const EmptyContentState: React.FC = () => {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <FileX className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Available</h3>
        <p className="text-gray-500">
          Click "Create Content" on any suggestion above to generate content that will appear here.
        </p>
      </CardContent>
    </Card>
  );
};
