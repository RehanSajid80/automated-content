
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, RefreshCw, Check, X, Settings } from "lucide-react";
import { SidebarProvider, Sidebar } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface Integration {
  id: string;
  name: string;
  type: "api" | "webhook" | "ai-agent";
  is_active: boolean;
  created_at: string;
}

const IntegrationsManager = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"api" | "webhook" | "ai-agent">("api");
  const { toast } = useToast();

  // Form state
  const [integrationName, setIntegrationName] = useState("");
  const [integrationType, setIntegrationType] = useState<"api" | "webhook" | "ai-agent">("api");
  const [apiKey, setApiKey] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");

  const fetchIntegrations = async () => {
    setIsLoading(true);
    try {
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to manage integrations",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const token = authData.session.access_token;
      const response = await supabase.functions.invoke("manage-integrations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setIntegrations(response.data?.data || []);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      toast({
        title: "Error",
        description: "Failed to fetch integrations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleAddIntegration = async () => {
    setIsLoading(true);
    try {
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to add an integration",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Build config object based on integration type
      let config: Record<string, string> = {};
      switch (integrationType) {
        case "api":
          if (!apiKey || !apiUrl) {
            toast({
              title: "Missing fields",
              description: "Please fill in all required fields",
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
          config = { apiKey, apiUrl };
          break;
        case "webhook":
          if (!webhookUrl) {
            toast({
              title: "Missing webhook URL",
              description: "Please enter a webhook URL",
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
          config = { webhookUrl };
          break;
        case "ai-agent":
          if (!apiKey || !apiUrl) {
            toast({
              title: "Missing fields",
              description: "Please fill in all required fields",
              variant: "destructive",
            });
            setIsLoading(false);
            return;
          }
          config = { apiKey, apiUrl };
          break;
      }

      const token = authData.session.access_token;
      const response = await supabase.functions.invoke("manage-integrations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: {
          name: integrationName,
          type: integrationType,
          config,
          is_active: true
        },
        method: "POST",
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: "Integration added",
        description: `${integrationName} has been added successfully`,
      });

      // Reset form
      setIntegrationName("");
      setApiKey("");
      setApiUrl("");
      setWebhookUrl("");
      setIsDialogOpen(false);
      
      // Refresh integrations
      fetchIntegrations();
    } catch (error) {
      console.error("Error adding integration:", error);
      toast({
        title: "Error",
        description: "Failed to add integration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteIntegration = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete the integration "${name}"?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const { data: authData } = await supabase.auth.getSession();
      if (!authData.session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to delete an integration",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      const token = authData.session.access_token;
      const response = await supabase.functions.invoke("manage-integrations", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        queryParams: { id },
        method: "DELETE",
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      toast({
        title: "Integration deleted",
        description: `${name} has been removed`,
      });
      
      // Refresh integrations
      fetchIntegrations();
    } catch (error) {
      console.error("Error deleting integration:", error);
      toast({
        title: "Error",
        description: "Failed to delete integration",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredIntegrations = integrations.filter(integration => integration.type === activeTab);

  return (
    <div className="min-h-screen flex w-full">
      <SidebarProvider>
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 pt-6 max-w-5xl mx-auto w-full">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Dashboard
            </Link>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight mb-1">Integrations Manager</h1>
                <p className="text-muted-foreground">
                  Securely manage API keys, webhooks, and AI agent connections
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={fetchIntegrations} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Integration
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Integration</DialogTitle>
                      <DialogDescription>
                        Enter the details for your new integration. All API keys are stored securely.
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Name
                        </Label>
                        <Input
                          id="name"
                          value={integrationName}
                          onChange={(e) => setIntegrationName(e.target.value)}
                          placeholder="My Integration"
                          className="col-span-3"
                        />
                      </div>
                      
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="type" className="text-right">
                          Type
                        </Label>
                        <Select 
                          value={integrationType} 
                          onValueChange={(value) => setIntegrationType(value as any)}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select integration type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="api">API</SelectItem>
                            <SelectItem value="webhook">Webhook</SelectItem>
                            <SelectItem value="ai-agent">AI Agent</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {(integrationType === "api" || integrationType === "ai-agent") && (
                        <>
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="apiUrl" className="text-right">
                              API URL
                            </Label>
                            <Input
                              id="apiUrl"
                              value={apiUrl}
                              onChange={(e) => setApiUrl(e.target.value)}
                              placeholder="https://api.example.com"
                              className="col-span-3"
                            />
                          </div>
                          
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="apiKey" className="text-right">
                              API Key
                            </Label>
                            <Input
                              id="apiKey"
                              value={apiKey}
                              onChange={(e) => setApiKey(e.target.value)}
                              type="password"
                              placeholder="Enter API key"
                              className="col-span-3"
                            />
                          </div>
                        </>
                      )}
                      
                      {integrationType === "webhook" && (
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="webhookUrl" className="text-right">
                            Webhook URL
                          </Label>
                          <Input
                            id="webhookUrl"
                            value={webhookUrl}
                            onChange={(e) => setWebhookUrl(e.target.value)}
                            placeholder="https://hooks.example.com/webhook"
                            className="col-span-3"
                          />
                        </div>
                      )}
                    </div>
                    
                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="button" onClick={handleAddIntegration} disabled={isLoading}>
                        {isLoading ? "Adding..." : "Add Integration"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="mb-4">
              <TabsTrigger value="api">API Keys</TabsTrigger>
              <TabsTrigger value="webhook">Webhooks</TabsTrigger>
              <TabsTrigger value="ai-agent">AI Agents</TabsTrigger>
            </TabsList>
            
            <TabsContent value="api" className="space-y-4">
              {filteredIntegrations.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">No API integrations found</p>
                    <Button className="mt-4" variant="outline" onClick={() => setIsDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add API Integration
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredIntegrations.map((integration) => (
                  <Card key={integration.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <Badge variant={integration.is_active ? "success" : "secondary"}>
                          {integration.is_active ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <X className="h-3 w-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </Badge>
                      </div>
                      <CardDescription>
                        API Connection • Added {new Date(integration.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-between pt-3 border-t">
                      <p className="text-sm text-muted-foreground">API key stored securely</p>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteIntegration(integration.id, integration.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="webhook" className="space-y-4">
              {filteredIntegrations.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">No webhook integrations found</p>
                    <Button className="mt-4" variant="outline" onClick={() => setIsDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Webhook Integration
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredIntegrations.map((integration) => (
                  <Card key={integration.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <Badge variant={integration.is_active ? "success" : "secondary"}>
                          {integration.is_active ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <X className="h-3 w-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </Badge>
                      </div>
                      <CardDescription>
                        Webhook • Added {new Date(integration.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-between pt-3 border-t">
                      <p className="text-sm text-muted-foreground">Webhook URL stored securely</p>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteIntegration(integration.id, integration.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              )}
            </TabsContent>
            
            <TabsContent value="ai-agent" className="space-y-4">
              {filteredIntegrations.length === 0 ? (
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-muted-foreground">No AI agent integrations found</p>
                    <Button className="mt-4" variant="outline" onClick={() => setIsDialogOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add AI Agent Integration
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                filteredIntegrations.map((integration) => (
                  <Card key={integration.id}>
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <Badge variant={integration.is_active ? "success" : "secondary"}>
                          {integration.is_active ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <X className="h-3 w-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </Badge>
                      </div>
                      <CardDescription>
                        AI Agent • Added {new Date(integration.created_at).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="flex justify-between pt-3 border-t">
                      <p className="text-sm text-muted-foreground">API key stored securely</p>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteIntegration(integration.id, integration.name)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </main>
      </SidebarProvider>
    </div>
  );
};

export default IntegrationsManager;
