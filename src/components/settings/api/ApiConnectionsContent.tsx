
import React from "react";
import ApiUsageMetrics from "../ApiUsageMetrics";
import OpenAIConnection from "./OpenAIConnection";
import SemrushConnection from "./SemrushConnection";
import WebhookConnection from "./WebhookConnection";
import AdminSettings from "./AdminSettings";
import { useN8nConfig } from "@/hooks/useN8nConfig";

interface ApiConnectionsContentProps {
  openaiApiKey: string;
  openaiStatus: 'checking' | 'connected' | 'disconnected';
  onSaveOpenaiKey: () => void;
  onOpenaiKeyChange: (key: string) => void;
  activeWebhookType: 'content' | 'custom-keywords' | 'content-adjustment';
  onWebhookTypeChange: (type: 'content' | 'custom-keywords' | 'content-adjustment') => void;
  onSemrushConfigSave: () => void;
}

const ApiConnectionsContent: React.FC<ApiConnectionsContentProps> = ({
  openaiApiKey,
  openaiStatus,
  onSaveOpenaiKey,
  onOpenaiKeyChange,
  activeWebhookType,
  onWebhookTypeChange,
  onSemrushConfigSave
}) => {
  const { isAdmin } = useN8nConfig();

  return (
    <div className="space-y-6">
      <ApiUsageMetrics />
      {isAdmin && <AdminSettings />}
      <OpenAIConnection
        apiKey={openaiApiKey}
        status={openaiStatus}
        onSaveKey={onSaveOpenaiKey}
        onKeyChange={onOpenaiKeyChange}
      />
      <SemrushConnection onSaveConfig={onSemrushConfigSave} />
      <WebhookConnection
        activeWebhookType={activeWebhookType}
        onWebhookTypeChange={onWebhookTypeChange}
      />
    </div>
  );
};

export default ApiConnectionsContent;
