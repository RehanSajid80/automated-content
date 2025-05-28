
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Database, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

interface SemrushConnectionProps {
  onSaveConfig?: () => void;
}

const SemrushConnection: React.FC<SemrushConnectionProps> = ({
  onSaveConfig
}) => {
  const [keywordLimit, setKeywordLimit] = useState(100);
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [maskedApiKey, setMaskedApiKey] = useState("");

  useEffect(() => {
    // Check if SEMrush API key is configured
    checkSemrushConnection();
    loadKeywordLimit();
  }, []);

  const checkSemrushConnection = () => {
    // Check if we have any SEMrush metrics (indicating the API key works)
    const metrics = localStorage.getItem('semrush-api-metrics');
    if (metrics) {
      const parsedMetrics = JSON.parse(metrics);
      if (parsedMetrics.successfulCalls > 0) {
        setStatus('connected');
        setMaskedApiKey("••••••••••••••••••••••••••");
      } else {
        setStatus('disconnected');
      }
    } else {
      setStatus('disconnected');
    }
  };

  const loadKeywordLimit = () => {
    const savedLimit = localStorage.getItem('semrush-keyword-limit');
    if (savedLimit) {
      setKeywordLimit(parseInt(savedLimit, 10));
    }
  };

  const handleSaveKeywordLimit = () => {
    localStorage.setItem('semrush-keyword-limit', keywordLimit.toString());
    if (onSaveConfig) {
      onSaveConfig();
    }
  };

  const renderStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <Badge variant="default" className="ml-2 bg-green-100 text-green-800 border-green-200">
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
          <Database className="h-5 w-5" />
          SEMrush Integration
          {renderStatusBadge()}
        </CardTitle>
        <CardDescription>
          SEMrush API integration for keyword research and competitive analysis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="semrush-api-key" className="text-sm font-medium">
            SEMrush API Key
          </Label>
          <Input
            id="semrush-api-key"
            placeholder="API key is managed via Supabase secrets"
            value={maskedApiKey}
            className="font-mono text-sm"
            disabled={true}
          />
          <p className="text-xs text-muted-foreground">
            SEMrush API key is securely managed through Supabase edge functions
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="keyword-limit" className="text-sm font-medium">
            Keyword Fetch Limit
          </Label>
          <div className="flex gap-2">
            <Input
              id="keyword-limit"
              type="number"
              min="10"
              max="500"
              value={keywordLimit}
              onChange={(e) => setKeywordLimit(parseInt(e.target.value, 10) || 100)}
              className="max-w-32"
            />
            <Button 
              onClick={handleSaveKeywordLimit}
              variant="outline"
              size="sm"
            >
              <Settings className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Number of keywords to fetch when using "Fetch Keywords" (10-500)
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SemrushConnection;
