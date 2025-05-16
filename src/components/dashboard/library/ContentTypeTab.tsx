
import React from "react";
import { TabsTrigger } from "@/components/ui/tabs";

interface ContentTypeProps {
  id: string;
  label: string;
}

interface ContentTypeTabsProps {
  contentTypes: ContentTypeProps[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const ContentTypeTab: React.FC<ContentTypeTabsProps> = ({
  contentTypes,
  activeTab,
  setActiveTab,
}) => {
  return (
    <div className="mb-4 overflow-auto">
      {contentTypes.map(type => (
        <TabsTrigger 
          key={type.id} 
          value={type.id}
          onClick={() => setActiveTab(type.id)}
          className={activeTab === type.id ? "bg-primary/10" : ""}
        >
          {type.label}
        </TabsTrigger>
      ))}
    </div>
  );
};

export default ContentTypeTab;
