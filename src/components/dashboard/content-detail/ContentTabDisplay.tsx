
import React from "react";
import { RefreshCw } from "lucide-react";
import { ContentItemCard } from "./ContentItemCard";

interface ContentItem {
  id: string;
  title: string;
  content: string;
  content_type: string;
  created_at: string;
}

interface ContentDisplayProps {
  activeTab: string;
  groupedContent: Record<string, ContentItem[]>;
  contentTypeLabels: Record<string, string>;
  editingItem: string | null;
  isSaving: {[key: string]: boolean};
  editedContent: {[key: string]: string};
  editedTitle: {[key: string]: string};
  handleContentChange: (id: string, value: string) => void;
  handleTitleChange: (id: string, value: string) => void;
  saveContent: (id: string) => void;
  copyContent: (id: string) => void;
  setEditingItem: (id: string | null) => void;
}

export const ContentTabDisplay: React.FC<ContentDisplayProps> = ({
  activeTab,
  groupedContent,
  contentTypeLabels,
  editingItem,
  isSaving,
  editedContent,
  editedTitle,
  handleContentChange,
  handleTitleChange,
  saveContent,
  copyContent,
  setEditingItem,
}) => {
  if (activeTab === "all") {
    return (
      <>
        {Object.entries(groupedContent).map(([type, items]) => (
          <div key={type} className="mb-8">
            <h3 className="text-lg font-medium mb-4">{contentTypeLabels[type] || type}</h3>
            <div className="space-y-4">
              {items.map(item => (
                <ContentItemCard
                  key={item.id}
                  item={item}
                  isEditing={editingItem === item.id}
                  isContentSaving={isSaving[item.id] || false}
                  editedContent={editedContent[item.id] || ''}
                  editedTitle={editedTitle[item.id] || ''}
                  onContentChange={handleContentChange}
                  onTitleChange={handleTitleChange}
                  onSave={saveContent}
                  onCopy={copyContent}
                  onEdit={(id) => setEditingItem(id)}
                  onCancelEdit={() => setEditingItem(null)}
                />
              ))}
            </div>
          </div>
        ))}
      </>
    );
  }
  
  return (
    <div className="space-y-4">
      {(groupedContent[activeTab] || []).map(item => (
        <ContentItemCard
          key={item.id}
          item={item}
          isEditing={editingItem === item.id}
          isContentSaving={isSaving[item.id] || false}
          editedContent={editedContent[item.id] || ''}
          editedTitle={editedTitle[item.id] || ''}
          onContentChange={handleContentChange}
          onTitleChange={handleTitleChange}
          onSave={saveContent}
          onCopy={copyContent}
          onEdit={(id) => setEditingItem(id)}
          onCancelEdit={() => setEditingItem(null)}
        />
      ))}
    </div>
  );
};
