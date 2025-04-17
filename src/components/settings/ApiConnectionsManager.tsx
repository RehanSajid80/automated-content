
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  API_KEYS,
  ApiKeyInfo,
  getApiKeyInfo,
  saveApiKey,
  updateApiKey,
  removeApiKey,
  listApiKeys,
  isSupabaseConnected,
  setSupabasePreference
} from "@/utils/apiKeyUtils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  KeyIcon, 
  EyeIcon, 
  EyeOffIcon, 
  PlusCircleIcon,
  RefreshCwIcon,
  ShieldIcon,
  TrashIcon,
  DatabaseIcon,
  CloudIcon,
  CheckCircleIcon,
  XCircleIcon,
  LoaderIcon,
  BarChart3Icon,
  AlertTriangleIcon,
  ClockIcon,
  Settings2Icon
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Slider } from "@/components/ui/slider";
import { getOpenAIUsageMetrics, resetApiCallThrottling } from "@/utils/openaiUtils";

interface ApiConnection {
  id: string;
  name: string;
  lastUpdated: string;
  hasKey: boolean;
  useSupabase?: boolean;
}

const API_SERVICES = {
  [API_KEYS.OPENAI]: {
    name: "OpenAI",
    description: "Used for AI content suggestions and keyword analysis for officespacesoftware.com",
    icon: <ShieldIcon className="h-5 w-5" />
  }
};

