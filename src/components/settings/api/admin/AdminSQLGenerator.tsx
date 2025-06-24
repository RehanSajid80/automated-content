
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Copy } from "lucide-react";
import { toast } from "sonner";

interface AdminSQLGeneratorProps {
  onSQLGenerated: (sql: string) => void;
}

const AdminSQLGenerator: React.FC<AdminSQLGeneratorProps> = ({ onSQLGenerated }) => {
  const [adminDomain, setAdminDomain] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const generateAdminSQL = () => {
    if (!adminDomain) {
      toast.error("Please enter a valid email domain");
      return;
    }

    // Validate domain format
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(adminDomain)) {
      toast.error("Please enter a valid domain (e.g., company.com)");
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

    onSQLGenerated(sql);
    toast.success("SQL generated! Copy and run it in the SQL Editor.");
  };

  return (
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
  );
};

export default AdminSQLGenerator;
