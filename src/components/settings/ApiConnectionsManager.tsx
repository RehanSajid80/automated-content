
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
  listApiKeys
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
  TrashIcon
} from "lucide-react";

interface ApiConnection {
  id: string;
  name: string;
  lastUpdated: string;
  hasKey: boolean;
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
  const { toast } = useToast();

  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = () => {
    const apiConnections = listApiKeys();
    setConnections(apiConnections);
  };

  const handleAddNew = () => {
    setCurrentConnectionId(API_KEYS.OPENAI);
    setConnectionName("OpenAI API");
    setApiKeyValue("");
    setIsDialogOpen(true);
  };

  const handleEditConnection = (connectionId: string) => {
    const connection = getApiKeyInfo(connectionId);
    if (connection) {
      setCurrentConnectionId(connectionId);
      setConnectionName(connection.name);
      setApiKeyValue(connection.key);
      setIsDialogOpen(true);
    }
  };

  const handleDeleteConnection = (connectionId: string) => {
    if (window.confirm("Are you sure you want to delete this API connection?")) {
      removeApiKey(connectionId);
      loadConnections();
      toast({
        title: "API Connection Removed",
        description: "Your API connection has been successfully removed.",
      });
    }
  };

  const handleSaveConnection = () => {
    if (!currentConnectionId || !apiKeyValue.trim()) {
      toast({
        title: "Error",
        description: "Please provide both a name and an API key value.",
        variant: "destructive",
      });
      return;
    }

    const existingConnection = getApiKeyInfo(currentConnectionId);
    if (existingConnection) {
      updateApiKey(currentConnectionId, apiKeyValue.trim(), connectionName);
    } else {
      saveApiKey(currentConnectionId, apiKeyValue.trim(), connectionName);
    }

    loadConnections();
    setIsDialogOpen(false);
    toast({
      title: "API Connection Saved",
      description: "Your API connection has been successfully saved.",
    });
  };

  const toggleApiKeyVisibility = () => {
    setIsApiKeyVisible(!isApiKeyVisible);
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
        <Button onClick={handleAddNew} variant="outline" size="sm">
          <PlusCircleIcon className="h-4 w-4 mr-2" />
          New Connection
        </Button>
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
                  <div className="text-sm text-muted-foreground">
                    <p><span className="font-medium">Name:</span> {connection.name}</p>
                    <p><span className="font-medium">Last Updated:</span> {formatDate(connection.lastUpdated)}</p>
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
              {getApiKeyInfo(currentConnectionId || "") ? "Update API Connection" : "Add API Connection"}
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
                Your API key is stored locally on your device and not sent to our servers
              </p>
            </div>
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
