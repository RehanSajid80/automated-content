
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Settings } from "lucide-react";

interface AdminStatusAlertsProps {
  functionExists: boolean;
}

const AdminStatusAlerts: React.FC<AdminStatusAlertsProps> = ({ functionExists }) => {
  return (
    <>
      {!functionExists && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Setup Required:</strong> The admin function needs to be created in your database. 
            Generate and run the SQL below to enable admin functionality.
          </AlertDescription>
        </Alert>
      )}

      <Alert>
        <Settings className="h-4 w-4" />
        <AlertDescription>
          Admins can create webhook configurations that are available to all users.
          Enter your organization's email domain (e.g., "company.com" for emails like admin@company.com).
        </AlertDescription>
      </Alert>
    </>
  );
};

export default AdminStatusAlerts;
