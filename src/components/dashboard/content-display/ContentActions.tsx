
import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ContentActionsProps {
  content: string;
  section: string;
  onSave: () => Promise<void>;
}

export const ContentActions: React.FC<ContentActionsProps> = ({
  content,
  section,
  onSave,
}) => {
  const [isSaving, setIsSaving] = React.useState(false);

  const handleCopyContent = () => {
    try {
      navigator.clipboard.writeText(content);
      toast.success("Content copied to clipboard");
    } catch (err) {
      console.error("Failed to copy content:", err);
      toast.error("Failed to copy content");
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await onSave();
    } catch (err) {
      console.error("Error in ContentActions.handleSave:", err);
      toast.error("Failed to save content");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex space-x-2 mt-4">
      <Button variant="outline" onClick={handleCopyContent}>
        <Copy className="w-4 h-4 mr-2" /> Copy
      </Button>
      <Button onClick={handleSave} disabled={isSaving}>
        {isSaving ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-4 h-4 mr-2" />
            Save {section.charAt(0).toUpperCase() + section.slice(1)} Content
          </>
        )}
      </Button>
    </div>
  );
};
