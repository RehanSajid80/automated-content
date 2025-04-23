
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ApiForm = () => {
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();

  const handleConnect = async () => {
    if (!apiUrl.trim()) {
      toast({
        title: "API URL Required",
        description: "Please enter your n8n API URL",
        variant: "destructive",
      });
      return;
    }

    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your n8n API key",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);

    try {
      const { data: authData } = await supabase.auth.getSession();
      
      if (!authData.session) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to save API connection",
          variant: "destructive",
        });
        setIsConnecting(false);
        return;
      }

      const token = authData.session.access_token;
      const response = await supabase.functions.invoke("manage-integrations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          name: "n8n API Connection",
          type: "api",
          config: {
            apiUrl,
            apiKey
          },
          is_active: true
        },
        method: "POST",
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: "Connection Successful",
        description: "Your n8n API connection has been saved securely",
      });

      // Clear the form
      setApiUrl("");
      setApiKey("");
    } catch (error) {
      console.error("Error saving n8n API connection:", error);
      toast({
        title: "Connection Failed",
        description: "There was an error saving your API connection",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
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
      
      <Button type="submit" variant="default" className="w-full mt-4" disabled={isConnecting}>
        {isConnecting ? (
          "Connecting..."
        ) : (
          <>Connect to n8n API <CheckCircle2 size={16} className="ml-2" /></>
        )}
      </Button>
    </form>
  );
};

export default ApiForm;
