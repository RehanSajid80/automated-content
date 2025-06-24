
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users } from "lucide-react";

const GlobalConfigAlert: React.FC = () => {
  return (
    <Alert className="mb-6">
      <Users className="h-4 w-4" />
      <AlertDescription>
        <strong>Global Configuration Center:</strong> API keys and webhooks configured here are shared across ALL users and devices. 
        No sign-in required - settings are instantly available to everyone using this application worldwide.
      </AlertDescription>
    </Alert>
  );
};

export default GlobalConfigAlert;
