
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2 } from "lucide-react";

const ApiForm = () => {
  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="apiUrl" className="text-sm font-medium">
          n8n API URL
        </label>
        <Input 
          id="apiUrl"
          placeholder="https://your-n8n-instance.com/api/"
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
        />
        <p className="text-xs text-muted-foreground">
          Find your API key in n8n under Settings → API
        </p>
      </div>
      
      <Button variant="default" className="w-full mt-4">
        Connect to n8n API <CheckCircle2 size={16} className="ml-2" />
      </Button>
    </form>
  );
};

export default ApiForm;
