
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface GeneratedSQLDisplayProps {
  sql: string;
}

const GeneratedSQLDisplay: React.FC<GeneratedSQLDisplayProps> = ({ sql }) => {
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(sql);
      toast.success("SQL copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  if (!sql) return null;

  return (
    <div className="space-y-2">
      <Label>Generated SQL (Run this in the SQL Editor)</Label>
      <div className="relative">
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto whitespace-pre-wrap">
          {sql}
        </pre>
        <Button
          onClick={copyToClipboard}
          size="sm"
          variant="outline"
          className="absolute top-2 right-2"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        Copy this SQL and run it in the Supabase SQL Editor to update the admin domain.
      </p>
    </div>
  );
};

export default GeneratedSQLDisplay;
