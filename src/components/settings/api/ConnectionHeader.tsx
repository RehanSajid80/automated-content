
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

interface ConnectionHeaderProps {
  onResetConnections: () => void;
}

const ConnectionHeader: React.FC<ConnectionHeaderProps> = ({ onResetConnections }) => {
  return (
    <div className="mb-8">
      <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Link>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight mb-1">API Connections</h1>
          <p className="text-muted-foreground">
            Configure your integrations and API connections
          </p>
        </div>
        <Button variant="outline" onClick={onResetConnections}>
          Reset All Connections
        </Button>
      </div>
    </div>
  );
};

export default ConnectionHeader;
