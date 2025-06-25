import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Database, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API_KEYS, saveApiKey, getApiKey } from "@/utils/apiKeyUtils";

interface SemrushConnectionProps {
  onSaveConfig?: () => void;
}

const SemrushConnection: React.FC<SemrushConnectionProps> = ({
  onSaveConfig
}) => {
  const [keywordLimit, setKeywordLimit] = useState(100);
  const [status, setStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [apiKey, setApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if SEMrush API key is configured
    checkSemrushConnection();
    loadKeywordLimit();
  }, []);

  const checkSemrushConnection = async () => {
    try {
      const savedKey = await getApiKey('semrush-api-key');
      if (savedKey) {
        setStatus('connected');
        setApiKey("••••••••••••••••••••••••••");
      } else {
        setStatus('disconnected');
      }
    } catch (error) {
      console.error('Error checking SEMrush connection:', error);
      setStatus('disconnected');
    }
  };

  const loadKeywordLimit = async () => {
    try {
      // Get global keyword limit first
      const globalLimit = await getApiKey('semrush-keyword-limit');
      if (globalLimit) {
        const parsedLimit = parseInt(globalLimit, 10);
        if (!isNaN(parsedLimit)) {
          setKeywordLimit(parsedLimit);
          return;
        }
      }
    } catch (error) {
      console.error('Error loading global keyword limit:', error);
    }
    
    // Fallback to localStorage
    const savedLimit = localStorage.getItem('semrush-keyword-limit');
    if (savedLimit) {
      setKeywordLimit(parseInt(savedLimit, 10));
    }
  };

  const handleSaveApiKey = async () => {
    if (!apiKey || apiKey === "••••••••••••••••••••••••••") {
      toast({
        title: "API Key Required",
        description: "Please enter a valid SEMrush API key",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await saveApiKey('semrush-api-key', apiKey, 'SEMrush');
      setStatus('connected');
      setApiKey("••••••••••••••••••••••••••");
      
      toast({
        title: "SEMrush API Key Saved Globally",
        description: "Your SEMrush API key has been saved and is now available to all users worldwide",
      });

      if (onSaveConfig) {
        onSaveConfig();
      }
    } catch (error) {
      console.error('Error saving SEMrush API key:', error);
      toast({
        title: "Error",
        description: "Failed to save SEMrush API key",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveKeywordLimit = async () => {
    try {
      // Save globally to database
      await saveApiKey('semrush-keyword-limit', keywordLimit.toString(), 'SEMrush-Settings');
      
      // Keep localStorage as backup
      localStorage.setItem('semrush-keyword-limit', keywordLimit.toString());
      
      toast({
        title: "Settings Saved Globally",
        description: "Keyword limit has been updated and is now available to all users worldwide",
      });
      
      if (onSaveConfig) {
        onSaveConfig();
      }
    } catch (error) {
      console.error('Error saving keyword limit:', error);
      // Fallback to localStorage only
      localStorage.setItem('semrush-keyword-limit', keywordLimit.toString());
      toast({
        title: "Settings Saved Locally",
        description: "Keyword limit has been updated (saved locally as backup)",
      });
    }
  };

  const renderStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <Badge variant="default" className="ml-2 bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="w-4 h-4 mr-1" />
            Connected Globally
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
          Global SEMrush Integration
          {renderStatusBadge()}
        </CardTitle>
        <CardDescription>
          Global SEMrush API integration for keyword research. Settings are shared across all users worldwide.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="semrush-api-key" className="text-sm font-medium">
            SEMrush API Key (Global)
          </Label>
          <div className="flex gap-2">
            <Input
              id="semrush-api-key"
              type="password"
              placeholder="Enter your SEMrush API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono text-sm"
            />
            <Button 
              onClick={handleSaveApiKey}
              disabled={isLoading || !apiKey || apiKey === "••••••••••••••••••••••••••"}
              variant="outline"
              size="sm"
            >
              {isLoading ? "Saving..." : "Save Globally"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            This API key will be used by all users worldwide. Find your API key in the 
            <a 
              href="https://www.semrush.com/api-analytics/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline ml-1"
            >
              SEMrush API dashboard
            </a>
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="keyword-limit" className="text-sm font-medium">
            Global Keyword Fetch Limit
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
              Save Globally
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Number of keywords to fetch globally for all users (10-500). This setting is shared worldwide.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default SemrushConnection;
