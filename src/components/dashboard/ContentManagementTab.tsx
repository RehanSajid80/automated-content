import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { ContentSelectionView } from "@/components/dashboard/ContentSelectionView";
import ContentDetailView from "@/components/dashboard/ContentDetailView";
import ContentLibrary from "@/components/dashboard/ContentLibrary";
import ManualContentCreator from "@/components/dashboard/ManualContentCreator";
import RecentContent from "@/components/dashboard/RecentContent";
import ContentGenerator from "@/components/dashboard/ContentGenerator";

interface ContentManagementTabProps {
  selectedTopicArea: string | null;
  contentViewMode: "selection" | "detail" | "library";
  selectedContentIds: string[];
  selectedKeywords: string[];
  contentRefreshTrigger: number;
  onBack: () => void;
}

const ContentManagementTab: React.FC<ContentManagementTabProps> = ({
  selectedTopicArea,
  contentViewMode,
  selectedContentIds,
  selectedKeywords,
  contentRefreshTrigger,
  onBack
}) => {
  return (
    <TabsContent value="content" className="m-0">
      <div className="container py-8 px-4 md:px-6 lg:px-8">
        <DashboardHeader 
          title="Content Creation"
          description="Generate and manage content for your office space management platform"
        />
        
        <div className="space-y-8">
          {selectedTopicArea ? (
            <div className="rounded-xl border border-border bg-card p-6">
              {contentViewMode === "selection" ? (
                <ContentSelectionView 
                  topicArea={selectedTopicArea} 
                  key={`selection-${selectedTopicArea}-${contentRefreshTrigger}`}
                />
              ) : (
                <ContentDetailView 
                  contentIds={selectedContentIds}
                  topicArea={selectedTopicArea}
                  onBack={onBack}
                  key={`detail-${selectedContentIds.join('-')}-${contentRefreshTrigger}`}
                />
              )}
            </div>
          ) : contentViewMode === "library" ? (
            <div className="rounded-xl border border-border bg-card p-6">
              <ContentLibrary key={`library-${contentRefreshTrigger}`} />
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="text-lg font-semibold mb-4">Content Generator</h3>
                <ContentGenerator className="max-w-none" keywords={selectedKeywords} />
              </div>
              <ManualContentCreator />
              <RecentContent key={`recent-${contentRefreshTrigger}`} />
            </>
          )}
        </div>
      </div>
    </TabsContent>
  );
};

export default ContentManagementTab;
