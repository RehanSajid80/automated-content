import React, { useState, useEffect } from "react";
import { Search, TrendingUp, ArrowRight, Upload, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { processExcelFile, KeywordData } from "@/utils/excelUtils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import KeywordFilters, { FilterOptions } from "./KeywordFilters";
import ContentSuggestions from "./ContentSuggestions";

const mockKeywords: KeywordData[] = [
  { keyword: "office space management software", volume: 5400, difficulty: 78, cpc: 14.5, trend: "up" },
  { keyword: "workspace management system", volume: 3800, difficulty: 65, cpc: 9.20, trend: "up" },
  { keyword: "office floor plan software", volume: 6200, difficulty: 72, cpc: 12.75, trend: "up" },
  { keyword: "desk booking system", volume: 7900, difficulty: 68, cpc: 11.50, trend: "up" },
  { keyword: "workplace analytics tools", volume: 2900, difficulty: 54, cpc: 8.80, trend: "neutral" },
  { keyword: "hybrid workplace management", volume: 4100, difficulty: 70, cpc: 13.25, trend: "up" },
  { keyword: "space utilization software", volume: 3200, difficulty: 62, cpc: 10.40, trend: "neutral" },
  { keyword: "office hoteling software", volume: 2800, difficulty: 55, cpc: 9.60, trend: "up" },
  { keyword: "facility management software", volume: 8500, difficulty: 85, cpc: 15.90, trend: "up" },
  { keyword: "room reservation system", volume: 5600, difficulty: 67, cpc: 10.20, trend: "neutral" },
];

const STORAGE_KEY = 'office-space-keywords';
const N8N_WEBHOOK_KEY = 'n8n-keyword-sync-webhook-url';

interface KeywordResearchProps {
  className?: string;
  onKeywordsSelected?: (keywords: string[]) => void;
  onKeywordDataUpdate?: (data: KeywordData[]) => void;
}

const KeywordResearch: React.FC<KeywordResearchProps> = ({ 
  className,
  onKeywordsSelected,
  onKeywordDataUpdate
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    searchTerm: "",
    minVolume: 0,
    maxVolume: 10000,
    minDifficulty: 0,
    maxDifficulty: 100,
    minCpc: 0,
    maxCpc: 20,
    trend: "all",
  });
  const [showContentSuggestions, setShowContentSuggestions] = useState(false);
  const [n8nDialogOpen, setN8nDialogOpen] = useState(false);
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState(() =>
    localStorage.getItem(N8N_WEBHOOK_KEY) || ""
  );
  const [isSyncingFromN8n, setIsSyncingFromN8n] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const savedKeywords = localStorage.getItem(STORAGE_KEY);
    if (savedKeywords) {
      try {
        const parsedKeywords = JSON.parse(savedKeywords) as KeywordData[];
        setKeywords(parsedKeywords);
        toast({
          title: "Keywords Loaded",
          description: `Loaded ${parsedKeywords.length} keywords from your saved data.`,
        });
      } catch (error) {
        console.error("Error loading saved keywords:", error);
        setKeywords(mockKeywords);
      }
    } else {
      setKeywords(mockKeywords);
    }
  }, [toast]);

  useEffect(() => {
    if (keywords.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(keywords));
    }
  }, [keywords]);

  useEffect(() => {
    if (onKeywordDataUpdate) {
      onKeywordDataUpdate(keywords);
    }
  }, [keywords, onKeywordDataUpdate]);

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilterOptions(newFilters);
    setSearchTerm(newFilters.searchTerm);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearchTerm = e.target.value;
    setSearchTerm(newSearchTerm);
    setFilterOptions({
      ...filterOptions,
      searchTerm: newSearchTerm
    });
  };

  const filteredKeywords = keywords.filter(kw => {
    const matchesSearch = kw.keyword.toLowerCase().includes(filterOptions.searchTerm.toLowerCase());
    const matchesVolume = kw.volume >= filterOptions.minVolume && kw.volume <= filterOptions.maxVolume;
    const matchesDifficulty = kw.difficulty >= filterOptions.minDifficulty && kw.difficulty <= filterOptions.maxDifficulty;
    const matchesCpc = kw.cpc >= filterOptions.minCpc && kw.cpc <= filterOptions.maxCpc;
    const matchesTrend = filterOptions.trend === "all" || kw.trend === filterOptions.trend;
    
    return matchesSearch && matchesVolume && matchesDifficulty && matchesCpc && matchesTrend;
  });

  const toggleKeywordSelection = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
    } else {
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
  };

  const handleGenerateContent = () => {
    if (selectedKeywords.length === 0) {
      return;
    }
    
    if (onKeywordsSelected) {
      onKeywordsSelected(selectedKeywords);
      toast({
        title: "Keywords transferred",
        description: `${selectedKeywords.length} keywords sent to Content Generator`,
      });
    }
  };

  const validateFile = (file: File): boolean => {
    const fileName = file.name.toLowerCase();
    const fileExtension = fileName.substring(fileName.lastIndexOf('.') + 1);
    const validExcelExtensions = ['xlsx', 'xls', 'csv'];
    
    if (!validExcelExtensions.includes(fileExtension)) {
      const errorMsg = `Invalid file extension: .${fileExtension}. Please use .xlsx, .xls, or .csv files.`;
      setImportError(errorMsg);
      toast({
        title: "Invalid File Format",
        description: errorMsg,
        variant: "destructive",
      });
      return false;
    }
    
    return true;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    const files = e.target.files;
    
    if (!files || files.length === 0) {
      return;
    }
    
    const file = files[0];
    
    if (!validateFile(file)) {
      e.target.value = '';
      return;
    }

    setIsImporting(true);
    
    try {
      const keywordData = await processExcelFile(file);
      setKeywords(keywordData);
      setImportDialogOpen(false);
      toast({
        title: "Import successful",
        description: `Imported ${keywordData.length} keywords from SEMrush`,
      });
    } catch (error) {
      console.error("Import failed:", error);
      setImportError(error instanceof Error ? error.message : "Failed to import keywords");
    } finally {
      setIsImporting(false);
      e.target.value = '';
    }
  };

  const handleN8nSync = async () => {
    if (!n8nWebhookUrl || n8nWebhookUrl.length < 8) {
      toast({
        title: "Enter Webhook URL",
        description: "Please enter your n8n Webhook URL.",
        variant: "destructive",
      });
      setN8nDialogOpen(true);
      return;
    }
    setIsSyncingFromN8n(true);
    setImportError(null);

    try {
      localStorage.setItem(N8N_WEBHOOK_KEY, n8nWebhookUrl);

      const resp = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trigger: "sync_keywords", source: "lovable" }),
      });

      if (!resp.ok) {
        throw new Error("n8n workflow did not respond successfully");
      }

      const data = await resp.json();
      if (!Array.isArray(data)) throw new Error("Unexpected n8n response");

      if (!data[0]?.keyword) throw new Error("No keyword data returned");

      setKeywords(data);
      toast({
        title: "Keywords Synced",
        description: `Imported ${data.length} keywords from n8n workflow.`,
      });
      setN8nDialogOpen(false);
    } catch (err: any) {
      setImportError(err.message || "Failed to sync keywords from n8n.");
      toast({
        title: "Sync failed",
        description: err.message || "Failed to sync keywords from n8n.",
        variant: "destructive",
      });
    } finally {
      setIsSyncingFromN8n(false);
    }
  };

  const clearKeywordData = () => {
    if (window.confirm("Are you sure you want to clear all keyword data? This cannot be undone.")) {
      localStorage.removeItem(STORAGE_KEY);
      setKeywords(mockKeywords);
      setSelectedKeywords([]);
      toast({
        title: "Data Cleared",
        description: "All keyword data has been reset to default values.",
      });
    }
  };

  return (
    <div className={cn("", className)}>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="relative w-full md:w-auto md:flex-1 max-w-lg">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={handleSearchInputChange}
            placeholder="Search for keywords..."
            className="pl-9 bg-secondary/50"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs" 
            onClick={clearKeywordData}
          >
            Reset Data
          </Button>
          <Dialog open={n8nDialogOpen} onOpenChange={setN8nDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs" disabled={isSyncingFromN8n}>
                {isSyncingFromN8n ? (
                  <>
                    <span className="mr-2 animate-spin">⏳</span>
                    Syncing n8n...
                  </>
                ) : (
                  <>Sync from n8n</>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Sync Keywords from n8n</DialogTitle>
                <DialogDescription>
                  Enter the n8n webhook URL that will return SEMrush keyword data.<br />
                  This should return a JSON array of keyword objects as shown below.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {importError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTitle>Sync Error</AlertTitle>
                    <AlertDescription>{importError}</AlertDescription>
                  </Alert>
                )}
                <Input
                  placeholder="https://your-n8n-instance.com/webhook/keywords"
                  value={n8nWebhookUrl}
                  onChange={(e) => setN8nWebhookUrl(e.target.value)}
                  disabled={isSyncingFromN8n}
                />
                <Button
                  onClick={handleN8nSync}
                  disabled={isSyncingFromN8n || !n8nWebhookUrl}
                  className="w-full"
                >
                  {isSyncingFromN8n ? "Syncing..." : "Sync Now"}
                </Button>
                <div className="text-[11px] text-muted-foreground mt-2">
                  <b>Expected response:</b>
                  <pre>
{`[
  { "keyword": "office space management software", "volume": 5400, "difficulty": 78, "cpc": 14.5, "trend": "up" }
]`}
                  </pre>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                Import from SEMrush <ArrowRight size={14} className="ml-1" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Import SEMrush Keywords</DialogTitle>
                <DialogDescription>
                  Export your data from SEMrush as Excel and upload it here
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {importError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTitle>Import Error</AlertTitle>
                    <AlertDescription>{importError}</AlertDescription>
                  </Alert>
                )}
                
                <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 text-center">
                  <FileSpreadsheet className="h-10 w-10 mx-auto mb-2 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Upload Excel File</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Export your data from SEMrush as Excel and upload it here
                  </p>
                  <label htmlFor="excel-upload" className="cursor-pointer">
                    <div className="bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded-md inline-flex items-center gap-2">
                      <Upload size={16} />
                      <span>{isImporting ? 'Importing...' : 'Upload Excel'}</span>
                    </div>
                    <input
                      id="excel-upload"
                      type="file"
                      accept=".xlsx,.xls,.csv"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isImporting}
                    />
                  </label>
                </div>
                
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium">Expected format:</p>
                  <p>Excel file with columns for Keyword, Volume, Difficulty, CPC, and Trend</p>
                  <p className="mt-2 font-medium">Accepted trend values:</p>
                  <p>Up, Increasing, Growth, Positive, Down, Decreasing, Decline, Negative, Neutral, Stable</p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-3">
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="bg-secondary/50 text-xs font-medium text-muted-foreground grid grid-cols-12 gap-4 px-4 py-3">
              <div className="col-span-1"></div>
              <div className="col-span-5">Keyword</div>
              <div className="col-span-2 text-right">Volume</div>
              <div className="col-span-2 text-right">Difficulty</div>
              <div className="col-span-2 text-right">CPC ($)</div>
            </div>
            
            <div className="divide-y divide-border max-h-[400px] overflow-y-auto">
              {filteredKeywords.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  No keywords match your filters
                </div>
              ) : (
                filteredKeywords.map((kw) => (
                  <div 
                    key={kw.keyword}
                    className={cn(
                      "grid grid-cols-12 gap-4 px-4 py-3 text-sm hover:bg-secondary/30 transition-colors cursor-pointer",
                      selectedKeywords.includes(kw.keyword) && "bg-secondary/50"
                    )}
                    onClick={() => toggleKeywordSelection(kw.keyword)}
                  >
                    <div className="col-span-1">
                      <input 
                        type="checkbox"
                        checked={selectedKeywords.includes(kw.keyword)}
                        onChange={(e) => {
                          e.stopPropagation();
                          toggleKeywordSelection(kw.keyword);
                        }}
                        className="rounded border-muted"
                      />
                    </div>
                    <div className="col-span-5 font-medium flex items-center">
                      {kw.keyword}
                      {kw.trend === "up" && (
                        <TrendingUp size={14} className="ml-2 text-green-500" />
                      )}
                    </div>
                    <div className="col-span-2 text-right">{kw.volume.toLocaleString()}</div>
                    <div className="col-span-2 text-right">
                      <div className="inline-flex items-center">
                        <div className="w-8 h-2 rounded-full bg-muted overflow-hidden mr-2">
                          <div 
                            className={cn(
                              "h-full",
                              kw.difficulty > 70 ? "bg-red-500" : 
                              kw.difficulty > 50 ? "bg-orange-500" : 
                              "bg-green-500"
                            )}
                            style={{ width: `${kw.difficulty}%` }}
                          ></div>
                        </div>
                        {kw.difficulty}
                      </div>
                    </div>
                    <div className="col-span-2 text-right">{kw.cpc.toFixed(2)}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <KeywordFilters onFiltersChange={handleFilterChange} />
        </div>
      </div>
      
      <div className="mt-4 flex flex-wrap justify-between items-center gap-4">
        <div className="text-sm text-muted-foreground">
          {selectedKeywords.length} keywords selected
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="sm" 
            className="text-xs"
            onClick={() => setShowContentSuggestions(!showContentSuggestions)}
          >
            {showContentSuggestions ? "Hide AI Suggestions" : "Show AI Suggestions"}
          </Button>
          <Button 
            size="sm" 
            disabled={selectedKeywords.length === 0}
            className="text-xs"
            onClick={handleGenerateContent}
          >
            Generate Content
          </Button>
        </div>
      </div>
      
      {showContentSuggestions && (
        <div className="mt-6">
          <ContentSuggestions keywords={keywords} />
        </div>
      )}
    </div>
  );
};

export default KeywordResearch;
