
import { useEffect } from 'react';
import { clearCache } from "@/utils/contentLifecycleUtils";

interface UseNavigationEventsProps {
  onTabChange: (tab: string) => void;
  setSelectedTopicArea: (area: string | null) => void;
  setContentViewMode: (mode: "selection" | "detail") => void;
  setSelectedContentIds: (ids: string[]) => void;
}

export const useNavigationEvents = ({
  onTabChange,
  setSelectedTopicArea,
  setContentViewMode,
  setSelectedContentIds,
}: UseNavigationEventsProps) => {
  useEffect(() => {
    const handleNavigateToContent = (event: CustomEvent<{ topicArea: string }>) => {
      onTabChange('content');
      setSelectedTopicArea(event.detail.topicArea);
      setContentViewMode("selection");
      
      clearCache(`content_${event.detail.topicArea.toLowerCase().replace(/\s+/g, '_')}`);
    };
    
    const handleNavigateToTab = (event: CustomEvent<{ tab: string }>) => {
      onTabChange(event.detail.tab);
      if (event.detail.tab === 'dashboard') {
        setSelectedTopicArea(null);
      }
    };

    const handleNavigateToContentDetails = (event: CustomEvent<{ contentIds: string[], topicArea: string }>) => {
      onTabChange('content');
      setContentViewMode("detail");
      setSelectedContentIds(event.detail.contentIds);
      setSelectedTopicArea(event.detail.topicArea);
      
      clearCache(`content_detail_${event.detail.contentIds.sort().join('_')}`);
    };

    window.addEventListener('navigate-to-content', handleNavigateToContent as EventListener);
    window.addEventListener('navigate-to-tab', handleNavigateToTab as EventListener);
    window.addEventListener('navigate-to-content-details', handleNavigateToContentDetails as EventListener);
    
    return () => {
      window.removeEventListener('navigate-to-content', handleNavigateToContent as EventListener);
      window.removeEventListener('navigate-to-tab', handleNavigateToTab as EventListener);
      window.removeEventListener('navigate-to-content-details', handleNavigateToContentDetails as EventListener);
    };
  }, [onTabChange, setSelectedTopicArea, setContentViewMode, setSelectedContentIds]);
};
