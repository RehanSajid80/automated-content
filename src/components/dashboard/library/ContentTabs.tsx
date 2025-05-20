
import React from "react";
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContentTabsProps } from "../types/content-library";

const ContentTabs: React.FC<ContentTabsProps> = ({ activeTab, setActiveTab, contentTypes }) => {
  return (
    <TabsList className="mb-4 overflow-auto">
      {contentTypes.map(type => (
        <TabsTrigger 
          key={type.id} 
          value={type.id}
          onClick={() => setActiveTab(type.id)}
        >
          {type.label}
        </TabsTrigger>
      ))}
    </TabsList>
  );
};

export default ContentTabs;
