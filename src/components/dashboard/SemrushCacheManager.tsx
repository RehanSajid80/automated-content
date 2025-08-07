import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Database, Download, Trash2, Calendar, Tag } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

interface CachedKeywordData {
  id: string;
  keyword: string;
  volume: number;
  cpc: number;
  difficulty: number;
  cache_key: string;
  topic_area: string;
  domain: string;
  created_at: string;
  updated_at: string;
}

interface CacheGroup {
  cache_key: string;
  topic_area: string;
  domain: string;
  keyword_count: number;
  created_at: string;
  keywords: CachedKeywordData[];
}

const SemrushCacheManager: React.FC = () => {
  const [cacheGroups, setCacheGroups] = useState<CacheGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  const fetchCachedData = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('semrush_keywords')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Group keywords by cache_key
      const grouped = data.reduce((acc: Record<string, CacheGroup>, keyword) => {
        const key = keyword.cache_key;
        if (!acc[key]) {
          acc[key] = {
            cache_key: key,
            topic_area: keyword.topic_area || 'general',
            domain: keyword.domain || 'N/A',
            keyword_count: 0,
            created_at: keyword.created_at,
            keywords: []
          };
        }
        acc[key].keywords.push(keyword);
        acc[key].keyword_count += 1;
        return acc;
      }, {});

      setCacheGroups(Object.values(grouped));
    } catch (error) {
      console.error('Error fetching cached data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch cached keyword data",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteCacheGroup = async (cacheKey: string) => {
    try {
      const { error } = await supabase
        .from('semrush_keywords')
        .delete()
        .eq('cache_key', cacheKey);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Cache group deleted successfully"
      });

      fetchCachedData(); // Refresh the list
    } catch (error) {
      console.error('Error deleting cache group:', error);
      toast({
        title: "Error",
        description: "Failed to delete cache group",
        variant: "destructive"
      });
    }
  };

  const exportKeywords = (group: CacheGroup) => {
    const csvContent = [
      ['Keyword', 'Volume', 'CPC', 'Difficulty', 'Topic Area', 'Domain'].join(','),
      ...group.keywords.map(k => [
        k.keyword,
        k.volume,
        k.cpc,
        k.difficulty,
        k.topic_area,
        k.domain
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `semrush-keywords-${group.cache_key}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getTotalKeywords = () => {
    return cacheGroups.reduce((total, group) => total + group.keyword_count, 0);
  };

  const getEstimatedCreditsSaved = () => {
    // Assuming each cache group represents 1 API call that would cost 1 credit
    return cacheGroups.length;
  };

  useEffect(() => {
    fetchCachedData();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          SEMrush Data Cache
        </CardTitle>
        <CardDescription>
          Manage cached keyword data to minimize API calls and save credits
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold">{cacheGroups.length}</div>
              <div className="text-sm text-muted-foreground">Cache Groups</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{getTotalKeywords()}</div>
              <div className="text-sm text-muted-foreground">Total Keywords</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{getEstimatedCreditsSaved()}</div>
              <div className="text-sm text-muted-foreground">Credits Saved</div>
            </div>
          </div>

          {/* Cache Groups List */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-4">Loading cached data...</div>
            ) : cacheGroups.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No cached data found. Keyword data will be automatically cached after SEMrush API calls.
              </div>
            ) : (
              cacheGroups.map((group) => (
                <div key={group.cache_key} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        <Tag className="h-3 w-3 mr-1" />
                        {group.topic_area}
                      </Badge>
                      <Badge variant="outline">
                        {group.domain}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {group.keyword_count} keywords
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => exportKeywords(group)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCacheGroup(group.cache_key)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Cached: {new Date(group.created_at).toLocaleDateString()}
                    </div>
                    <div>
                      Cache Key: {group.cache_key}
                    </div>
                  </div>

                  {selectedGroup === group.cache_key && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="text-sm font-medium mb-2">Keywords in this cache:</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                        {group.keywords.map((keyword) => (
                          <div key={keyword.id} className="text-xs p-2 bg-muted rounded">
                            <div className="font-medium">{keyword.keyword}</div>
                            <div className="text-muted-foreground">
                              Vol: {keyword.volume} | CPC: ${keyword.cpc} | Diff: {keyword.difficulty}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedGroup(
                      selectedGroup === group.cache_key ? null : group.cache_key
                    )}
                    className="mt-2"
                  >
                    {selectedGroup === group.cache_key ? 'Hide' : 'Show'} Keywords
                  </Button>
                </div>
              ))
            )}
          </div>

          <Button onClick={fetchCachedData} variant="outline" className="w-full">
            Refresh Cache Data
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SemrushCacheManager;