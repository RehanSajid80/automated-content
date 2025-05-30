
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Crown, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const AdminSettings = () => {
  const [adminDomain, setAdminDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: adminResult } = await supabase
        .rpc('is_admin', { user_id: user.id });

      setIsAdmin(adminResult || false);
    } catch (error) {
      console.error("Error checking admin status:", error);
    }
  };

  const updateAdminDomain = async () => {
    if (!adminDomain) {
      toast.error("Please enter a valid email domain");
      return;
    }

    setIsLoading(true);
    try {
      // Update the is_admin function with the new domain
      const { error } = await supabase.rpc('update_admin_domain', {
        new_domain: `%@${adminDomain}`
      });

      if (error) {
        throw error;
      }

      toast.success("Admin domain updated successfully");
      
      // Re-check admin status after update
      setTimeout(() => {
        checkAdminStatus();
      }, 1000);

    } catch (error) {
      console.error("Error updating admin domain:", error);
      toast.error("Failed to update admin domain. Please try using the SQL Editor.");
    } finally {
      setIsLoading(false);
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
              onClick={updateAdminDomain} 
              disabled={isLoading || !adminDomain}
            >
              {isLoading ? "Updating..." : "Update"}
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Users with emails ending in @{adminDomain || "yourdomain.com"} will have admin access.
          </p>
        </div>

        <Alert>
          <AlertDescription>
            <strong>Alternative Setup:</strong> You can also manually configure admin access using the SQL Editor.
            Replace the domain in the <code>is_admin</code> function or add specific email addresses.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default AdminSettings;
