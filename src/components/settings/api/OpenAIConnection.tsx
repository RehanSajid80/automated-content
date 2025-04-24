
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Braces, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OpenAIConnectionProps {
  apiKey: string;
  status: 'checking' | 'connected' | 'disconnected';
  onSaveKey: (key: string) => void;
  onKeyChange: (key: string) => void;
}

const OpenAIConnection: React.FC<OpenAIConnectionProps> = ({
  apiKey,
  status,
  onSaveKey,
  onKeyChange,
}) => {
  const renderStatus = () => {
    switch (status) {
      case 'connected':
        return (
          <Badge variant="success" className="ml-2">
            <CheckCircle className="w-4 h-4 mr-1" />
            Connected
          </Badge>
        );
      case 'disconnected':
        return (
          <Badge variant="destructive" className="ml-2">
            <XCircle className="w-4 h-4 mr-1" />
            Not Connected
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="ml-2">
            Checking...
          </Badge>
        );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Braces className="h-5 w-5" />
          OpenAI API Connection
          {renderStatus()}
        </CardTitle>
        <CardDescription>
          Connect your OpenAI API for content generation features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="openai-api-key" className="text-sm font-medium">
            API Key
          </label>
          <Input
            id="openai-api-key"
            type="password"
            placeholder="Enter your OpenAI API key"
            value={apiKey}
            onChange={(e) => onKeyChange(e.target.value)}
            className="font-mono text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Your API key is stored securely. Find your API key in the 
            <a 
              href="https://platform.openai.com/api-keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline ml-1"
            >
              OpenAI dashboard
            </a>
          </p>
        </div>
        <Button onClick={() => onSaveKey(apiKey)} className="w-full sm:w-auto">
          Save API Key
        </Button>
      </CardContent>
    </Card>
  );
};

export default OpenAIConnection;
