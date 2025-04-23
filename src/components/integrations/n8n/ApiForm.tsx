
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ApiForm = () => {
  const [apiUrl, setApiUrl] = useState(() => localStorage.getItem("n8n-api-url") || "");
  const [apiKey, setApiKey] = useState(() => {
    const savedKey = localStorage.getItem("n8n-api-key");
    return savedKey ? "••••••••••••••••" : "";
  });
  const { toast } = useToast();

  const handleConnect = () => {
    if (!apiUrl.trim()) {
      toast({
        title: "API URL Required",
        description: "Please enter your n8n API URL",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey.trim() || apiKey === "••••••••••••••••") {
      toast({
        title: "API Key Required",
        description: "Please enter your n8n API key",
        variant: "destructive",
      });
      return;
    }

    // Save to localStorage
    localStorage.setItem("n8n-api-url", apiUrl);
    
    // Only save the key if it's not the masked version
    if (apiKey !== "••••••••••••••••") {
      localStorage.setItem("n8n-api-key", apiKey);
      setApiKey("••••••••••••••••");
    }

    toast({
      title: "Connection Successful",
      description: "Your n8n API connection has been saved",
    });
  };

  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleConnect(); }}>
      <div className="space-y-2">
        <label htmlFor="apiUrl" className="text-sm font-medium">
          n8n API URL
        </label>
        <Input 
          id="apiUrl"
          placeholder="https://your-n8n-instance.com/api/"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
        />
      </div>
      
      <div className="space-y-2">
        <label htmlFor="apiKey" className="text-sm font-medium">
          n8n API Key
        </label>
        <Input 
          id="apiKey"
          type="password"
          placeholder="Your n8n API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Find your API key in n8n under Settings → API
        </p>
      </div>
      
      <Button type="submit" variant="default" className="w-full mt-4">
        Connect to n8n API <CheckCircle2 size={16} className="ml-2" />
      </Button>
    </form>
  );
};

export default ApiForm;
