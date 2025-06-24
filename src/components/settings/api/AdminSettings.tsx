
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Crown, Settings, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminSettings = () => {
  const [adminDomain, setAdminDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [generatedSQL, setGeneratedSQL] = useState("");

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // For now, we'll default to false since we don't have is_admin function yet
      // Users will need to run the SQL to create the function first
      setIsAdmin(false);
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  const generateAdminSQL = () => {
    if (!adminDomain) {
      toast.error("Please enter a valid email domain");
      return;
    }

    const sql = `CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = user_id 
    AND email LIKE '%@${adminDomain}'
  );
$$;`;

    setGeneratedSQL(sql);
    toast.success("SQL generated! Copy and run it in the SQL Editor.");
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(generatedSQL);
      toast.success("SQL copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          Admin Settings
          {isAdmin && <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Admin</span>}
        </CardTitle>
        <CardDescription>
          Configure admin access for webhook management. Users with emails from the specified domain will have admin privileges.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <Settings className="h-4 w-4" />
          <AlertDescription>
            Admins can create webhook configurations that are available to all users.
            Enter your organization's email domain (e.g., "company.com" for emails like admin@company.com).
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="admin-domain">Admin Email Domain</Label>
          <div className="flex gap-2">
            <div className="flex-1 flex items-center">
              <span className="text-sm text-muted-foreground mr-1">@</span>
              <Input
                id="admin-domain"
                value={adminDomain}
                onChange={(e) => setAdminDomain(e.target.value)}
                placeholder="company.com"
                className="flex-1"
              />
            </div>
            <Button 
              onClick={generateAdminSQL} 
              disabled={isLoading || !adminDomain}
            >
              Generate SQL
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Users with emails ending in @{adminDomain || "yourdomain.com"} will have admin access.
          </p>
        </div>

        {generatedSQL && (
          <div className="space-y-2">
            <Label>Generated SQL (Run this in the SQL Editor)</Label>
            <div className="relative">
              <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto whitespace-pre-wrap">
                {generatedSQL}
              </pre>
              <Button
                onClick={copyToClipboard}
                size="sm"
                variant="outline"
                className="absolute top-2 right-2"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Copy this SQL and run it in the Supabase SQL Editor to update the admin domain.
            </p>
          </div>
        )}

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
