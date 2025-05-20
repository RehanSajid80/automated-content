
import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import ContentLibrary from "@/components/dashboard/ContentLibrary";

const ContentLibraryPage = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
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

  return (
    <div className="container py-8 px-4 md:px-6 lg:px-8">
      <DashboardHeader 
        title="Content Library"
        description="Browse and manage all your created content in one place"
      />
      
      <div className="rounded-xl border border-border bg-card p-6">
        <ContentLibrary key={`library-${refreshTrigger}`} className="max-w-none" />
      </div>
    </div>
  );
};

export default ContentLibraryPage;
