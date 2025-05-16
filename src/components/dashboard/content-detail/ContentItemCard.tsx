
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Copy, Save, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContentItemCardProps {
  item: {
    id: string;
    title: string;
    content: string;
    created_at: string;
  };
  isEditing: boolean;
  isContentSaving: boolean;
  editedContent: string;
  editedTitle: string;
  onContentChange: (id: string, value: string) => void;
  onTitleChange: (id: string, value: string) => void;
  onSave: (id: string) => void;
  onCopy: (id: string) => void;
  onEdit: (id: string) => void;
  onCancelEdit: () => void;
}

export const ContentItemCard: React.FC<ContentItemCardProps> = ({
  item,
  isEditing,
  isContentSaving,
  editedContent,
  editedTitle,
  onContentChange,
  onTitleChange,
  onSave,
  onCopy,
  onEdit,
  onCancelEdit,
}) => {
  return (
    <Card
      className={cn(
        "transition-all duration-200",
        isEditing ? "border-primary" : ""
      )}
    >
      <CardHeader className="pb-2">
        {isEditing ? (
          <Input
            value={editedTitle}
            onChange={(e) => onTitleChange(item.id, e.target.value)}
            className="font-medium text-base"
            placeholder="Enter title"
          />
        ) : (
          <CardTitle className="text-base">{item.title || 'Untitled'}</CardTitle>
        )}
        <CardDescription className="text-xs flex justify-between items-center mt-1">
          <span>{new Date(item.created_at).toLocaleDateString()}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={editedContent}
              onChange={(e) => onContentChange(item.id, e.target.value)}
              className="min-h-[150px] resize-y"
              placeholder="Enter content"
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onCancelEdit}
                disabled={isContentSaving}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => onSave(item.id)}
                disabled={isContentSaving}
              >
                {isContentSaving ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="whitespace-pre-wrap text-sm">
              {item.content || 'No content available.'}
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(item.id)}
              >
                Edit
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onCopy(item.id)}
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
