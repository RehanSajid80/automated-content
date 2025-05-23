
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle } from "lucide-react";

interface WebhookStatusBadgeProps {
  status: 'checking' | 'connected' | 'disconnected';
}

export const WebhookStatusBadge: React.FC<WebhookStatusBadgeProps> = ({ status }) => {
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
