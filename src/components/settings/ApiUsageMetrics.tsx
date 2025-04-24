
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, ArrowUpDown } from "lucide-react";
import { getOpenAIUsageMetrics } from "@/utils/openaiUtils";
import { Badge } from "@/components/ui/badge";

const ApiUsageMetrics = () => {
  const openAIMetrics = getOpenAIUsageMetrics();
  
  // Get SEMrush metrics from localStorage
  const getSemrushMetrics = () => {
    const metrics = localStorage.getItem('semrush-api-metrics');
    if (!metrics) {
      return {
        totalCalls: 0,
        successfulCalls: 0,
        failedCalls: 0,
        lastCall: null
      };
    }
    return JSON.parse(metrics);
  };

  const semrushMetrics = getSemrushMetrics();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            API Usage Metrics
          </CardTitle>
          <CardDescription>
            Track your API calls and usage across different services
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* OpenAI Metrics */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">OpenAI API Usage</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Calls</p>
                <p className="text-2xl font-bold">{openAIMetrics.totalCalls}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Successful</p>
                <p className="text-2xl font-bold text-green-600">{openAIMetrics.successfulCalls}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Failed</p>
                <p className="text-2xl font-bold text-red-600">{openAIMetrics.failedCalls}</p>
              </div>
            </div>
            {openAIMetrics.lastModelUsed && (
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  Last Model Used: {openAIMetrics.lastModelUsed}
                </Badge>
              </div>
            )}
          </div>

          {/* SEMrush Metrics */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">SEMrush API Usage</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Total Calls</p>
                <p className="text-2xl font-bold">{semrushMetrics.totalCalls}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Successful</p>
                <p className="text-2xl font-bold text-green-600">{semrushMetrics.successfulCalls}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Failed</p>
                <p className="text-2xl font-bold text-red-600">{semrushMetrics.failedCalls}</p>
              </div>
            </div>
            {semrushMetrics.lastCall && (
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  Last Call: {new Date(semrushMetrics.lastCall).toLocaleString()}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiUsageMetrics;
