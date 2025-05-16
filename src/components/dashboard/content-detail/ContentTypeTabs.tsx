
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface ContentTypeTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  contentTypes: Record<string, string>;
  groupedContent: Record<string, any[]>;
}

export const ContentTypeTabs: React.FC<ContentTypeTabsProps> = ({
  activeTab,
  onTabChange,
  contentTypes,
  groupedContent,
  children,
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="mb-6">
      <TabsList className="w-full border-b rounded-none justify-start">
        <TabsTrigger value="all">All</TabsTrigger>
        {Object.keys(groupedContent).map(type => (
          <TabsTrigger key={type} value={type}>
            {contentTypes[type] || type}
          </TabsTrigger>
        ))}
      </TabsList>
      <TabsContent value={activeTab}>
        {children}
      </TabsContent>
    </Tabs>
  );
};