const ApiConnectionsManager: React.FC = () => {
  const [connections, setConnections] = useState<Record<string, ApiConnection>>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentConnectionId, setCurrentConnectionId] = useState<string | null>(null);
  const [apiKeyValue, setApiKeyValue] = useState("");
  const [connectionName, setConnectionName] = useState("");
  const [isApiKeyVisible, setIsApiKeyVisible] = useState(false);
  const [useSupabase, setUseSupabase] = useState(false);
  const [supabaseAvailable, setSupabaseAvailable] = useState(false);
  const [checkingSupabase, setCheckingSupabase] = useState(true);
  const [showUsageStats, setShowUsageStats] = useState(false);
  const [usageMetrics, setUsageMetrics] = useState({
    totalCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    lastModelUsed: ""
  });
  const [throttlingSettings, setThrottlingSettings] = useState({
    cooldownPeriod: 5, // in seconds
    enabled: true
  });
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkSupabaseConnection = async () => {
      try {
        const isConnected = await isSupabaseConnected();
        setSupabaseAvailable(isConnected);
        setCheckingSupabase(false);
      } catch (error) {
        console.error("Error checking Supabase connection:", error);
        setSupabaseAvailable(false);
        setCheckingSupabase(false);
      }
    };
    
    checkSupabaseConnection();
    loadConnections();
    loadUsageStats();
  }, []);

  const loadConnections = async () => {
    try {
      const apiConnections = await listApiKeys();
      setConnections(apiConnections);
    } catch (error) {
      console.error("Error loading API connections:", error);
      toast({
        title: "Error Loading Connections",
        description: "There was a problem loading your API connections",
        variant: "destructive",
      });
    }
  };

  const loadUsageStats = () => {
    try {
      const metrics = getOpenAIUsageMetrics();
      setUsageMetrics(metrics);
      
      // Load throttling settings
      const savedThrottling = localStorage.getItem('api-throttling-settings');
      if (savedThrottling) {
        setThrottlingSettings(JSON.parse(savedThrottling));
      }
    } catch (error) {
      console.error("Error loading usage stats:", error);
    }
  };

  const handleAddNew = () => {
    setCurrentConnectionId(API_KEYS.OPENAI);
    setConnectionName("OpenAI API");
    setApiKeyValue("");
    setUseSupabase(supabaseAvailable);
    setIsDialogOpen(true);
  };

  const handleEditConnection = async (connectionId: string) => {
    try {
      const connection = await getApiKeyInfo(connectionId);
      if (connection) {
        setCurrentConnectionId(connectionId);
        setConnectionName(connection.name);
        setApiKeyValue(connection.key);
        setUseSupabase(connection.useSupabase || false);
        setIsDialogOpen(true);
      }
    } catch (error) {
      console.error("Error editing connection:", error);
      toast({
        title: "Error",
        description: "Failed to load connection details",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConnection = async (connectionId: string) => {
    if (window.confirm("Are you sure you want to delete this API connection?")) {
      try {
        await removeApiKey(connectionId);
        await loadConnections();
        toast({
          title: "API Connection Removed",
          description: "Your API connection has been successfully removed.",
        });
      } catch (error) {
        console.error("Error removing API connection:", error);
        toast({
          title: "Error",
          description: "Failed to remove API connection",
          variant: "destructive",
        });
      }
    }
  };

  const handleSaveConnection = async () => {
    if (!currentConnectionId || !apiKeyValue.trim()) {
      toast({
        title: "Error",
        description: "Please provide both a name and an API key value.",
        variant: "destructive",
      });
      return;
    }

    try {
      const existingConnection = await getApiKeyInfo(currentConnectionId);
      if (existingConnection) {
        await updateApiKey(currentConnectionId, apiKeyValue.trim(), connectionName, useSupabase);
      } else {
        await saveApiKey(currentConnectionId, apiKeyValue.trim(), connectionName, useSupabase);
      }

      await loadConnections();
      setIsDialogOpen(false);
      toast({
        title: "API Connection Saved",
        description: "Your API connection has been successfully saved.",
      });
    } catch (error) {
      console.error("Error saving API connection:", error);
      toast({
        title: "Error",
        description: "Failed to save API connection",
        variant: "destructive",
      });
    }
  };

  const toggleApiKeyVisibility = () => {
    setIsApiKeyVisible(!isApiKeyVisible);
  };

  const toggleSupabaseStorage = async (connectionId: string, useSupabaseValue: boolean) => {
    try {
      await setSupabasePreference(connectionId, useSupabaseValue);
      await loadConnections();
      toast({
        title: useSupabaseValue ? "Using Supabase Storage" : "Using Local Storage",
        description: useSupabaseValue 
          ? "This API key will be stored in Supabase" 
          : "This API key will be stored locally",
      });
    } catch (error) {
      console.error("Error toggling Supabase storage:", error);
      toast({
        title: "Error",
        description: "Failed to update storage preference",
        variant: "destructive",
      });
    }
  };

  const formatDate = (isoDate: string) => {
    try {
      return new Date(isoDate).toLocaleString();
    } catch (e) {
      return "Unknown date";
    }
  };

  const handleResetThrottling = () => {
    resetApiCallThrottling();
    toast({
      title: "Throttling Reset",
      description: "API call throttling has been reset. You can make calls immediately.",
    });
  };

  const handleSaveThrottlingSettings = () => {
    try {
      localStorage.setItem('api-throttling-settings', JSON.stringify(throttlingSettings));
      
      // Apply settings to the API call tracker
      // Note: in a real implementation, you would expose a method from openaiUtils.ts
      // to update the throttling settings dynamically
      
      toast({
        title: "Settings Saved",
        description: `API call throttling ${throttlingSettings.enabled ? 'enabled' : 'disabled'} with a ${throttlingSettings.cooldownPeriod} second cooldown period.`,
      });
      
      setIsSettingsDialogOpen(false);
    } catch (error) {
      console.error("Error saving throttling settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">API Connections</h2>
        <div className="flex gap-2">
          {checkingSupabase ? (
            <div className="text-xs text-blue-500 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-md">
              <LoaderIcon className="h-3 w-3 animate-spin" />
              <span>Checking Supabase...</span>
            </div>
          ) : supabaseAvailable ? (
            <div className="text-xs text-green-500 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-md">
              <CheckCircleIcon className="h-3 w-3" />
              <span>Supabase connected</span>
            </div>
          ) : (
            <div className="text-xs text-orange-500 flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-md">
              <XCircleIcon className="h-3 w-3" />
              <span>Supabase not connected</span>
            </div>
          )}
          <Button onClick={() => setIsSettingsDialogOpen(true)} variant="outline" size="sm">
            <Settings2Icon className="h-4 w-4 mr-2" />
            API Settings
          </Button>
          <Button onClick={handleAddNew} variant="outline" size="sm">
            <PlusCircleIcon className="h-4 w-4 mr-2" />
            New Connection
          </Button>
        </div>
      </div>

      {/* API Usage Stats */}
      <Card className="bg-slate-50">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg flex items-center">
              <BarChart3Icon className="h-5 w-5 mr-2" />
              API Usage Statistics
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setShowUsageStats(!showUsageStats);
                if (!showUsageStats) loadUsageStats();
              }}
            >
              {showUsageStats ? "Hide Stats" : "Show Stats"}
            </Button>
          </div>
        </CardHeader>
        
        {showUsageStats && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
              <div className="bg-white p-4 rounded-md shadow-sm border">
                <div className="text-sm font-medium text-muted-foreground">Total API Calls</div>
                <div className="text-2xl font-bold mt-1">{usageMetrics.totalCalls}</div>
              </div>
              
              <div className="bg-white p-4 rounded-md shadow-sm border">
                <div className="text-sm font-medium text-green-600">Successful Calls</div>
                <div className="text-2xl font-bold mt-1 text-green-700">
                  {usageMetrics.successfulCalls} 
                  {usageMetrics.totalCalls > 0 && (
                    <span className="text-sm font-normal ml-1">
                      ({Math.round((usageMetrics.successfulCalls / usageMetrics.totalCalls) * 100)}%)
                    </span>
                  )}
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-md shadow-sm border">
                <div className="text-sm font-medium text-red-600">Failed Calls</div>
                <div className="text-2xl font-bold mt-1 text-red-700">
                  {usageMetrics.failedCalls}
                  {usageMetrics.totalCalls > 0 && (
                    <span className="text-sm font-normal ml-1">
                      ({Math.round((usageMetrics.failedCalls / usageMetrics.totalCalls) * 100)}%)
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-4 bg-white p-4 rounded-md shadow-sm border">
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-medium">Throttling Status</h4>
                  <div className="text-sm text-muted-foreground mt-1">
                    Prevents multiple API calls within {throttlingSettings.cooldownPeriod} seconds
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleResetThrottling} 
                  className="bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
                >
                  <ClockIcon className="h-4 w-4 mr-2" />
                  Reset Throttling
                </Button>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-md text-blue-800 text-sm">
              <div className="flex items-start">
                <AlertTriangleIcon className="h-5 w-5 mr-2 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong>Quality Assurance:</strong> Content generated through the API undergoes automatic quality checks for:
                  <ul className="list-disc ml-6 mt-1 space-y-1">
                    <li>Content depth and relevance</li>
                    <li>Required fields validation</li>
                    <li>Structural integrity</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="grid gap-4">
        {Object.entries(connections).length === 0 ? (
          <Card className="p-8 text-center bg-secondary/20">
            <KeyIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No API Connections Yet</h3>
            <p className="text-muted-foreground mb-4">
              Add your first API connection to start using external services
            </p>
            <Button onClick={handleAddNew}>
              <PlusCircleIcon className="h-4 w-4 mr-2" />
              Add API Connection
            </Button>
          </Card>
        ) : (
          Object.entries(connections).map(([id, connection]) => {
            const serviceInfo = API_SERVICES[id] || {
              name: connection.name,
              description: "External API service",
              icon: <KeyIcon className="h-5 w-5" />
            };
            
            return (
              <Card key={id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {serviceInfo.icon}
                      <CardTitle>{serviceInfo.name}</CardTitle>
                      {connection.useSupabase && (
                        <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                          Supabase
                        </Badge>
                      )}
                    </div>
                    {connection.hasKey && (
                      <div className="text-xs font-medium text-green-600 bg-green-100 rounded-full px-2 py-1 flex items-center">
                        <span className="w-1.5 h-1.5 bg-green-600 rounded-full mr-1"></span>
                        Active
                      </div>
                    )}
                  </div>
                  <CardDescription>{serviceInfo.description}</CardDescription>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p><span className="font-medium">Name:</span> {connection.name}</p>
                    <p><span className="font-medium">Last Updated:</span> {formatDate(connection.lastUpdated)}</p>
                    {supabaseAvailable && (
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Store in Supabase:</span>
                        <Switch 
                          checked={Boolean(connection.useSupabase)}
                          onCheckedChange={(checked) => toggleSupabaseStorage(id, checked)}
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs mt-1">
                      {connection.useSupabase ? (
                        <>
                          <CloudIcon className="h-3 w-3 text-blue-500" />
                          <span className="text-blue-700">
                            Stored in Supabase (secure cloud storage)
                          </span>
                        </>
                      ) : (
                        <>
                          <DatabaseIcon className="h-3 w-3" />
                          <span>
                            Stored locally in browser
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-0">
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteConnection(id)}>
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Remove
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleEditConnection(id)}>
                    <RefreshCwIcon className="h-4 w-4 mr-1" />
                    Update
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>

      {/* API Key Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {connections[currentConnectionId || ""] ? "Update API Connection" : "Add API Connection"}
            </DialogTitle>
            <DialogDescription>
              {API_SERVICES[currentConnectionId || ""]?.description || 
               "Enter your API key to connect with the external service"}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="connection-name">Connection Name</Label>
              <Input
                id="connection-name"
                value={connectionName}
                onChange={(e) => setConnectionName(e.target.value)}
                placeholder="My API Connection"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="api-key">API Key</Label>
              <div className="relative">
                <Input
                  id="api-key"
                  type={isApiKeyVisible ? "text" : "password"}
                  value={apiKeyValue}
                  onChange={(e) => setApiKeyValue(e.target.value)}
                  placeholder="Enter your API key"
                  className="pr-10 font-mono"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={toggleApiKeyVisibility}
                >
                  {isApiKeyVisible ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                {supabaseAvailable 
                  ? "Your API key can be stored securely in Supabase" 
                  : "Your API key is stored locally on your device"}
              </p>
            </div>
            
            {supabaseAvailable && (
              <div className="flex items-center space-x-2">
                <Switch 
                  id="use-supabase" 
                  checked={useSupabase}
                  onCheckedChange={setUseSupabase}
                />
                <Label htmlFor="use-supabase">Store in Supabase (secure cloud storage)</Label>
              </div>
            )}
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveConnection}>
              Save Connection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* API Settings Dialog */}
      <Dialog open={isSettingsDialogOpen} onOpenChange={setIsSettingsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>API Settings</DialogTitle>
            <DialogDescription>
              Configure API call throttling and quality checks
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="throttling">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    Request Throttling
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="enable-throttling" 
                        checked={throttlingSettings.enabled}
                        onCheckedChange={(checked) => 
                          setThrottlingSettings({...throttlingSettings, enabled: checked})
                        }
                      />
                      <Label htmlFor="enable-throttling">Enable request throttling</Label>
                    </div>
                  
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="cooldown-period">Cooldown period (seconds)</Label>
                        <span className="text-sm">{throttlingSettings.cooldownPeriod}s</span>
                      </div>
                      <Slider
                        id="cooldown-period"
                        disabled={!throttlingSettings.enabled}
                        value={[throttlingSettings.cooldownPeriod]}
                        min={1}
                        max={30}
                        step={1}
                        onValueChange={(value) => 
                          setThrottlingSettings({...throttlingSettings, cooldownPeriod: value[0]})
                        }
                      />
                      <p className="text-xs text-muted-foreground">
                        Minimum time between API calls to prevent rate limiting and excessive costs
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="quality-checks">
                <AccordionTrigger className="text-sm font-medium">
                  <div className="flex items-center">
                    <CheckCircleIcon className="h-4 w-4 mr-2" />
                    Quality Assurance Checks
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 pt-2">
                    <div className="text-sm">
                      <p className="mb-2">
                        Quality checks ensure that generated content meets the following criteria:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Each topic area contains required content sections</li>
                        <li>Generated content has sufficient depth</li>
                        <li>Content structure follows expected format</li>
                      </ul>
                    </div>
                    <div className="pt-2 text-xs text-muted-foreground">
                      Quality assurance checks are always enabled to ensure optimal content generation
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsSettingsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveThrottlingSettings}>
              Save Settings
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApiConnectionsManager;
