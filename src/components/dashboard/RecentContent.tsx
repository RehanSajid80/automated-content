
import React from "react";
import { FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { ContentListItem } from "./components/ContentListItem";
import { useRecentContent } from "./hooks/useRecentContent";

interface RecentContentProps {
  className?: string;
}

const RecentContent: React.FC<RecentContentProps> = ({ className }) => {
  const { recentContent, isLoading } = useRecentContent();
  const { toast } = useToast();

  const copyContent = async (contentId: string) => {
    try {
      const { data, error } = await supabase
        .from('content_library')
        .select('content')
        .eq('id', contentId)
        .single();

      if (error) throw error;

      if (data?.content) {
        await navigator.clipboard.writeText(data.content);
        toast({
          title: "Copied to clipboard",
          description: "Content copied successfully",
        });
      }
    } catch (error) {
      console.error("Error copying content:", error);
      toast({
        title: "Error",
        description: "Failed to copy content",
        variant: "destructive",
      });
    }
  };

  const viewLibrary = () => {
    const event = new CustomEvent('tab-change', { detail: { tab: 'content' } });
    window.dispatchEvent(event);
  };

  const viewContent = (contentId: string, topicArea: string) => {
    window.dispatchEvent(new CustomEvent('navigate-to-content-details', { 
      detail: { contentIds: [contentId], topicArea: topicArea || 'generated-content' } 
    }));
  };

  return (
    <div className={cn("rounded-xl border border-border bg-card p-6 animate-slide-up animation-delay-500", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold">Recent Content</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs"
          onClick={viewLibrary}
        >
          View Library <ArrowRight size={14} className="ml-1" />
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : recentContent.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <FileText className="mx-auto h-8 w-8 mb-2 opacity-50" />
          <p>No content created yet</p>
          <p className="text-sm mt-1">Use the content generator to create your first piece of content</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recentContent.map((content) => (
            <ContentListItem
              key={content.id}
              content={content}
              onCopy={copyContent}
              onClick={viewContent}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentContent;
