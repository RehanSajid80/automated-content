import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, AlertTriangle, CheckCircle } from 'lucide-react';

interface SemrushStats {
  totalCalls: number;
  successfulCalls: number;
  failedCalls: number;
  totalCreditsUsed: number;
  lastCall: string | null;
}

const SemrushStatsCard: React.FC = () => {
  const getSemrushMetrics = (): SemrushStats => {
    const metrics = localStorage.getItem('semrush-api-metrics');
    if (!metrics) {
      return {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        totalCreditsUsed: 0,
        lastCall: null
      };
    }
    return JSON.parse(metrics);
  };

  const semrushMetrics = getSemrushMetrics();
  const successRate = semrushMetrics.totalCalls > 0 
    ? Math.round((semrushMetrics.successfulCalls / semrushMetrics.totalCalls) * 100)
    : 0;

  const getStatusColor = () => {
    if (semrushMetrics.totalCreditsUsed === 0) return "text-muted-foreground";
    if (semrushMetrics.totalCreditsUsed < 50) return "text-green-600";
    if (semrushMetrics.totalCreditsUsed < 100) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusIcon = () => {
    if (semrushMetrics.failedCalls > semrushMetrics.successfulCalls) {
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    }
    if (successRate >= 80) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <Database className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">SEMrush API Usage</CardTitle>
        {getStatusIcon()}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Credits Used</span>
            <span className={`text-lg font-bold ${getStatusColor()}`}>
              {semrushMetrics.totalCreditsUsed}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Success Rate</span>
            <span className="text-sm font-medium">
              {successRate}%
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs text-muted-foreground">Total Calls</span>
            <span className="text-sm font-medium">
              {semrushMetrics.totalCalls}
            </span>
          </div>
          
          {semrushMetrics.totalCreditsUsed > 0 && (
            <div className="pt-2">
              <Badge 
                variant={semrushMetrics.totalCreditsUsed < 50 ? "secondary" : "destructive"} 
                className="text-xs"
              >
                {semrushMetrics.totalCreditsUsed < 50 
                  ? "Efficient Usage" 
                  : "High Usage - Consider Caching"
                }
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SemrushStatsCard;