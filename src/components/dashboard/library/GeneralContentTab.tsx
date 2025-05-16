
import React from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ContentSearchBar from "./ContentSearchBar";
import ContentTypeTab from "./ContentTypeTab";
import ContentItemList from "./ContentItemList";
import { contentTypes } from "./ContentLibraryUtils";

interface ContentItemProps {
  id: string;
  title: string;
  content_type: string;
  topic_area: string | null;
  created_at: string;
  updated_at: string;
  keywords: string[];
  is_saved: boolean;
}

interface GeneralContentTabProps {
  isLoading: boolean;
  filteredItems: ContentItemProps[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  copyContent: (contentId: string) => void;
  viewContent: (contentId: string, topicArea: string) => void;
  getIcon: (type: string) => JSX.Element;
  getTypeClass: (type: string) => string;
  getTypeLabel: (type: string) => string;
  formatDate: (dateString: string) => string;
}

const GeneralContentTab: React.FC<GeneralContentTabProps> = ({
  isLoading,
  filteredItems,
  searchTerm,
  setSearchTerm,
  activeTab,
  setActiveTab,
  copyContent,
  viewContent,
  getIcon,
  getTypeClass,
  getTypeLabel,
  formatDate
}) => {
  return (
    <>
      <div className="flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4 mb-4">
        <ContentSearchBar 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />
        
        <Button variant="outline" className="shrink-0">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>
      
      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4 overflow-auto">
          {contentTypes.map(type => (
            <TabsTrigger key={type.id} value={type.id}>
              {type.label}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <ContentItemList
          isLoading={isLoading}
          filteredItems={filteredItems}
          copyContent={copyContent}
          viewContent={viewContent}
          getIcon={getIcon}
          getTypeClass={getTypeClass}
          getTypeLabel={getTypeLabel}
          formatDate={formatDate}
          searchTerm={searchTerm}
        />
      </Tabs>
    </>
  );
};

export default GeneralContentTab;
