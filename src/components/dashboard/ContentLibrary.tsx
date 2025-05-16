
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ContentRefreshManager from "./ContentViewRefreshManager";
import SocialPostsTab from "./SocialPostsTab";
import GeneralContentTab from "./library/GeneralContentTab";
import { useContentLibrary } from "@/hooks/useContentLibrary";
import { 
  getIcon, 
  getTypeLabel, 
  getTypeClass, 
  formatDate 
} from "./library/ContentLibraryUtils";

interface ContentLibraryProps {
  className?: string;
}

const ContentLibrary: React.FC<ContentLibraryProps> = ({ className }) => {
  const {
    filteredItems,
    isLoading,
    isRefreshing,
    lastRefreshed,
    activeTab,
    searchTerm,
    setActiveTab,
    setSearchTerm,
    refreshContent,
    copyContent
  } = useContentLibrary();
  
  const [libraryView, setLibraryView] = useState("general");

  const viewContent = (contentId: string, topicArea: string) => {
    // Navigate to content details view
    window.dispatchEvent(new CustomEvent('navigate-to-content-details', { 
      detail: { 
        contentIds: [contentId], 
        topicArea: topicArea || 'generated-content' 
      } 
    }));
  };

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Content Library</h2>
        <ContentRefreshManager 
          isRefreshing={isRefreshing}
          onRefresh={refreshContent}
          lastRefreshed={lastRefreshed || undefined}
        />
      </div>
      
      <Tabs defaultValue="general" value={libraryView} onValueChange={setLibraryView}>
        <TabsList className="mb-4">
          <TabsTrigger value="general">General Content</TabsTrigger>
          <TabsTrigger value="social">Social Posts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <GeneralContentTab
            isLoading={isLoading}
            filteredItems={filteredItems}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            copyContent={copyContent}
            viewContent={viewContent}
            getIcon={getIcon}
            getTypeClass={getTypeClass}
            getTypeLabel={getTypeLabel}
            formatDate={formatDate}
          />
        </TabsContent>

        <TabsContent value="social">
          <SocialPostsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ContentLibrary;
