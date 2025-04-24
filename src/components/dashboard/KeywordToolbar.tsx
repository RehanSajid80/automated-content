
import React from 'react';
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SemrushIntegration from "./SemrushIntegration";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import WebhookForm from "./WebhookForm";

interface KeywordToolbarProps {
  searchTerm: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearData: () => void;
  onSemrushKeywords: (keywords: any[]) => void;
  isSyncingFromN8n: boolean;
  onN8nSync: (webhookUrl: string) => Promise<void>;
}

const KeywordToolbar: React.FC<KeywordToolbarProps> = ({
  searchTerm,
  onSearchChange,
  onClearData,
  onSemrushKeywords,
  isSyncingFromN8n,
  onN8nSync
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div className="relative w-full md:w-auto md:flex-1 max-w-lg">
        <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={onSearchChange}
          placeholder="Search for keywords..."
          className="pl-9 bg-secondary/50"
        />
      </div>
      <div className="flex gap-2 w-full md:w-auto">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs" 
          onClick={onClearData}
        >
          Reset Data
        </Button>
        <SemrushIntegration onKeywordsReceived={onSemrushKeywords} />
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-xs" disabled={isSyncingFromN8n}>
              {isSyncingFromN8n ? (
                <>
                  <span className="mr-2 animate-spin">⏳</span>
                  Syncing n8n...
                </>
              ) : (
                <>Sync from n8n</>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Sync Keywords from n8n</DialogTitle>
              <DialogDescription>
                Connect to your n8n workflow to sync SEMrush keyword data
              </DialogDescription>
            </DialogHeader>
            <WebhookForm onSync={onN8nSync} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default KeywordToolbar;
