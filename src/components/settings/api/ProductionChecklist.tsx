
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, XCircle, AlertTriangle, Rocket } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface ProductionChecklistProps {
  checks: {
    database: boolean;
    authentication: boolean;
    apiKeys: boolean;
    webhooks: boolean;
    admin: boolean;
  };
}

const ProductionChecklist: React.FC<ProductionChecklistProps> = ({ checks }) => {
  const totalChecks = Object.values(checks).length;
  const passedChecks = Object.values(checks).filter(Boolean).length;
  const isReady = passedChecks === totalChecks;

  const checkItems = [
    {
      key: 'database',
      label: 'Database Connected',
      description: 'Supabase database is properly configured',
      status: checks.database
    },
    {
      key: 'authentication',
      label: 'Authentication Setup',
      description: 'User authentication is working',
      status: checks.authentication
    },
    {
      key: 'apiKeys',
      label: 'API Keys Secured',
      description: 'API keys are encrypted and stored securely',
      status: checks.apiKeys
    },
    {
      key: 'webhooks',
      label: 'Webhook Configuration',
      description: 'Webhook endpoints are configured and accessible',
      status: checks.webhooks
    },
    {
      key: 'admin',
      label: 'Admin Functions',
      description: 'Admin functions are properly set up',
      status: checks.admin
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Rocket className="h-5 w-5" />
          Production Readiness
          {isReady ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
              Ready
            </Badge>
          ) : (
            <Badge variant="destructive">
              {passedChecks}/{totalChecks} Complete
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Review these items before deploying to production
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {checkItems.map((item) => (
          <div key={item.key} className="flex items-start gap-3 p-3 rounded-lg border">
            {item.status ? (
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
            )}
            <div className="flex-1">
              <div className="font-medium">{item.label}</div>
              <div className="text-sm text-muted-foreground">{item.description}</div>
            </div>
          </div>
        ))}
        
        {isReady ? (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-800">Ready for Production!</span>
            </div>
            <p className="text-sm text-green-700 mt-1">
              All systems are configured and ready for deployment.
            </p>
          </div>
        ) : (
          <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span className="font-medium text-yellow-800">Action Required</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Complete the remaining items before deploying to production.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductionChecklist;
