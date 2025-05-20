
import { useState } from "react";
import { KeywordData } from "@/utils/excelUtils";
import { useToast } from "@/hooks/use-toast";

export const useN8nSync = (updateKeywords: (data: KeywordData[]) => void) => {
  const [isSyncingFromN8n, setIsSyncingFromN8n] = useState(false);
  const { toast } = useToast();

  const handleN8nSync = async (webhookUrl: string) => {
    if (!webhookUrl) {
      toast({
        title: "Enter Webhook URL",
        description: "Please enter your n8n Webhook URL.",
        variant: "destructive",
      });
      return;
    }

    setIsSyncingFromN8n(true);
    try {
      localStorage.setItem('n8n-keyword-sync-webhook-url', webhookUrl);
      const resp = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: "sync_keywords", source: "lovable" }),
      });

      if (!resp.ok) throw new Error("n8n workflow did not respond successfully");

      const data = await resp.json();
      if (!Array.isArray(data)) throw new Error("Unexpected n8n response");
      if (!data[0]?.keyword) throw new Error("No keyword data returned");

      updateKeywords(data);
      toast({
        title: "Keywords Synced",
        description: `Imported ${data.length} keywords from n8n workflow.`,
      });
    } catch (err: any) {
      toast({
        title: "Sync failed",
        description: err.message || "Failed to sync keywords from n8n.",
        variant: "destructive",
      });
    } finally {
      setIsSyncingFromN8n(false);
    }
  };

  return { isSyncingFromN8n, handleN8nSync };
};
