
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
  LoaderIcon
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

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
    description: "Used for AI content suggestions and keyword analysis",
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
  const { toast } = useToast();

  useEffect(() => {
    // Check if Supabase is connected
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
          <Button onClick={handleAddNew} variant="outline" size="sm">
            <PlusCircleIcon className="h-4 w-4 mr-2" />
            New Connection
          </Button>
        </div>
      </div>

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
    </div>
  );
};

export default ApiConnectionsManager;
