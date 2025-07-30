import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Brain, Database, Search, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface RAGStats {
  total_content: number;
  embedded_content: number;
  embedding_coverage: number;
}

interface SimilarContent {
  id: string;
  title: string;
  content_type: string;
  topic_area: string;
  similarity_score: number;
  excerpt: string;
}

export const RAGManagement: React.FC = () => {
  const [stats, setStats] = useState<RAGStats | null>(null);
  const [isGeneratingEmbeddings, setIsGeneratingEmbeddings] = useState(false);
  const [embeddingProgress, setEmbeddingProgress] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SimilarContent[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const loadStats = async () => {
    try {
      const { data: contentLibrary, error: contentError } = await supabase
        .from('content_library')
        .select('id')
        .neq('content', '');

      const { data: embeddings, error: embeddingError } = await supabase
        .from('content_embeddings')
        .select('content_id');

      if (contentError || embeddingError) {
        throw new Error('Failed to load stats');
      }

      const totalContent = contentLibrary?.length || 0;
      const embeddedContent = embeddings?.length || 0;
      const coverage = totalContent > 0 ? Math.round((embeddedContent / totalContent) * 100) : 0;

      setStats({
        total_content: totalContent,
        embedded_content: embeddedContent,
        embedding_coverage: coverage
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load RAG statistics",
        variant: "destructive",
      });
    }
  };

  const generateAllEmbeddings = async () => {
    setIsGeneratingEmbeddings(true);
    setEmbeddingProgress(0);

    try {
      const response = await supabase.functions.invoke('content-embeddings', {
        body: { action: 'bulk_generate' }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setEmbeddingProgress(100);
      toast({
        title: "Success",
        description: `Generated embeddings for ${response.data.processed} content pieces`,
      });

      // Reload stats after generation
      setTimeout(() => {
        loadStats();
      }, 1000);

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate embeddings",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingEmbeddings(false);
    }
  };

  const searchSimilarContent = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await supabase.functions.invoke('rag-content-search', {
        body: {
          query: searchQuery,
          content_type: 'all',
          limit: 10,
          similarity_threshold: 0.5
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setSearchResults(response.data.results || []);
      
      if (response.data.results?.length === 0) {
        toast({
          title: "No Results",
          description: "No similar content found. Try a different search term or generate embeddings first.",
        });
      }

    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Search failed",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  React.useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            RAG System Management
          </CardTitle>
          <CardDescription>
            Manage your content knowledge base and vector embeddings for AI-powered content generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="embeddings">Embeddings</TabsTrigger>
              <TabsTrigger value="search">Test Search</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {stats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Total Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.total_content}</div>
                      <p className="text-xs text-muted-foreground">Pieces in library</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Embedded Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.embedded_content}</div>
                      <p className="text-xs text-muted-foreground">Ready for RAG search</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Coverage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stats.embedding_coverage}%</div>
                      <Progress value={stats.embedding_coverage} className="mt-2" />
                    </CardContent>
                  </Card>
                </div>
              )}

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>How RAG Works:</strong> The system creates vector embeddings of your existing content, 
                  then finds similar examples when generating new content. This helps maintain your unique voice and style patterns.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="embeddings" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Generate Embeddings</h3>
                  <p className="text-sm text-muted-foreground">
                    Create vector embeddings for all content in your library
                  </p>
                </div>
                <Button 
                  onClick={generateAllEmbeddings}
                  disabled={isGeneratingEmbeddings}
                  className="flex items-center gap-2"
                >
                  <Database className="h-4 w-4" />
                  {isGeneratingEmbeddings ? 'Generating...' : 'Generate All'}
                </Button>
              </div>

              {isGeneratingEmbeddings && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 animate-pulse" />
                    <span className="text-sm">Processing content and generating embeddings...</span>
                  </div>
                  <Progress value={embeddingProgress} />
                </div>
              )}

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This process will analyze all content in your library and create vector embeddings. 
                  New content will automatically get embeddings when saved. This only needs to be run once for existing content.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="search" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Test RAG Search</h3>
                  <p className="text-sm text-muted-foreground">
                    Search your content library to see what similar content would be found
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search for content (e.g., 'office space management')"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchSimilarContent()}
                    className="flex-1 px-3 py-2 border border-input rounded-md"
                  />
                  <Button 
                    onClick={searchSimilarContent}
                    disabled={isSearching || !searchQuery.trim()}
                    className="flex items-center gap-2"
                  >
                    <Search className="h-4 w-4" />
                    {isSearching ? 'Searching...' : 'Search'}
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium">Similar Content Found:</h4>
                    {searchResults.map((result) => (
                      <Card key={result.id} className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h5 className="font-medium">{result.title}</h5>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{result.content_type}</Badge>
                              <Badge variant="outline">
                                {Math.round(result.similarity_score * 100)}% match
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground">{result.excerpt}</p>
                          {result.topic_area && (
                            <Badge variant="outline" className="text-xs">
                              {result.topic_area}
                            </Badge>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};