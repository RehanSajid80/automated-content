
import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from "@/hooks/use-toast";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import ContentRefreshManager from './ContentViewRefreshManager';

interface ContentDetailViewOptimizerProps {
  children: React.ReactNode;
  onBack: () => void;
  onRefresh: () => Promise<void>;
  isLoading: boolean;
  isRefreshing: boolean;
  lastRefreshed?: string;
  title: string;
}

/**
 * A wrapper component that provides consistent navigation, refresh functionality,
 * and loading indicators for content detail views
 */
const ContentDetailViewOptimizer: React.FC<ContentDetailViewOptimizerProps> = ({
  children,
  onBack,
  onRefresh,
  isLoading,
  isRefreshing,
  lastRefreshed,
  title
}) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onBack} 
            className="h-8"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to selection
          </Button>
          <div className="text-xl font-semibold ml-2">{title}</div>
        </div>
        
        <ContentRefreshManager 
          isRefreshing={isRefreshing}
          onRefresh={onRefresh}
          lastRefreshed={lastRefreshed}
        />
      </div>
      
      {children}
    </div>
  );
};

export default ContentDetailViewOptimizer;
