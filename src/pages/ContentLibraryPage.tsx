
import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ContentLibrary from "@/components/dashboard/ContentLibrary";
import DashboardLayout from "@/components/layout/DashboardLayout";

const ContentLibraryPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeTab, setActiveTab] = useState("library");
  const { toast } = useToast();

  useEffect(() => {
    // Listen for content update events
    const handleContentUpdated = () => {
      setRefreshTrigger(prev => prev + 1);
    };
    
    window.addEventListener('content-updated', handleContentUpdated);
    
    return () => {
      window.removeEventListener('content-updated', handleContentUpdated);
    };
  }, []);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={handleTabChange}>
      <div className="container py-8 px-4 md:px-6 lg:px-8 max-w-full w-full">
        <DashboardHeader 
          title="Content Library"
          description="Browse and manage all your created content in one place"
        />
        
        <div className="rounded-xl border border-border bg-card p-6 w-full">
          <ContentLibrary key={`library-${refreshTrigger}`} className="w-full max-w-none" />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ContentLibraryPage;
