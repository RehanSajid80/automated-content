
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAdminStatus } from "@/hooks/useAdminStatus";
import AdminSQLGenerator from "./admin/AdminSQLGenerator";
import GeneratedSQLDisplay from "./admin/GeneratedSQLDisplay";
import AdminStatusAlerts from "./admin/AdminStatusAlerts";

const AdminSettings = () => {
  const [generatedSQL, setGeneratedSQL] = useState("");
  const { isAdmin, functionExists } = useAdminStatus();

  const handleSQLGenerated = (sql: string) => {
    setGeneratedSQL(sql);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          Admin Settings
          {isAdmin && <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Admin</span>}
          {functionExists && <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">Function Active</span>}
        </CardTitle>
        <CardDescription>
          Configure admin access for webhook management. Users with emails from the specified domain will have admin privileges.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <AdminStatusAlerts functionExists={functionExists} />
        
        <AdminSQLGenerator onSQLGenerated={handleSQLGenerated} />
        
        <GeneratedSQLDisplay sql={generatedSQL} />

        <Alert>
          <AlertDescription>
            <strong>Next Steps:</strong> After running the SQL in the editor, refresh this page to see your admin status update.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default AdminSettings;
