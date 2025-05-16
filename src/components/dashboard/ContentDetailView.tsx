
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import ContentDetailViewOptimizer from "./ContentDetailViewOptimizer";
import { ContentTypeTabs } from "./content-detail/ContentTypeTabs";
import { ContentTabDisplay } from "./content-detail/ContentTabDisplay";
import { ContentLoadingState } from "./content-detail/ContentLoadingState";
import { ContentEmptyState } from "./content-detail/ContentEmptyState";
import { useContentDetailData } from "@/hooks/useContentDetailData";

interface ContentDetailViewProps {
  contentIds: string[];
  topicArea: string;
  onBack: () => void;
}

const ContentDetailView: React.FC<ContentDetailViewProps> = ({ 
  contentIds, 
  topicArea,
  onBack
}) => {
  const {
    contentItems,
    groupedContent,
    activeTab,
    setActiveTab,
    isLoading,
    editingItem,
    setEditingItem,
    editedContent,
    editedTitle,
    isSaving,
    handleContentChange,
    handleTitleChange,
    saveContent,
    copyContent,
    loadContentItems
  } = useContentDetailData(contentIds);
  
  // Define content type labels for UI display
  const contentTypeLabels: Record<string, string> = {
    pillar: "Pillar Content",
    support: "Support Pages",
    meta: "Meta Tags",
    social: "Social Media Posts",
    all: "All Content"
  };

  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadContentItems();
    setIsRefreshing(false);
  };

  return (
    <ContentDetailViewOptimizer
      onBack={onBack}
      onRefresh={handleRefresh}
      isLoading={isLoading}
      isRefreshing={isRefreshing}
      title={topicArea}
    >
      {isLoading ? (
        <ContentLoadingState />
      ) : contentItems.length === 0 ? (
        <ContentEmptyState />
      ) : (
        <ContentTypeTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          contentTypes={contentTypeLabels}
          groupedContent={groupedContent}
        >
          <ContentTabDisplay
            activeTab={activeTab}
            groupedContent={groupedContent}
            contentTypeLabels={contentTypeLabels}
            editingItem={editingItem}
            isSaving={isSaving}
            editedContent={editedContent}
            editedTitle={editedTitle}
            handleContentChange={handleContentChange}
            handleTitleChange={handleTitleChange}
            saveContent={saveContent}
            copyContent={copyContent}
            setEditingItem={setEditingItem}
          />
        </ContentTypeTabs>
      )}
    </ContentDetailViewOptimizer>
  );
};

export default ContentDetailView;
